# 13. End-to-End System Workflows

This document traces the complete end-to-end execution workflows across the PrepAI platform. Each workflow provides a chronological, step-by-step breakdown starting from the candidate or administrator action in the browser UI, through the frontend services, network calls, Express middleware, controllers, business services, AI/external provider interactions, Prisma database mutations, and the final state updates rendered on the screen.

---

## Workflow 1: Student Registration, Email Verification & First Login

```
[Candidate Browser]
       │
       ▼ (1) POST /api/auth/register { email, password, name, department, semester }
[Rate Limiter & Zod Validation Middleware]
       │
       ▼ (2) auth.controller.ts: register
[auth.service.ts]
  ├── (3) Hash password via bcrypt (10 rounds)
  ├── (4) Generate random 32-byte crypto verification token
  ├── (5) prisma.user.create() + prisma.studentProfile.create()
  └── (6) nodemailer.sendMail(verificationLink)
       │
       ▼ (7) Email Delivered with Token Link
[Candidate clicks email link]
       │
       ▼ (8) GET /api/auth/verify-email?token=<token>
[auth.controller.ts: verifyEmail]
  ├── (9) Find user by verificationToken
  └── (10) prisma.user.update({ isEmailVerified: true, verificationToken: null })
       │
       ▼ (11) Redirect to /login with Success Message
[Candidate submits credentials]
       │
       ▼ (12) POST /api/auth/login { email, password }
[auth.service.ts: loginUser]
  ├── (13) Verify password with bcrypt.compare()
  ├── (14) Check isEmailVerified === true
  ├── (15) Issue Access Token (15m JWT)
  ├── (16) Issue Refresh Token (7d, SHA-256 hashed in DB)
  └── (17) Set HttpOnly cookie + Return User Profile & Access Token
       │
       ▼ (18) React AuthContext stores user & redirects to /dashboard
```

### Detailed Trace Steps:
1. **Frontend Initiation**: Candidate fills out `RegisterPage.tsx` with name, MANIT scholar email (`@manit.ac.in`), password, engineering department (`CSE`, `ECE`, `EE`, or `ME`), and semester (`1-8`).
2. **Network Request**: Axios sends `POST /api/auth/register`.
3. **Middleware**: `authRateLimiter` ensures client hasn't exceeded 10 registration attempts per hour. `validate(registerSchema)` validates email format, password complexity (min 8 characters, number, special character).
4. **Service Logic**: `auth.service.ts:registerUser` checks if email already exists (`prisma.user.findUnique`). Hashes password with bcrypt. Generates a secure random 32-byte hex token.
5. **Database Transaction**: Atomic transaction creates the `User` record and linked `StudentProfile` record with default settings.
6. **Email Dispatch**: `nodemailer` dispatches an HTML email containing a secure verification link: `https://prepai.dev/verify-email?token=...`.
7. **Verification**: Candidate opens the link in their browser. `VerifyEmailPage.tsx` calls `GET /api/auth/verify-email?token=...`.
8. **Activation**: Backend finds user matching token, flips `isEmailVerified: true`, clears `verificationToken`, and returns success.
9. **Authentication**: Candidate inputs credentials on `LoginPage.tsx`. `auth.service.ts:loginUser` validates credentials, checks email verification status, issues a 15-minute JWT access token and 7-day refresh token (saved hashed to `RefreshToken` table in PostgreSQL), and writes the refresh token cookie with `httpOnly: true; Secure; SameSite: Strict`.
10. **Session Establishment**: `AuthContext.tsx` sets `currentUser`, stores the short-lived access token in memory, and redirects to `/dashboard`.

---

## Workflow 2: Candidate Configures and Launches AI Mock Interview

```
[AIMockInterviewSetup.tsx]
       │
       ▼ (1) User chooses: Type, Company, Branch, Semester, Topic, Difficulty, Questions Count
[Form Validation]
       │
       ▼ (2) POST /api/interviews/session
[auth.middleware.ts: verifyToken]
       │
       ▼ (3) interview.controller.ts: createSession
[interview.service.ts: createInterviewSession]
  ├── (4) prisma.interviewSession.create(status: "NOT_STARTED")
  ├── (5) Retrieve Candidate Resume Profile (if resume personalization enabled)
  ├── (6) Build Gemini Prompt with Academic Context & Company Rubrics
  └── (7) Call geminiProvider.ts (Candidate Model Cascade: 3.5-flash -> 3.1-flash-lite)
              │
              ▼ (8) Gemini returns JSON array of 3-5 technical questions
  ├── (9) Parse & validate question schemas
  ├── (10) prisma.interviewQuestion.createMany()
  └── (11) Update session status: "IN_PROGRESS"
       │
       ▼ (12) Return Session ID and Questions to Frontend
[LiveAIInterviewRoom.tsx mounts with initial Question #1]
```

### Detailed Trace Steps:
1. **Frontend Setup**: Candidate navigates to `/mock-interview/setup`. Selects target company (e.g., `Google`), department (`CSE`), topic (`Data Structures & Algorithms`), difficulty (`Medium`), question count (`5`), and toggles `Include Resume Personalization`.
2. **Pre-flight Validation**: `AIMockInterviewSetup.tsx` validates that all required parameters are non-empty before enabling the "Launch Interview" CTA.
3. **API Call**: `interviewService.createSession(config)` dispatches `POST /api/interviews/session` with the configuration payload and JWT bearer header.
4. **Backend Authorization**: `auth.middleware.ts` extracts `userId` from token.
5. **Session Staging**: `interview.service.ts` creates a new record in `InterviewSession` with `status: IN_PROGRESS` and `targetRole: "Software Engineer"`.
6. **AI Question Generation**:
   - The service builds an engineered prompt incorporating candidate department, semester, target company profile, and extracted resume skills.
   - Dispatches prompt to `geminiProvider.ts:generateContentWithRetry()`.
   - The provider calls `gemini-3.5-flash` with a 14-second timeout race.
   - If Gemini is unreachable or returns malformed output, the system falls back to `gemini-3.1-flash-lite` or the deterministic fallback question bank.
7. **Database Persistence**: The generated questions are inserted into the `InterviewQuestion` table, linked to the `sessionId` with order index `1..N`.
8. **Frontend Hand-off**: Server returns HTTP 201 with the created session object. Frontend navigates to `/mock-interview/live/:sessionId`. `LiveAIInterviewRoom.tsx` mounts, begins session timer (45m target), and displays Question 1.

---

## Workflow 3: Live Verbal Question Answering & Socratic Follow-Up Loop

```
[Candidate in LiveAIInterviewRoom.tsx]
       │
       ▼ (1) Candidate speaks answer (Web Speech API) OR types into Candidate Transcript
[Candidate clicks "Submit Answer"]
       │
       ▼ (2) POST /api/interviews/session/:id/questions/:qId/answer { candidateAnswer, timeSpent }
[interview.controller.ts: submitAnswer]
[interview.service.ts: submitAndEvaluateAnswer]
  ├── (3) Save candidateAnswer to InterviewQuestion
  ├── (4) Send Question + Answer + Rubric Guidelines to Gemini
  ├── (5) Gemini returns 6-dimension evaluation (Technical Depth, Problem Solving, etc.)
  ├── (6) Check if Answer requires clarification (Depth < 60% OR Ambiguous Claims)
  │         ├── YES: Call Gemini Socratic Follow-up Prompt
  │         │          │
  │         │          ▼
  │         │   Generate new InterviewQuestion (isFollowUp: true, parentId: qId)
  │         └── NO: Mark question evaluation completed
  └── (7) Save EvaluationRubric record in PostgreSQL
       │
       ▼ (8) Return Evaluation Scores + Follow-Up Question (if generated)
[Frontend displays Rubric Drawer & dynamically appends Q (FU) to Carousel]
```

### Detailed Trace Steps:
1. **Candidate Interaction**: Candidate reads question. Candidate clicks microphone to speak (transcribed in real time via browser Web Speech API) or writes response directly into the code/explanation editor.
2. **Submission**: Candidate clicks "Submit & Evaluate".
3. **Payload**: Frontend sends `POST /api/interviews/session/:id/questions/:qId/answer` containing `{ candidateAnswer, timeSpentSeconds, language }`.
4. **Evaluation Engine**: `interview.service.ts` retrieves the question prompt and candidate response. Builds the evaluation prompt using the 6-dimension rubric:
   - Technical Depth (0-100)
   - Problem Solving & Logic (0-100)
   - Communication Clarity (0-100)
   - Code/Syntax Quality (0-100)
   - CS Fundamentals (0-100)
   - System Design & Scalability (0-100)
5. **Socratic Follow-Up Check**:
   - If the candidate provided a shallow response or claimed a time complexity without explaining the invariant, the evaluator triggers `generateAdaptiveFollowUp()`.
   - Gemini synthesizes a targeted counter-question: *"You mentioned using a Min-Heap for top-K elements. How would your space complexity change if the stream contains $N$ duplicates?"*
   - A new `InterviewQuestion` record is inserted with `isFollowUp: true` and `parentId: questionId`.
6. **Rubric Persistence**: The score breakdown, strengths, gaps, and actionable feedback are stored in `EvaluationRubric`.
7. **UI Update**: Frontend updates the question carousel: Question 1 turns green (`Answered`), and a new pill `Q2 (FU)` appears. The evaluation drawer displays the 6-dimensional bar chart and feedback.

---

## Workflow 4: Interview Finalization, Remediation Synthesis & PDF Export

```
[Candidate clicks "Finish & Generate Report"]
       │
       ▼ (1) POST /api/interviews/session/:id/complete
[interview.service.ts: finalizeInterviewSession]
  ├── (2) Compute weighted average score across all questions & rubrics
  ├── (3) Determine overall performance tier (Exceptional, Proficient, Needs Revision)
  ├── (4) prisma.interviewSession.update({ status: "COMPLETED", overallScore })
  └── (5) Call recommendation.service.ts: generatePostInterviewRemediation()
              ├── Identify low-scoring dimensions (< 65%)
              ├── Fetch related study resources from Database
              ├── Call Gemini to synthesize customized markdown Study Notes
              └── prisma.recommendation.createMany() + prisma.studyNote.createMany()
       │
       ▼ (6) Return Completed Session Summary & Remediation Package
[LiveAIInterviewRoom.tsx switches to "Report & Remediation" View]
       │
       ▼ (7) Candidate clicks "Download Official PDF"
[GET /api/interviews/session/:id/export-pdf]
[report.service.ts: generateInterviewReportPDF]
  ├── (8) Initialize PDFKit document stream
  ├── (9) Draw MANIT Header, Candidate Metadata, Score Badges
  ├── (10) Render 6-Dimension Score Table & Radar Visualization
  ├── (11) Append Question-by-Question Transcript & AI Feedback
  └── (12) Pipe binary stream to response with Content-Type: application/pdf
       │
       ▼ (13) Candidate browser triggers native PDF save dialog
```

### Detailed Trace Steps:
1. **Completion Trigger**: Candidate answers all questions and clicks "Finish & Generate Report".
2. **Score Aggregation**: `interview.service.ts` queries all `EvaluationRubric` rows for the session. Averages dimensional scores to produce an overall score out of 100. Sets `completedAt = new Date()`.
3. **Remediation Pipeline**:
   - `recommendation.service.ts` detects dimensions scoring below 65%.
   - Searches `Resource` table for curated articles, video lectures, and practice problems matching the topic and weak areas.
   - Invokes Gemini to generate targeted, chapter-style study notes with code examples and complexity analysis.
   - Saves records into `Recommendation` and `StudyNote` tables linked to the session.
4. **Report Presentation**: Frontend displays the final scorecard, percentile standing, dimensional breakdown, strengths/weaknesses list, and interactive study notes tab.
5. **PDF Generation**:
   - Candidate clicks "Download PDF Report".
   - Browser requests `GET /api/interviews/session/:id/export-pdf`.
   - `report.service.ts` creates a vector PDF using PDFKit: branded header, candidate credentials, date, summary table, detailed question transcripts, model answers, and remediation recommendations.
   - Server pipes the binary buffer with `Content-Disposition: attachment; filename="PrepAI_Report_<sessionId>.pdf"`.

---

## Workflow 5: Resume Upload, ATS Analysis & Custom Question Seeding

```
[ResumeAnalyzer.tsx]
       │
       ▼ (1) Candidate drops resume file (PDF or DOCX, max 5MB)
[POST /api/resume/upload (multipart/form-data)]
[upload.middleware.ts (Multer Memory Storage)]
       │
       ▼ (2) resume.controller.ts: uploadResume
[resume.service.ts: parseAndAnalyzeResume]
  ├── (3) Buffer inspection: pdf-parse (for PDF) or mammoth (for DOCX)
  ├── (4) Extract raw text content from document
  ├── (5) Build Gemini Resume Parsing Prompt
  └── (6) Call Gemini: Extract skills, projects, ATS score, missing keywords, mock questions
       │
       ▼ (7) Parse structured JSON from Gemini response
  ├── (8) prisma.studentProfile.update({ resumeUrl, parsedSkills, atsScore })
  └── (9) Store extracted questions for future mock interview sessions
       │
       ▼ (10) Return Analysis to Frontend
[ResumeAnalyzer.tsx renders ATS gauge, keyword tags, and "Launch Targeted Mock" CTA]
```

### Detailed Trace Steps:
1. **Upload**: Candidate drags and drops their resume into `ResumeAnalyzer.tsx`.
2. **Transport**: File is sent via `multipart/form-data` to `POST /api/resume/upload`.
3. **Security & Validation**: `upload.middleware.ts` enforces 5MB size limit and validates MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
4. **Text Extraction**: `resume.service.ts` parses the in-memory buffer using `pdf-parse` or `mammoth`.
5. **AI Extraction**: The extracted text is injected into Gemini's resume analysis prompt. Gemini evaluates:
   - ATS score (0-100) based on formatting, action verbs, and structure.
   - Detected technical skills (languages, frameworks, databases, cloud).
   - High-impact project summaries.
   - Suggested improvements and missing industry keywords.
   - 5 customized technical cross-examination questions based on specific project claims.
6. **Profile Update**: Parsed skills, ATS score, and resume metadata are updated in `StudentProfile`.
7. **Display & Action**: Candidate views their ATS breakdown and can click "Start Resume-Based Mock Interview" to immediately launch an interview targeting their specific claimed projects.

---

## Workflow 6: Multi-Language Code Execution & Automated Judging

```
[CodingPractice.tsx / MonacoCodeEditor.tsx]
       │
       ▼ (1) Candidate writes code in C++, Java, Python, or JavaScript
[Candidate clicks "Run Code" (Sandbox Test)]
       │
       ▼ (2) POST /api/coding/run { code, language, stdin }
[codeExecution.service.ts: executeCodeAgainstTests]
  ├── (3) Dispatch source code and custom input to Compiler API / Judge0
  └── (4) Parse stdout, stderr, compile_output, execution_time, memory
       │
       ▼ (5) Return execution result to frontend interactive console
[Candidate clicks "Submit Solution" (Official Judge)]
       │
       ▼ (6) POST /api/coding/problems/:id/submit { code, language }
[coding.service.ts: submitProblemSolution]
  ├── (7) Query all hidden test cases from Database
  ├── (8) Loop test cases through compiler sandbox with strict time limits (2000ms)
  ├── (9) Compare actual stdout with expected output (trimmed whitespace)
  ├── (10) Determine Status: ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR
  ├── (11) Compute total execution time and memory peak
  └── (12) prisma.codingSubmission.create() + update problem acceptance rate
       │
       ▼ (13) Return verdict modal to CodingPractice.tsx
```

### Detailed Trace Steps:
1. **Code Composition**: Candidate writes solution in `MonacoCodeEditor.tsx`.
2. **Interactive Run**:
   - Candidate clicks "Run Code".
   - Frontend calls `POST /api/coding/run`.
   - `codeExecution.service.ts` submits code with provided test inputs to the compiler sandbox.
   - Output, execution time, and any compilation errors appear in the integrated console.
3. **Formal Submission**:
   - Candidate clicks "Submit Solution".
   - Frontend calls `POST /api/coding/problems/:id/submit`.
4. **Judging Pipeline**:
   - `coding.service.ts` fetches the problem definition and its hidden test cases from `TestCase` table.
   - Each test case is evaluated against the compiler sandbox.
   - If any case fails, execution stops and marks `WRONG_ANSWER` with the failing case index.
   - If time exceeds 2000ms, marks `TIME_LIMIT_EXCEEDED`.
   - If compiler outputs errors, marks `COMPILE_ERROR`.
   - If all test cases match expected outputs, marks `ACCEPTED`.
5. **Telemetry & DB Record**: Creates a `CodingSubmission` record. If `ACCEPTED`, marks problem as solved for the candidate and recalculates the problem's global acceptance rate.
6. **Verdict**: Frontend displays success modal showing test cases passed (e.g., `15/15 passed`), runtime percentile, and memory usage.

---

## Workflow 7: Administrator Resource Moderation & Flagged Evaluation Resolution

```
[AdminDashboard.tsx]
       │
       ▼ (1) Admin logs in (auth.middleware + authorize.middleware verifies Role === "ADMIN")
[Admin navigates to "Flagged Evaluations" Tab]
       │
       ▼ (2) GET /api/admin/flagged-evaluations
[admin.service.ts: getFlaggedEvaluations]
  └── Queries prisma.evaluationRubric.findMany({ where: { isFlagged: true } })
       │
       ▼ (3) Display list of student-flagged AI scores with student comments
[Admin reviews AI evaluation vs candidate answer]
       │
       ▼ (4) Admin modifies score and adds reviewer resolution note
[PATCH /api/admin/flagged-evaluations/:rubricId/resolve]
[admin.service.ts: resolveFlaggedEvaluation]
  ├── (5) prisma.evaluationRubric.update({ isFlagged: false, technicalScore, adminNote })
  ├── (6) Recalculate parent InterviewSession overall score
  └── (7) Write Audit Log in SystemAudit table
       │
       ▼ (8) Return updated evaluation & refresh Admin Dashboard
```

### Detailed Trace Steps:
1. **Access Enforcement**: Admin accesses `/admin`. `AdminShell.tsx` and backend `authorize(Role.ADMIN)` reject any non-admin users with HTTP 403 Forbidden.
2. **Data Fetching**: Admin views pending flagged evaluations submitted by students who disputed an AI-generated rubric score.
3. **Audit & Adjustment**: Admin inspects the question prompt, candidate's original code/text answer, Gemini's generated critique, and student's dispute note.
4. **Resolution Submission**: Admin adjusts dimensional score (e.g. raises Technical Depth from 45 to 80) and submits resolution notes.
5. **Database Consistency**: Backend updates `EvaluationRubric`, clears `isFlagged`, updates the parent `InterviewSession`'s overall aggregate score, and logs an entry in `SystemAudit`.
6. **Real-Time Notification**: The student's interview history immediately reflects the corrected score and admin review notes.

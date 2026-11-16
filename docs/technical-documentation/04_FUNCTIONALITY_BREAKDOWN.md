# 04 — Detailed Functionality-by-Functionality Breakdown

---

## 1. Authentication & Session Management

### A. Functionality Overview
* **Purpose:** Provides identity verification, role assignment, and session management. Protects candidate data, enforces role-based access control (`USER` vs `ADMIN`), and manages email verification and password recovery.
* **Capabilities:** User registration with academic discipline metadata, email verification via tokenized link, credential-based login with "Remember Me", silent access token rotation via HTTP-only refresh cookies, password recovery via SMTP, and multi-device session invalidation.

### B. Frontend Implementation
* **Files:**
  * Login: [src/pages/auth/LoginPage.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/auth/LoginPage.tsx)
  * Register: [src/pages/auth/RegisterPage.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/auth/RegisterPage.tsx)
  * Verify Email: [src/pages/auth/VerifyEmailPage.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/auth/VerifyEmailPage.tsx)
  * Forgot Password: [src/pages/auth/ForgotPasswordPage.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/auth/ForgotPasswordPage.tsx)
  * Reset Password: [src/pages/auth/ResetPasswordPage.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/auth/ResetPasswordPage.tsx)
* **Components:** `AuthLayout`, `AuthInput`, `AuthSelect`, `AuthStatusBanner`, `PasswordRequirements`.
* **State Management:** React local states for form fields, validation errors, and `AuthContext` for global authentication session.
* **Validation:** Client-side email pattern matching, password strength checks (min 8 chars, uppercase, lowercase, number, special symbol), and password confirmation matching.

### C. Backend Implementation
* **Routes:** [src/routes/auth.routes.ts](file:///c:/major-project/backend/src/routes/auth.routes.ts)
* **Controller:** [src/controllers/auth.controller.ts](file:///c:/major-project/backend/src/controllers/auth.controller.ts)
* **Service:** [src/services/auth.service.ts](file:///c:/major-project/backend/src/services/auth.service.ts)
* **Endpoints:**
  * `POST /api/auth/register`
  * `POST /api/auth/login`
  * `POST /api/auth/refresh`
  * `POST /api/auth/logout`
  * `POST /api/auth/verify-email`
  * `POST /api/auth/resend-verification`
  * `POST /api/auth/forgot-password`
  * `POST /api/auth/reset-password`
  * `GET /api/auth/me`
* **Security & Tokens:**
  * Password hashing via `bcrypt.hash(password, 10)`.
  * Access Token: Signed JWT (`expiresIn: 15m`).
  * Refresh Token: Signed JWT (`expiresIn: 7d`), hashed with SHA-256 and stored in the `RefreshToken` database table.
  * Cookie flags: `httpOnly: true`, `secure: env.isProduction`, `sameSite: 'none' | 'lax'`.

### D. Step-by-Step Execution Flow (User Login)
1. User enters email and password on `/login` and clicks "Sign In".
2. `LoginPage.handleSubmit` validates inputs and calls `login(credentials, rememberMe)` in `AuthContext`.
3. `authService.login()` issues `POST /api/auth/login`.
4. `authRateLimiter` ensures request volume is under 15 requests / 15 minutes.
5. `validate(loginSchema)` verifies that the email is valid and the password is provided.
6. `authController.login` extracts credentials and calls `authService.login()`.
7. `authService.login`:
   * Fetches user from PostgreSQL including profile and academic details.
   * Compares password with `bcrypt.compare(password, user.passwordHash)`.
   * Generates `accessToken` (15m) and `refreshToken` (7d).
   * Hashes `refreshToken` with SHA-256 and records it in `prisma.refreshToken.create`.
   * Updates `user.lastLoginAt`.
8. `authController` sets HTTP-only cookies and returns `{ user, accessToken, refreshToken }`.
9. Frontend stores `accessToken`, updates `AuthContext.user`, and navigates to `/dashboard`.

---

## 2. AI Technical Mock Interview System

### A. Functionality Overview
* **Purpose:** Simulates realistic placement and technical rounds with an AI interviewer powered by Google Gemini. Evaluates answers across six distinct engineering competencies, provides Socratic hints, dynamically asks contextual follow-up questions, and synthesizes final reports.
* **Capabilities:** 
  * 3 Modes: `RESUME_BASED`, `TOPIC_BASED`, and `COMPREHENSIVE`.
  * Category distribution sliders (DSA, System Design/Projects, Core CS, OOP, Modern Tech) up to 15 questions.
  * Live answer evaluation with six rubric scores.
  * Live answer editing with in-place rubric re-evaluation without duplicate follow-ups.
  * Draft answer persistence across question navigation.
  * Socratic examiner hints on demand.
  * PDF report export and admin review flagging.

### B. Frontend Implementation
* **Files:**
  * Setup: [src/pages/AIMockInterviewSetup.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/AIMockInterviewSetup.tsx)
  * Live Interview Room: [src/pages/LiveAIInterviewRoom.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/LiveAIInterviewRoom.tsx)
  * History: [src/pages/InterviewHistory.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/InterviewHistory.tsx)
* **State Management:**
  * `session`: Loaded `BackendInterviewSession`.
  * `currentIndex`: Active question pointer.
  * `answerText` & `draftAnswers`: Synchronized state map ensuring navigating between questions never wipes typed answers.
  * `activeEvaluation`: `currentQuestion.answer` binding live 6-dimension scores to the evaluation rubric.
  * `activeTab`: Switches between Score Breakdown, Recommendations, and Study Notes Dossier upon completion.
* **API Calls:**
  * `interviewService.createSession(payload)` $\rightarrow$ `POST /api/interviews/sessions`
  * `interviewService.submitAnswer(sessionId, questionId, text)` $\rightarrow$ `POST /api/interviews/sessions/:id/answers`
  * `interviewService.completeInterview(sessionId)` $\rightarrow$ `POST /api/interviews/sessions/:id/complete`
  * `interviewService.downloadPdfReport(sessionId)` $\rightarrow$ `GET /api/interviews/sessions/:id/report/pdf`

### C. Backend Implementation
* **Routes:** [src/routes/interview.routes.ts](file:///c:/major-project/backend/src/routes/interview.routes.ts)
* **Controller:** [src/controllers/interview.controller.ts](file:///c:/major-project/backend/src/controllers/interview.controller.ts)
* **Service:** [src/services/interview.service.ts](file:///c:/major-project/backend/src/services/interview.service.ts)
* **AI Provider:** [src/services/ai/geminiProvider.ts](file:///c:/major-project/backend/src/services/ai/geminiProvider.ts)
* **Key Logic:**
  * `createSession`: Invokes `geminiProvider.generateInitialQuestions` with mode-specific directives. Saves session with status `IN_PROGRESS` and creates question records with `orderIndex`.
  * `submitAnswer`: Uses `tx.interviewAnswer.upsert` to allow seamless re-submission/editing. Checks `existingFollowUp` before shifting questions or inserting new probes, avoiding duplicate follow-up questions.
  * `completeSession`: Calculates average rubric scores, categorizes questions into domains (DSA, Systems, Architecture, Fundamentals, Implementation) to compute `categoryScores`, synthesizes a final report via OpenAI/Gemini, and updates status to `COMPLETED`.

### D. Step-by-Step Execution Flow (Answer Submission & Follow-up Loop)
1. Candidate types technical explanation and clicks "Submit Response" (or "Update Answer & Re-evaluate").
2. Frontend calls `interviewService.submitAnswer(sessionId, questionId, text)`.
3. Backend middleware `authenticate` verifies JWT; `aiRateLimiter` enforces rate safety; `validate(submitAnswerSchema)` ensures text meets length thresholds.
4. `interviewService.submitAnswer`:
   * Retrieves session, active question, and conversation history of earlier answers.
   * Calls `geminiProvider.evaluateAnswer` with prompt, expected concepts, and candidate text.
   * Gemini scores 6 dimensions (0-100) and synthesizes examiner feedback, missing concepts, and an optional follow-up question.
   * Inside a Prisma transaction (`prisma.$transaction`):
     * Upserts `InterviewAnswer`.
     * If follow-up exists and no prior follow-up was created: increments `orderIndex` of subsequent questions and inserts the follow-up question immediately adjacent.
5. Returns `{ evaluation, followUpQuestion, session }`.
6. Frontend updates rubric with scores and shows examiner feedback. If a follow-up was generated, `session.questions` contains the new question badge (`Qx (FU)`).

---

## 3. Post-Interview Remediation & Study Notes Dossier

### A. Functionality Overview
* **Purpose:** Closes the learning loop by translating interview gaps into actionable remediation.
* **Capabilities:**
  * Dynamic mapping of low-scoring topics (< 75%) and examiner-flagged missing concepts to real PostgreSQL database resources (`PreparationResource`, `CodingProblem`, `CompanyQuestion`).
  * Automated priority calculation (`HIGH`, `MEDIUM`, `LOW`) and estimated study hours.
  * Gemini-powered structured Technical Mastery Dossier with definitions, core concepts, algorithms, code snippets, and revision checklists.
  * Single-click PDF export of both Interview Report and Study Notes Dossier using `pdfkit`.

### B. Implementation Details
* **Frontend:** Tabs in `LiveAIInterviewRoom.tsx` for "Recommendations" and "Study Notes Dossier".
* **Backend Services:**
  * [src/services/recommendation.service.ts](file:///c:/major-project/backend/src/services/recommendation.service.ts): Iterates through `session.questions` and `session.feedback` to extract gaps and execute targeted PostgreSQL queries.
  * [src/services/report.service.ts](file:///c:/major-project/backend/src/services/report.service.ts): Builds Gemini prompt with candidate's missed questions and answers, validates JSON schema, caches dossier into `InterviewFeedback.studyNotes`, and compiles PDFs via `PDFDocument`.
* **Endpoints:**
  * `GET /api/interviews/sessions/:id/recommendations`
  * `POST /api/interviews/sessions/:id/study-notes`
  * `GET /api/interviews/sessions/:id/study-notes`
  * `GET /api/interviews/sessions/:id/study-notes/pdf`

---

## 4. AI Resume Analyzer

### A. Functionality Overview
* **Purpose:** Enables candidates to upload resumes and receive automated structural feedback, extracted skills inventory, project breakdown, and alignment with mock interviews.
* **Capabilities:** PDF & DOCX text extraction, Cloudinary cloud storage, Gemini structured extraction (skills, projects with architecture/tradeoffs, work experience, education), and direct launch of resume-personalized interviews.

### B. Implementation Details
* **Frontend:** [src/pages/ResumeAnalyzer.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/ResumeAnalyzer.tsx).
* **Backend:**
  * Multer Memory Upload: `resumeUpload.single('resume')` in [src/middleware/upload.ts](file:///c:/major-project/backend/src/middleware/upload.ts).
  * Text Extraction: `pdf-parse` for PDFs, `mammoth.extractRawText` for DOCX in [src/services/resume.service.ts](file:///c:/major-project/backend/src/services/resume.service.ts).
  * Storage: Cloudinary stream uploader (`uploadStream`).
  * AI Extraction: `geminiProvider.analyzeResume(rawText)` structured into `ResumeStructuredData` schema.
* **Database Models:** `Resume` and `ResumeAnalysis` (one-to-one).

---

## 5. Multi-Language Code Execution & Judging

### A. Functionality Overview
* **Purpose:** Provides sandboxed, low-latency execution and automatic grading for coding problems.
* **Capabilities:**
  * Code execution in C++ (g++-15), Python (3.14), Java (OpenJDK-25), JavaScript (Node.js 24), and Go (1.26).
  * Dual-engine adapter: OnlineCompiler.io primary engine with Judge0 CE compatibility.
  * Sample execution (`runSample`) against public examples.
  * Multi-test-case judge evaluation (`submitSolution`) comparing normalized stdout against hidden expected outputs.
  * Verdict categorization: `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, `COMPILATION_ERROR`, `RUNTIME_ERROR`.

### B. Implementation Details
* **Frontend:** [src/pages/CodingPractice.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/CodingPractice.tsx) with `MonacoCodeEditor.tsx`.
* **Backend:**
  * [src/services/codeExecution.service.ts](file:///c:/major-project/backend/src/services/codeExecution.service.ts): Handles payload formatting (up to 100 KB), timeout races (35s), status code normalization, and compilation error regex detection.
  * [src/services/coding.service.ts](file:///c:/major-project/backend/src/services/coding.service.ts): Iterates through problem test cases in a sequential execution loop; stops on the first failure or records `ACCEPTED` if all pass.
* **Database Models:** `CodingProblem`, `CodingSubmission`, `UserCodingProgress`.

---

## 6. Company-Specific Questions Archive

### A. Functionality Overview
* **Purpose:** Curated directory of tech companies and actual questions asked in recent campus and off-campus technical interviews.
* **Capabilities:** Company caliber cards (Google, Amazon, Microsoft, Uber, Flipkart), search by topic/role/frequency, difficulty filters, and bookmarking.
* **Implementation:**
  * Frontend: [src/pages/CompanyQuestions.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/CompanyQuestions.tsx)
  * Backend: `companyQuestion.controller.ts` & `companyQuestion.service.ts`
  * Endpoints: `GET /api/company-questions/companies`, `GET /api/company-questions`
  * Admin CRUD: `POST`, `PATCH`, `DELETE /api/company-questions` (Protected by `authorize(UserRole.ADMIN)`).

---

## 7. Preparation Resources & Student Requests

### A. Functionality Overview
* **Purpose:** Centralized academic repository containing GATE PYQs with solutions, branch syllabus notes, and quick revision formula sheets.
* **Capabilities:** Search and filter by branch (CSE, ECE, EE, ME), format (PDF, Notes, Cheat Sheet), upvoting system, download counter tracking, and student request submission.
* **Implementation:**
  * Frontend: [src/pages/PreparationResources.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/PreparationResources.tsx)
  * Backend: `resource.controller.ts` & `resource.service.ts`
  * Endpoints: `GET /api/resources`, `POST /api/resources/:id/upvote`, `POST /api/resources/:id/download`, `POST /api/resources/requests`

---

## 8. Unified Bookmarking Engine

### A. Functionality Overview
* **Purpose:** Enables candidates to save items across the platform into a centralized revision list.
* **Capabilities:** Polymorphic bookmarking supporting three target types: `CODING_PROBLEM`, `COMPANY_QUESTION`, and `PREPARATION_RESOURCE`.
* **Implementation:**
  * Frontend: [src/pages/Bookmarks.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/Bookmarks.tsx)
  * Backend: `bookmark.controller.ts` & `bookmark.service.ts`
  * Database Model: `Bookmark` with unique compound constraint `@@unique([userId, targetType, targetId])`.

---

## 9. Performance Analytics & Student Dashboard

### A. Functionality Overview
* **Purpose:** Visualizes student placement readiness, competency radar, interview activity, and coding stats.
* **Capabilities:** Six-dimensional competency radar chart, recent interview cards with score trends, solved problems breakdown by difficulty, and personalized recommendations.
* **Implementation:**
  * Frontend: [src/pages/UserDashboard.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/UserDashboard.tsx) & [src/pages/AnalyticsDashboard.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/AnalyticsDashboard.tsx)
  * Backend: `dashboard.controller.ts` & `analytics.service.ts`
  * Endpoints: `GET /api/dashboard`, `GET /api/analytics`

---

## 10. Administrator Moderation Portal

### A. Functionality Overview
* **Purpose:** Governance and management console for campus administrators and instructors.
* **Capabilities:**
  * High-level institutional metrics (users, interview volume, pass rates, active flags).
  * User Directory: Search, edit profile, toggle active status, grant or revoke `ADMIN` role.
  * Resource Requests: Approve or reject student-submitted resource requests.
  * AI Review Flags: Inspect candidate-flagged interview questions or evaluations, view examiner prompt/answer, add administrative audit notes, and mark `RESOLVED` or `DISMISSED`.
  * Coding Problem Management: Full CRUD for coding problems, test cases, constraints, and solutions.
* **Implementation:**
  * Frontend: [src/pages/AdminDashboard.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/AdminDashboard.tsx)
  * Backend: `admin.controller.ts` & `admin.service.ts`
  * Security: Guarded by `authenticate` and `authorize(UserRole.ADMIN)` on `/api/admin/*`.

---

## 11. User Profile & Account Settings

### A. Functionality Overview
* **Purpose:** Personal data management, academic curriculum alignment, security, and session management.
* **Capabilities:** Update full name, phone, bio, avatar, academic discipline (Branch, Semester, Scholar Number, CGPA, GATE aspirant status), change password, view active refresh token sessions with user-agent and IP, logout all devices, and permanently delete account.
* **Implementation:**
  * Frontend: [src/pages/UserProfile.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/UserProfile.tsx) & [src/pages/Settings.tsx](file:///c:/major-project/frontend/stitch_ai_technical_interview_platform/src/pages/Settings.tsx)
  * Backend: `profile.controller.ts` and `settings.controller.ts`
  * Endpoints: `GET/PATCH /api/profile`, `GET/PATCH /api/settings`, `POST /api/settings/change-password`, `GET /api/settings/sessions`, `POST /api/settings/logout-all`, `DELETE /api/settings/account`.

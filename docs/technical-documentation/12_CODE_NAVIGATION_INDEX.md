# 12. Code Navigation Index & Symbol Reference

This document provides a comprehensive, rapid-lookup navigation index for the entire PrepAI codebase. It maps every platform capability to its exact file paths, component names, backend controllers, services, database models, and primary function exports.

---

## 1. Feature-to-Code Mapping Directory

| Platform Feature | Frontend Component & Path | Frontend Service Call | Backend Route & Controller | Backend Service & Method | Prisma Models Involved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Registration** | `RegisterPage.tsx`<br>`src/pages/auth/RegisterPage.tsx` | `authService.register()`<br>`src/services/authService.ts` | `POST /api/auth/register`<br>`auth.controller.ts:register` | `auth.service.ts`<br>`registerUser()` | `User`, `StudentProfile` |
| **Email Verification** | `VerifyEmailPage.tsx`<br>`src/pages/auth/VerifyEmailPage.tsx` | `authService.verifyEmail()`<br>`src/services/authService.ts` | `GET /api/auth/verify-email`<br>`auth.controller.ts:verifyEmail` | `auth.service.ts`<br>`verifyEmail()` | `User` |
| **User Authentication** | `LoginPage.tsx`<br>`src/pages/auth/LoginPage.tsx` | `authService.login()`<br>`src/services/authService.ts` | `POST /api/auth/login`<br>`auth.controller.ts:login` | `auth.service.ts`<br>`loginUser()` | `User`, `RefreshToken` |
| **Silent Token Refresh** | `api.ts` (Axios Interceptor)<br>`src/services/api.ts` | Handled automatically on 401 via `/auth/refresh` | `POST /api/auth/refresh`<br>`auth.controller.ts:refreshToken` | `auth.service.ts`<br>`rotateRefreshToken()` | `RefreshToken`, `User` |
| **User Sign Out** | `UserShell.tsx` / `Settings.tsx` | `authService.logout()`<br>`src/services/authService.ts` | `POST /api/auth/logout`<br>`auth.controller.ts:logout` | `auth.service.ts`<br>`revokeRefreshToken()` | `RefreshToken` |
| **Mock Interview Setup** | `AIMockInterviewSetup.tsx`<br>`src/pages/AIMockInterviewSetup.tsx` | `interviewService.createSession()`<br>`src/services/interviewService.ts` | `POST /api/interviews/session`<br>`interview.controller.ts:createSession` | `interview.service.ts`<br>`createInterviewSession()` | `InterviewSession`, `InterviewQuestion` |
| **Live Interview Room** | `LiveAIInterviewRoom.tsx`<br>`src/pages/LiveAIInterviewRoom.tsx` | `interviewService.getSession()`<br>`src/services/interviewService.ts` | `GET /api/interviews/session/:id`<br>`interview.controller.ts:getSession` | `interview.service.ts`<br>`getInterviewSession()` | `InterviewSession`, `InterviewQuestion`, `EvaluationRubric` |
| **Answer Submission & Socratic Loop** | `LiveAIInterviewRoom.tsx`<br>`src/pages/LiveAIInterviewRoom.tsx` | `interviewService.submitAnswer()`<br>`src/services/interviewService.ts` | `POST /api/interviews/session/:id/questions/:qId/answer`<br>`interview.controller.ts:submitAnswer` | `interview.service.ts`<br>`submitAndEvaluateAnswer()` | `InterviewQuestion`, `EvaluationRubric`, `InterviewSession` |
| **Interview Completion & Report** | `LiveAIInterviewRoom.tsx`<br>`src/pages/LiveAIInterviewRoom.tsx` | `interviewService.completeSession()`<br>`src/services/interviewService.ts` | `POST /api/interviews/session/:id/complete`<br>`interview.controller.ts:completeSession` | `interview.service.ts`<br>`finalizeInterviewSession()` | `InterviewSession`, `Recommendation`, `StudyNote` |
| **Remediation & Study Notes** | `LiveAIInterviewRoom.tsx`<br>`src/pages/LiveAIInterviewRoom.tsx` | `interviewService.getRecommendations()`<br>`src/services/interviewService.ts` | `GET /api/interviews/session/:id/recommendations`<br>`interview.controller.ts:getRecommendations` | `recommendation.service.ts`<br>`generatePostInterviewRemediation()` | `Recommendation`, `StudyNote`, `Resource` |
| **PDF Report Download** | `LiveAIInterviewRoom.tsx`<br>`src/pages/LiveAIInterviewRoom.tsx` | Window Blob Trigger (`/export-pdf`) | `GET /api/interviews/session/:id/export-pdf`<br>`interview.controller.ts:exportReportPdf` | `report.service.ts`<br>`generateInterviewReportPDF()` | `InterviewSession`, `InterviewQuestion`, `EvaluationRubric` |
| **Interview History** | `InterviewHistory.tsx`<br>`src/pages/InterviewHistory.tsx` | `interviewService.getHistory()`<br>`src/services/interviewService.ts` | `GET /api/interviews/history`<br>`interview.controller.ts:getHistory` | `interview.service.ts`<br>`getUserInterviewHistory()` | `InterviewSession` |
| **Coding Practice Problem Catalog** | `CodingPractice.tsx`<br>`src/pages/CodingPractice.tsx` | `codingService.getProblems()`<br>`src/services/codingService.ts` | `GET /api/coding/problems`<br>`coding.controller.ts:getProblems` | `coding.service.ts`<br>`getProblems()` | `CodingProblem`, `ProblemTag` |
| **Interactive Code Execution (Sandbox)** | `MonacoCodeEditor.tsx`<br>`src/components/MonacoCodeEditor.tsx` | `codingService.runCode()`<br>`src/services/codingService.ts` | `POST /api/coding/run`<br>`coding.controller.ts:runCode` | `codeExecution.service.ts`<br>`executeCodeAgainstTests()` | *(Volatile In-Memory Engine)* |
| **Coding Submission & Grading** | `CodingPractice.tsx`<br>`src/pages/CodingPractice.tsx` | `codingService.submitCode()`<br>`src/services/codingService.ts` | `POST /api/coding/problems/:id/submit`<br>`coding.controller.ts:submitCode` | `coding.service.ts`<br>`submitProblemSolution()` | `CodingSubmission`, `TestCaseResult`, `CodingProblem` |
| **Resume Upload & AI Parsing** | `ResumeAnalyzer.tsx`<br>`src/pages/ResumeAnalyzer.tsx` | `resumeService.uploadResume()`<br>`src/services/resumeService.ts` | `POST /api/resume/upload`<br>`resume.controller.ts:uploadResume` | `resume.service.ts`<br>`parseAndAnalyzeResume()` | `StudentProfile`, `User` |
| **Preparation Resources Library** | `PreparationResources.tsx`<br>`src/pages/PreparationResources.tsx` | `resourceService.getResources()`<br>`src/services/resourceService.ts` | `GET /api/resources`<br>`resource.controller.ts:getResources` | `resource.service.ts`<br>`listResources()` | `Resource`, `Subject`, `Department` |
| **Company Questions Archive** | `CompanyQuestions.tsx`<br>`src/pages/CompanyQuestions.tsx` | `resourceService.getCompanyQuestions()`<br>`src/services/resourceService.ts` | `GET /api/company-questions`<br>`companyQuestion.controller.ts:getQuestions` | `companyQuestion.service.ts`<br>`getCompanyQuestions()` | `CompanyQuestion`, `Company` |
| **User Bookmarks Management** | `Bookmarks.tsx`<br>`src/pages/Bookmarks.tsx` | `bookmarkService.getBookmarks()`<br>`src/services/bookmarkService.ts` | `GET /api/bookmarks`<br>`bookmark.controller.ts:getBookmarks` | `bookmark.service.ts`<br>`getUserBookmarks()` | `Bookmark`, `CodingProblem`, `Resource` |
| **Student Analytics Dashboard** | `AnalyticsDashboard.tsx`<br>`src/pages/AnalyticsDashboard.tsx` | `analyticsService.getDashboardMetrics()`<br>`src/services/analyticsService.ts` | `GET /api/dashboard/stats`<br>`dashboard.controller.ts:getStats` | `analytics.service.ts`<br>`getStudentPerformanceMetrics()` | `InterviewSession`, `CodingSubmission` |
| **User Profile Management** | `UserProfile.tsx`<br>`src/pages/UserProfile.tsx` | `authService.getProfile()`<br>`src/services/authService.ts` | `GET /api/profile`<br>`profile.controller.ts:getProfile` | `profile.service.ts`<br>`getUserProfile()` | `User`, `StudentProfile` |
| **User Settings & Preferences** | `Settings.tsx`<br>`src/pages/Settings.tsx` | `authService.updateSettings()`<br>`src/services/authService.ts` | `PATCH /api/settings`<br>`settings.controller.ts:updateSettings` | `settings.service.ts`<br>`updateUserSettings()` | `User`, `UserSetting` |
| **Admin Operations Dashboard** | `AdminDashboard.tsx`<br>`src/pages/AdminDashboard.tsx` | `adminService.getPlatformMetrics()`<br>`src/services/adminService.ts` | `GET /api/admin/metrics`<br>`admin.controller.ts:getMetrics` | `admin.service.ts`<br>`getSystemWideMetrics()` | `User`, `InterviewSession`, `SystemMetric` |
| **Admin Question & Resource Moderation** | `AdminDashboard.tsx`<br>`src/pages/AdminDashboard.tsx` | `adminService.approveResource()`<br>`src/services/adminService.ts` | `PATCH /api/admin/resources/:id`<br>`admin.controller.ts:updateResource` | `admin.service.ts`<br>`updateResourceStatus()` | `Resource`, `CodingProblem` |

---

## 2. File-by-File Code Index

### 2.1 Frontend Files (`frontend/stitch_ai_technical_interview_platform/src/`)

#### Pages (`src/pages/`)
- `LandingPage.tsx` (435 lines)
  - Purpose: Public marketing and hero page introducing PrepAI's adaptive verbal AI interview examiner, low-latency compiler, and engineering placement stats.
  - Key Elements: Animated background grid, CTA navigation buttons, curriculum highlight cards, test console widget.
- `auth/LoginPage.tsx` (362 lines)
  - Purpose: Student/faculty authentication form supporting MANIT and institutional credentials.
  - Functions: `handleSubmit`, `handleGoogleLoginMock`, `validateCredentials`.
- `auth/RegisterPage.tsx` (398 lines)
  - Purpose: New account creation with department (`CSE`, `ECE`, `EE`, `ME`), semester (`1-8`), and scholar roll-number validation.
  - Functions: `handleFormSubmit`, `validatePasswordMatch`.
- `auth/VerifyEmailPage.tsx` (210 lines)
  - Purpose: URL-token email activation landing page with automatic verification trigger and resend functionality.
- `UserDashboard.tsx` (563 lines)
  - Purpose: Primary student workspace landing page showing readiness score, upcoming mock targets, quick-launch practice widgets, and recent interview history.
- `AIMockInterviewSetup.tsx` (903 lines)
  - Purpose: Multi-step interactive interview configurator.
  - State: `interviewType`, `targetCompany`, `department`, `semester`, `primaryTopic`, `difficulty`, `questionCount`, `includeResumePersonalization`, `interviewMode`.
  - Functions: `handleLaunchInterview`, `handleResumeFileAttach`, `validateSetupConfig`.
- `LiveAIInterviewRoom.tsx` (1086 lines)
  - Purpose: Real-time verbal and coding interview simulator.
  - Subcomponents: Question Carousel, Candidate Transcript Editor, Speech-to-Text Controller, Socratic Follow-Up Indicator, Evaluation Rubric Drawer, Remediation Tab, PDF Exporter.
  - Functions: `handleSaveAnswer`, `handleEvaluateCurrentQuestion`, `handleCompleteInterview`, `downloadPdfReport`.
- `CodingPractice.tsx` (1166 lines)
  - Purpose: LeetCode-style coding workbench with split pane editor, test-case previewer, standard I/O console, and submission results modal.
  - Integrated with `MonacoCodeEditor.tsx`.
- `ResumeAnalyzer.tsx` (446 lines)
  - Purpose: Interactive resume diagnostic scanner analyzing ATS compliance, keyword frequency, detected skills, and generating custom technical interview questions.
- `PreparationResources.tsx` (816 lines)
  - Purpose: Departmental study library organized by engineering branches (`B.Tech CS Core`, `ECE Embedded`, `EE Systems`, `Mechanical Dynamics`), question banks, and semester PYQs.
- `CompanyQuestions.tsx` (449 lines)
  - Purpose: Searchable company-specific interview question repository (Google, Microsoft, Amazon, Atlassian, Oracle, TCS Ninja/Digital) filtered by frequency and branch.
- `Bookmarks.tsx` (259 lines)
  - Purpose: Student's saved questions, coding problems, and high-yield revision resources.
- `AnalyticsDashboard.tsx` (462 lines)
  - Purpose: Performance intelligence graphs visualizing dimensional rubric trends (Technical Depth, Problem Solving, Communication, Code Quality, CS Fundamentals, System Design) over time.
- `InterviewHistory.tsx` (580 lines)
  - Purpose: Chronological archive of all past completed and in-progress interview attempts with detailed scorecard viewing.
- `UserProfile.tsx` (467 lines)
  - Purpose: Scholar details viewer, avatar changer, academic CGPA, GitHub/LinkedIn links, and target companies selector.
- `Settings.tsx` (1261 lines)
  - Purpose: Tabbed account configuration: General Preferences, Security & Password, Notification Settings, AI Model Preferences, Dark/Light Mode Switcher.
- `AdminDashboard.tsx` (1436 lines)
  - Purpose: System oversight portal: Real-time user metrics, flagged interview evaluations, resource approvals, user role management, system health monitor.

#### Shared Components (`src/components/`)
- `layout/UserShell.tsx` (310 lines): Standard authenticated wrapper featuring collapsible sidebar navigation, live active mode badge, top-bar breadcrumbs, and user menu.
- `layout/AdminShell.tsx` (240 lines): Elevated administration navigation frame with red safety badges and admin privilege checks.
- `layout/AuthLayout.tsx` (180 lines): Clean authentication card layout with dotted canvas background.
- `MonacoCodeEditor.tsx` (195 lines): Microsoft Monaco code editor wrapper with syntax highlighting, language selector (`python`, `javascript`, `cpp`, `java`), and theme synchronization.
- `ProtectedRoute.tsx` (58 lines): Route guard verifying active JWT in `AuthContext` and redirecting unverified or non-admin users.

#### Frontend Services (`src/services/`)
- `api.ts` (155 lines): Axios instance configured with `withCredentials: true`, 20s timeout, request token injection, and transparent `401` token-rotation interceptor.
- `authService.ts` (79 lines): Client-side methods: `login()`, `register()`, `verifyEmail()`, `resendVerification()`, `logout()`, `getMe()`.
- `interviewService.ts` (263 lines): Interview engine interface: `createSession()`, `getSession()`, `submitAnswer()`, `completeSession()`, `getRecommendations()`, `getHistory()`, `flagEvaluation()`.
- `codingService.ts` (185 lines): Sandbox interface: `getProblems()`, `getProblemById()`, `runCode()`, `submitCode()`, `getSubmissions()`.
- `resumeService.ts` (51 lines): FormData multipart handler: `uploadResume()`, `getParsedAnalysis()`.
- `resourceService.ts` (165 lines): Repository fetcher: `getResources()`, `getCompanyQuestions()`, `downloadResource()`.
- `adminService.ts` (215 lines): Privileged admin API client: `getMetrics()`, `getUsers()`, `updateUserRole()`, `getFlaggedInterviews()`, `approveResource()`.
- `analyticsService.ts` (175 lines): Chart data transformer: `getDashboardMetrics()`, `getRubricTrends()`.

---

### 2.2 Backend Files (`backend/src/`)

#### Controllers (`src/controllers/`)
- `auth.controller.ts` (117 lines): Handlers: `register`, `login`, `verifyEmail`, `resendVerification`, `refreshToken`, `logout`, `getCurrentUser`.
- `interview.controller.ts` (141 lines): Handlers: `createSession`, `getSession`, `submitAnswer`, `completeSession`, `getRecommendations`, `getHistory`, `exportReportPdf`, `flagEvaluation`.
- `coding.controller.ts` (120 lines): Handlers: `getProblems`, `getProblemById`, `runCode`, `submitCode`, `getSubmissions`.
- `resume.controller.ts` (55 lines): Handlers: `uploadResume`, `getResumeAnalysis`.
- `resource.controller.ts` (90 lines): Handlers: `getResources`, `getResourceById`, `createResource`, `incrementDownload`.
- `companyQuestion.controller.ts` (71 lines): Handlers: `getQuestions`, `getQuestionById`, `createQuestion`.
- `bookmark.controller.ts` (36 lines): Handlers: `getBookmarks`, `toggleBookmark`.
- `dashboard.controller.ts` (21 lines): Handlers: `getDashboardStats`.
- `profile.controller.ts` (21 lines): Handlers: `getProfile`, `updateProfile`.
- `settings.controller.ts` (62 lines): Handlers: `getSettings`, `updateSettings`, `changePassword`.
- `admin.controller.ts` (125 lines): Handlers: `getMetrics`, `getUsers`, `updateUserStatus`, `getFlaggedEvaluations`, `resolveFlag`, `manageResources`.

#### Services (`src/services/`)
- `auth.service.ts` (426 lines): Registration with verification token, bcrypt password hashing, JWT generation, secure token rotation, email dispatch via nodemailer.
- `interview.service.ts` (522 lines): Session creation, question dynamic synthesis, answer scoring, Gemini evaluation orchestration, session state transition (`NOT_STARTED` -> `IN_PROGRESS` -> `COMPLETED`).
- `recommendation.service.ts` (223 lines): Post-interview gap analysis, identifying weak rubric dimensions, mapping resources to weak areas, generating markdown study notes.
- `report.service.ts` (460 lines): Server-side PDFKit vector document rendering, calculating percentile benchmarks, building charts, producing binary PDF stream.
- `codeExecution.service.ts` (362 lines): Multi-language compilation orchestrator, Judge0 / OnlineCompiler API communication, timeout monitoring, error parsing.
- `coding.service.ts` (425 lines): Problem filtering, hidden test case verification, runtime & memory aggregation, DB submission recording.
- `resume.service.ts` (141 lines): PDF/DOCX file stream extraction via `pdf-parse` & `mammoth`, prompt generation for Gemini resume scanner.
- `resource.service.ts` (223 lines): Study library filtering, departmental classification, access permission check.
- `companyQuestion.service.ts` (169 lines): Company question categorization, tag aggregation, frequency counter.
- `analytics.service.ts` (288 lines): Prisma aggregations, average rubric scores calculation, radar chart data formatting, velocity metrics.
- `admin.service.ts` (355 lines): System health monitoring, active session counting, audit logging, flagged evaluation resolution.
- `ai/geminiProvider.ts` (280 lines): Google Generative AI client wrapper, candidate model cascade (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, preview, latest), timeout race, response sanitization.
- `ai/openaiProvider.ts` (110 lines): Secondary fallback provider using OpenAI `gpt-4o-mini`.

#### Middleware (`src/middleware/`)
- `auth.middleware.ts` (55 lines): Verifies JWT Bearer token from `Authorization` header, decodes payload, attaches `req.user`.
- `authorize.middleware.ts` (25 lines): Enforces Role-Based Access Control (`Role.ADMIN` required for management endpoints).
- `validate.middleware.ts` (35 lines): Generic Express validation middleware executing Zod schemas against `req.body`, `req.params`, or `req.query`.
- `rateLimiter.ts` (45 lines): Windowed rate limiting configuring general API limits (100 req/15m) and strict auth/compiler limits (10 req/15m).
- `upload.middleware.ts` (40 lines): Multer memory storage configuration validating file extensions (`.pdf`, `.docx`) and enforcing 5MB max payload.
- `errorHandler.ts` (65 lines): Central error dispatcher mapping `AppError`, Prisma P2002 errors, Zod validation errors to standardized JSON responses.

---

## 3. Symbol & Function Lookup Table

| Function / Symbol | Location (File:Line approx) | Purpose & Responsibility |
| :--- | :--- | :--- |
| `createInterviewSession` | `backend/src/services/interview.service.ts:35` | Creates `InterviewSession`, calls Gemini to generate first 3-5 technical questions tailored to department/topic/resume. |
| `submitAndEvaluateAnswer` | `backend/src/services/interview.service.ts:165` | Evaluates candidate answer against 6 rubric dimensions and calls `generateAdaptiveFollowUp` if answer lacks depth. |
| `generateAdaptiveFollowUp` | `backend/src/services/interview.service.ts:310` | Uses Gemini Socratic prompt to generate targeted follow-up question when candidate makes partial claims. |
| `finalizeInterviewSession` | `backend/src/services/interview.service.ts:420` | Aggregates all question rubrics, computes overall score, triggers `generatePostInterviewRemediation`, sets status to `COMPLETED`. |
| `generatePostInterviewRemediation` | `backend/src/services/recommendation.service.ts:25` | Inspects low-scoring dimensions (< 65%) and generates prioritized recommendations and structured revision notes. |
| `generateInterviewReportPDF` | `backend/src/services/report.service.ts:45` | Renders official multi-page PDF performance report with student details, radar charts, and rubric breakdowns. |
| `executeCodeAgainstTests` | `backend/src/services/codeExecution.service.ts:40` | Dispatches student source code and test inputs to external execution sandbox and parses output. |
| `submitProblemSolution` | `backend/src/services/coding.service.ts:120` | Runs user code against hidden test cases, computes runtime/memory percentiles, records `CodingSubmission`. |
| `parseAndAnalyzeResume` | `backend/src/services/resume.service.ts:30` | Extracts text from PDF buffer and asks Gemini to identify skills, experience level, ATS score, and custom mock questions. |
| `generateContentWithRetry` | `backend/src/services/ai/geminiProvider.ts:50` | Executes Gemini API request with candidate model fallback (`gemini-3.5-flash` -> `gemini-3.1-flash-lite` -> preview) and 14s timeout. |
| `signAccessToken` | `backend/src/utils/jwt.ts:15` | Creates signed 15-minute HS256 JWT access token containing `id`, `email`, and `role`. |
| `signRefreshToken` | `backend/src/utils/jwt.ts:28` | Creates cryptographically secure 7-day refresh token and hashes it via SHA-256 for database persistence. |
| `rotateRefreshToken` | `backend/src/services/auth.service.ts:310` | Validates active refresh token, revokes it immediately, and issues a fresh token pair to prevent replay attacks. |
| `getStudentPerformanceMetrics` | `backend/src/services/analytics.service.ts:20` | Queries Prisma for student interview and coding trends, calculating skill averages and readiness score. |
| `getSystemWideMetrics` | `backend/src/services/admin.service.ts:25` | Aggregates platform telemetry: total active sessions, user growth, flagged evaluations, compiler failure rates. |

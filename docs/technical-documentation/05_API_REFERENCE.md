# 05 — Complete REST API Reference

Every endpoint implemented in the PrepAI backend is documented below, organized by domain module.

---

## 1. Authentication & Session APIs (`/api/auth`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/auth/register` | `POST` | Register new student or admin account | `auth.routes.ts` $\rightarrow$ `authController.register` | `authRateLimiter`, `validate(registerSchema)` | `{ email, password, fullName, branch, semester, scholarNumber?, cgpa? }` | None | `{ user, accessToken, refreshToken }` (201) | `User`, `UserProfile`, `AcademicDetails`, `UserSettings`, `RefreshToken`, `EmailVerificationToken` | `authService.register` in `RegisterPage.tsx` |
| `/api/auth/login` | `POST` | Authenticate with email and password | `auth.routes.ts` $\rightarrow$ `authController.login` | `authRateLimiter`, `validate(loginSchema)` | `{ email, password, rememberMe? }` | None | `{ user, accessToken, refreshToken }` (200) | `User` (lastLoginAt), `RefreshToken` | `authService.login` in `LoginPage.tsx` |
| `/api/auth/refresh` | `POST` | Exchange refresh token for fresh access token | `auth.routes.ts` $\rightarrow$ `authController.refresh` | `authRateLimiter`, `validate(refreshTokenSchema)` | `{ refreshToken? }` (or via cookie) | None | `{ accessToken, refreshToken }` (200) | `RefreshToken` (rotated/created) | `api.ts` (attemptTokenRefresh interceptor) |
| `/api/auth/logout` | `POST` | Invalidate current session and clear cookies | `auth.routes.ts` $\rightarrow$ `authController.logout` | None | `{ refreshToken? }` (or via cookie) | None | `{ message: "Logged out successfully." }` (200) | `RefreshToken` (deleted) | `AuthContext.logout` |
| `/api/auth/verify-email` | `POST` | Verify email address using link token | `auth.routes.ts` $\rightarrow$ `authController.verifyEmail` | `authRateLimiter`, `validate(verifyEmailSchema)` | `{ token }` | None | `{ message: "Email verified successfully." }` (200) | `User` (isEmailVerified), `EmailVerificationToken` (deleted) | `VerifyEmailPage.tsx` |
| `/api/auth/resend-verification` | `POST` | Resend verification email to user | `auth.routes.ts` $\rightarrow$ `authController.resendVerification` | `authRateLimiter`, `validate(resendVerificationSchema)` | `{ email }` | None | `{ message: "Verification email resent." }` (200) | `EmailVerificationToken` | `VerifyEmailPage.tsx` |
| `/api/auth/forgot-password` | `POST` | Request password reset email | `auth.routes.ts` $\rightarrow$ `authController.forgotPassword` | `authRateLimiter`, `validate(forgotPasswordSchema)` | `{ email }` | None | `{ message: "Password reset link sent." }` (200) | `PasswordResetToken` | `ForgotPasswordPage.tsx` |
| `/api/auth/reset-password` | `POST` | Reset password using email token | `auth.routes.ts` $\rightarrow$ `authController.resetPassword` | `authRateLimiter`, `validate(resetPasswordSchema)` | `{ token, password }` | None | `{ message: "Password reset successfully." }` (200) | `User` (passwordHash), `PasswordResetToken`, `RefreshToken` (cleared) | `ResetPasswordPage.tsx` |
| `/api/auth/me` | `GET` | Get current authenticated user profile | `auth.routes.ts` $\rightarrow$ `authController.me` | `authenticate` | None | None | `{ user }` (200) | `User`, `UserProfile`, `AcademicDetails` | `AuthContext` on bootstrap |

---

## 2. AI Technical Mock Interview APIs (`/api/interviews`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/interviews/sessions` | `GET` | List all interview sessions for user | `interview.routes.ts` $\rightarrow$ `interviewController.listSessions` | `authenticate` | None | None | `{ sessions: BackendInterviewSession[] }` (200) | `InterviewSession`, `InterviewFeedback` | `InterviewHistory.tsx` |
| `/api/interviews/sessions` | `POST` | Generate new AI mock interview session | `interview.routes.ts` $\rightarrow$ `interviewController.createSession` | `authenticate`, `aiRateLimiter`, `validate(createInterviewSessionSchema)` | `{ branch, semester, interviewType, difficulty, topic, companyName?, questionCount, durationMinutes, resumeId?, mode?, categoryDistribution? }` | None | `{ session: BackendInterviewSession }` (201) | `InterviewSession`, `InterviewQuestion` | `AIMockInterviewSetup.tsx` |
| `/api/interviews/sessions/:id` | `GET` | Get interview session details and questions | `interview.routes.ts` $\rightarrow$ `interviewController.getSession` | `authenticate` | None | `id` (CUID) | `{ session: BackendInterviewSession }` (200) | `InterviewSession`, `InterviewQuestion`, `InterviewAnswer`, `InterviewFeedback` | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/answers` | `POST` | Submit or edit question answer; receive evaluation & follow-up | `interview.routes.ts` $\rightarrow$ `interviewController.submitAnswer` | `authenticate`, `aiRateLimiter`, `validate(submitAnswerSchema)` | `{ questionId, answerText }` | `id` (CUID) | `{ evaluation: InterviewAnswer, followUpQuestion: InterviewQuestion \| null, session: BackendInterviewSession }` (200) | `InterviewAnswer`, `InterviewQuestion` | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/complete` | `POST` | Finalize session, compute 6D scores, generate roadmap report | `interview.routes.ts` $\rightarrow$ `interviewController.completeSession` | `authenticate`, `aiRateLimiter` | None | `id` (CUID) | `{ session: BackendInterviewSession }` (200) | `InterviewSession` (status=COMPLETED), `InterviewFeedback` | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/report/pdf` | `GET` | Stream compiled PDF interview report | `interview.routes.ts` $\rightarrow$ `interviewController.downloadReportPdf` | `authenticate` | None | `id` (CUID) | Binary stream (`application/pdf`) | `InterviewSession`, `InterviewFeedback`, `User` | `LiveAIInterviewRoom.tsx`, `InterviewHistory.tsx` |
| `/api/interviews/sessions/:id/recommendations` | `GET` | Fetch gap-based resources & coding problems | `interview.routes.ts` $\rightarrow$ `interviewController.getRecommendations` | `authenticate` | None | `id` (CUID) | `{ recommendations: PersonalizedRecommendation[] }` (200) | `InterviewSession`, `PreparationResource`, `CodingProblem`, `CompanyQuestion` | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/study-notes` | `POST` | Generate or refresh structured Gemini study notes | `interview.routes.ts` $\rightarrow$ `interviewController.generateStudyNotes` | `authenticate`, `aiRateLimiter` | `{ regenerate?: boolean }` | `id` (CUID) | `{ notes: StudyNotesData }` (200) | `InterviewFeedback` (studyNotes) | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/study-notes` | `GET` | Retrieve cached study notes dossier | `interview.routes.ts` $\rightarrow$ `interviewController.getStudyNotes` | `authenticate` | None | `id` (CUID) | `{ notes: StudyNotesData \| null }` (200) | `InterviewFeedback` | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/study-notes/pdf` | `GET` | Stream compiled PDF study notes dossier | `interview.routes.ts` $\rightarrow$ `interviewController.downloadStudyNotesPdf` | `authenticate` | None | `id` (CUID) | Binary stream (`application/pdf`) | `InterviewFeedback` | `LiveAIInterviewRoom.tsx` |
| `/api/interviews/sessions/:id/flag` | `POST` | Flag question or evaluation for admin moderation | `interview.routes.ts` $\rightarrow$ `interviewController.flagSession` | `authenticate`, `validate(flagSessionSchema)` | `{ reason, details? }` | `id` (CUID) | `{ flag: AiReviewFlag }` (201) | `AiReviewFlag` | `LiveAIInterviewRoom.tsx` |

---

## 3. Resume Analyzer APIs (`/api/resumes`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/resumes` | `GET` | List all uploaded resumes for user | `resume.routes.ts` $\rightarrow$ `resumeController.listResumes` | `authenticate` | None | None | `{ resumes: Resume[] }` (200) | `Resume`, `ResumeAnalysis` | `ResumeAnalyzer.tsx` |
| `/api/resumes/latest` | `GET` | Fetch latest analyzed resume | `resume.routes.ts` $\rightarrow$ `resumeController.getLatest` | `authenticate` | None | None | `{ resume: Resume \| null }` (200) | `Resume`, `ResumeAnalysis` | `AIMockInterviewSetup.tsx` |
| `/api/resumes/:id` | `GET` | Fetch single resume analysis by ID | `resume.routes.ts` $\rightarrow$ `resumeController.getById` | `authenticate` | None | `id` (CUID) | `{ resume: Resume }` (200) | `Resume`, `ResumeAnalysis` | `ResumeAnalyzer.tsx` |
| `/api/resumes/analyze` | `POST` | Upload PDF/DOCX, parse text, analyze via Gemini | `resume.routes.ts` $\rightarrow$ `resumeController.uploadAndAnalyze` | `authenticate`, `aiRateLimiter`, `resumeUpload.single('resume')` | Multipart `FormData` (`resume` file) | None | `{ resume: Resume }` (201) | `Resume`, `ResumeAnalysis` | `ResumeAnalyzer.tsx` |
| `/api/resumes/:id` | `DELETE` | Delete resume record and Cloudinary asset | `resume.routes.ts` $\rightarrow$ `resumeController.remove` | `authenticate` | None | `id` (CUID) | `{ message: "Resume deleted." }` (200) | `Resume`, `ResumeAnalysis` | `ResumeAnalyzer.tsx` |

---

## 4. Sandboxed Code Execution & Coding Practice APIs (`/api/coding`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/coding/languages` | `GET` | List supported programming languages and IDs | `coding.routes.ts` $\rightarrow$ `codingController.getLanguages` | None | None | None | `{ languages: Array<{ id, name, compilerId }> }` (200) | None | `codingService.getLanguages` in `CodingPractice.tsx` |
| `/api/coding/problems` | `GET` | List coding problems with difficulty/collection filters | `coding.routes.ts` $\rightarrow$ `codingController.listProblems` | `optionalAuthenticate`, `validate(listProblemsQuerySchema, 'query')` | None | `difficulty`, `collection`, `topic`, `search` | `{ problems: CodingProblem[] }` (200) | `CodingProblem`, `UserCodingProgress` | `CodingPractice.tsx` |
| `/api/coding/problems/:id` | `GET` | Fetch single coding problem with test cases | `coding.routes.ts` $\rightarrow$ `codingController.getProblem` | `optionalAuthenticate` | None | `id` (CUID or slug) | `{ problem: CodingProblem }` (200) | `CodingProblem` | `CodingPractice.tsx` |
| `/api/coding/problems/:id/run` | `POST` | Execute user code against sample test case | `coding.routes.ts` $\rightarrow$ `codingController.runSample` | `authenticate`, `codeExecutionRateLimiter`, `validate(executeCodeSchema)` | `{ language, sourceCode, customInput? }` | `id` (CUID) | `{ result: NormalizedExecutionResult }` (200) | None | `CodingPractice.tsx` (Run Code button) |
| `/api/coding/problems/:id/submit` | `POST` | Grade user code across all judge test cases | `coding.routes.ts` $\rightarrow$ `codingController.submitSolution` | `authenticate`, `codeExecutionRateLimiter`, `validate(executeCodeSchema)` | `{ language, sourceCode }` | `id` (CUID) | `{ submission: CodingSubmission, allPassed: boolean }` (200) | `CodingSubmission`, `UserCodingProgress` | `CodingPractice.tsx` (Submit button) |
| `/api/coding/problems/:id/progress` | `POST` | Auto-save code draft for problem | `coding.routes.ts` $\rightarrow$ `codingController.saveProgress` | `authenticate` | `{ language, code }` | `id` (CUID) | `{ progress: UserCodingProgress }` (200) | `UserCodingProgress` | `CodingPractice.tsx` |
| `/api/coding/problems/:id/progress` | `GET` | Retrieve saved code draft | `coding.routes.ts` $\rightarrow$ `codingController.getProgress` | `authenticate` | None | `id` (CUID) | `{ progress: UserCodingProgress \| null }` (200) | `UserCodingProgress` | `CodingPractice.tsx` |
| `/api/coding/problems/:id/toggle-solved` | `POST` | Toggle problem manual solved status | `coding.routes.ts` $\rightarrow$ `codingController.toggleSolved` | `authenticate` | None | `id` (CUID) | `{ solved: boolean }` (200) | `UserCodingProgress` | `CodingPractice.tsx` |
| `/api/coding/submissions` | `GET` | List candidate's past coding submissions | `coding.routes.ts` $\rightarrow$ `codingController.listSubmissions` | `authenticate` | None | `problemId?`, `limit?` | `{ submissions: CodingSubmission[] }` (200) | `CodingSubmission` | `CodingPractice.tsx` |

---

## 5. Company Questions Archive APIs (`/api/company-questions`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/company-questions/companies` | `GET` | List company catalog with caliber cards | `companyQuestion.routes.ts` $\rightarrow$ `companyQuestionController.listCompanies` | None | None | None | `{ companies: Company[] }` (200) | `Company` | `CompanyQuestions.tsx` |
| `/api/company-questions` | `GET` | Search and filter real company interview questions | `companyQuestion.routes.ts` $\rightarrow$ `companyQuestionController.listQuestions` | `optionalAuthenticate` | None | `company`, `role`, `difficulty`, `search` | `{ questions: CompanyQuestion[] }` (200) | `CompanyQuestion`, `Bookmark` | `CompanyQuestions.tsx` |
| `/api/company-questions/:id` | `GET` | Get single question details | `companyQuestion.routes.ts` $\rightarrow$ `companyQuestionController.getQuestion` | `optionalAuthenticate` | None | `id` (CUID) | `{ question: CompanyQuestion }` (200) | `CompanyQuestion` | `CompanyQuestions.tsx` |
| `/api/company-questions` | `POST` | Add interview question (ADMIN) | `companyQuestion.routes.ts` $\rightarrow$ `companyQuestionController.createQuestion` | `authenticate`, `authorize(ADMIN)`, `validate(companyQuestionCreateSchema)` | `{ title, prompt, companyName, difficulty, topic, role? }` | None | `{ question: CompanyQuestion }` (201) | `CompanyQuestion`, `Company` | `AdminDashboard.tsx` |
| `/api/company-questions/:id` | `PATCH` | Update interview question (ADMIN) | `companyQuestion.routes.ts` $\rightarrow$ `companyQuestionController.updateQuestion` | `authenticate`, `authorize(ADMIN)`, `validate(companyQuestionUpdateSchema)` | Partial question fields | `id` (CUID) | `{ question: CompanyQuestion }` (200) | `CompanyQuestion` | `AdminDashboard.tsx` |
| `/api/company-questions/:id` | `DELETE` | Delete question (ADMIN) | `companyQuestion.routes.ts` $\rightarrow$ `companyQuestionController.deleteQuestion` | `authenticate`, `authorize(ADMIN)` | None | `id` (CUID) | `{ message: "Question deleted." }` (200) | `CompanyQuestion` | `AdminDashboard.tsx` |

---

## 6. Academic Preparation Resources APIs (`/api/resources`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/resources` | `GET` | List preparation resources, notes, and GATE PYQs | `resource.routes.ts` $\rightarrow$ `resourceController.listResources` | `optionalAuthenticate` | None | `branch`, `format`, `search`, `isGatePyq` | `{ resources: PreparationResource[] }` (200) | `PreparationResource`, `Bookmark` | `PreparationResources.tsx` |
| `/api/resources/check-duplicate` | `GET` | Check if resource title or URL already exists | `resource.routes.ts` $\rightarrow$ `resourceController.checkDuplicate` | `optionalAuthenticate` | None | `title`, `contentUrl` | `{ isDuplicate: boolean }` (200) | `PreparationResource` | `PreparationResources.tsx` |
| `/api/resources/:id/upvote` | `POST` | Upvote a helpful preparation resource | `resource.routes.ts` $\rightarrow$ `resourceController.upvote` | `authenticate` | None | `id` (CUID) | `{ upvotes: number }` (200) | `PreparationResource` | `PreparationResources.tsx` |
| `/api/resources/:id/download` | `POST` | Track download count for study resource | `resource.routes.ts` $\rightarrow$ `resourceController.trackDownload` | `authenticate` | None | `id` (CUID) | `{ downloads: number }` (200) | `PreparationResource` | `PreparationResources.tsx` |
| `/api/resources/requests` | `POST` | Submit student request for study materials | `resource.routes.ts` $\rightarrow$ `resourceController.requestResource` | `authenticate`, `validate(resourceRequestCreateSchema)` | `{ title, subject, branch, description }` | None | `{ request: ResourceRequest }` (201) | `ResourceRequest` | `PreparationResources.tsx` |
| `/api/resources` | `POST` | Upload/publish resource (ADMIN) | `resource.routes.ts` $\rightarrow$ `resourceController.createResource` | `authenticate`, `authorize(ADMIN)`, `validate(resourceCreateSchema)` | `{ title, subject, format, difficulty, contentUrl, branch, isGatePyq }` | None | `{ resource: PreparationResource }` (201) | `PreparationResource` | `AdminDashboard.tsx` |
| `/api/resources/:id` | `PATCH` | Update resource (ADMIN) | `resource.routes.ts` $\rightarrow$ `resourceController.updateResource` | `authenticate`, `authorize(ADMIN)`, `validate(resourceUpdateSchema)` | Partial resource fields | `id` (CUID) | `{ resource: PreparationResource }` (200) | `PreparationResource` | `AdminDashboard.tsx` |
| `/api/resources/:id` | `DELETE` | Delete resource (ADMIN) | `resource.routes.ts` $\rightarrow$ `resourceController.deleteResource` | `authenticate`, `authorize(ADMIN)` | None | `id` (CUID) | `{ message: "Resource deleted." }` (200) | `PreparationResource` | `AdminDashboard.tsx` |

---

## 7. Unified Bookmarks APIs (`/api/bookmarks`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/bookmarks` | `GET` | List all user bookmarks grouped by target type | `bookmark.routes.ts` $\rightarrow$ `bookmarkController.list` | `authenticate` | None | `targetType?` | `{ bookmarks: Bookmark[] }` (200) | `Bookmark` | `Bookmarks.tsx` |
| `/api/bookmarks/toggle` | `POST` | Toggle bookmark (add if missing, delete if present) | `bookmark.routes.ts` $\rightarrow$ `bookmarkController.toggle` | `authenticate`, `validate(toggleBookmarkSchema)` | `{ targetType, targetId }` | None | `{ bookmarked: boolean }` (200) | `Bookmark` | Bookmark buttons across all screens |
| `/api/bookmarks/:id` | `DELETE` | Remove specific bookmark by ID | `bookmark.routes.ts` $\rightarrow$ `bookmarkController.remove` | `authenticate` | None | `id` (CUID) | `{ message: "Bookmark removed." }` (200) | `Bookmark` | `Bookmarks.tsx` |

---

## 8. Student Dashboard & Analytics APIs (`/api`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/dashboard` | `GET` | Fetch student home stats, streak, recent activities | `dashboard.routes.ts` $\rightarrow$ `dashboardController.getDashboard` | `authenticate` | None | None | `{ stats, recentInterviews, recentSubmissions, recommendations }` (200) | `InterviewSession`, `CodingSubmission`, `UserCodingProgress`, `Bookmark` | `UserDashboard.tsx` |
| `/api/analytics` | `GET` | Multi-dimensional competency scores & weekly progress | `dashboard.routes.ts` $\rightarrow$ `dashboardController.getAnalytics` | `authenticate` | None | None | `{ competencyRadar, interviewPerformanceTrends, solvedByDifficulty }` (200) | `InterviewSession`, `InterviewFeedback`, `CodingSubmission` | `AnalyticsDashboard.tsx` |
| `/api/health` | `GET` | System health and integration readiness | `app.ts` (inline handler) | None | None | None | `{ status: "ok", integrations: { hasGemini, hasOpenAi, ... } }` (200) | None | `AIMockInterviewSetup.tsx` |

---

## 9. Profile & Settings APIs (`/api/profile` & `/api/settings`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/profile` | `GET` | Get full user profile with academic details | `profile.routes.ts` $\rightarrow$ `profileController.getProfile` | `authenticate` | None | None | `{ profile, academicDetails, branch, semester }` (200) | `User`, `UserProfile`, `AcademicDetails` | `UserProfile.tsx` |
| `/api/profile` | `PATCH` | Update bio, phone, branch, semester, CGPA | `profile.routes.ts` $\rightarrow$ `profileController.updateProfile` | `authenticate`, `validate(updateProfileSchema)` | `{ fullName, phone, bio, branch, semester, scholarNumber, cgpa }` | None | `{ profile, academicDetails }` (200) | `UserProfile`, `AcademicDetails` | `UserProfile.tsx` |
| `/api/settings` | `GET` | Get notification & study preferences | `settings.routes.ts` $\rightarrow$ `settingsController.getSettings` | `authenticate` | None | None | `{ settings: UserSettings }` (200) | `UserSettings` | `Settings.tsx` |
| `/api/settings` | `PATCH` | Update theme, difficulty, email notifications | `settings.routes.ts` $\rightarrow$ `settingsController.updateSettings` | `authenticate`, `validate(updateSettingsSchema)` | Partial settings object | None | `{ settings: UserSettings }` (200) | `UserSettings` | `Settings.tsx` |
| `/api/settings/change-password` | `POST` | Change account password with current verification | `settings.routes.ts` $\rightarrow$ `settingsController.changePassword` | `authenticate`, `validate(changePasswordSchema)` | `{ currentPassword, newPassword }` | None | `{ message: "Password updated successfully." }` (200) | `User` (passwordHash), `RefreshToken` | `Settings.tsx` |
| `/api/settings/sessions` | `GET` | View active login sessions | `settings.routes.ts` $\rightarrow$ `settingsController.listSessions` | `authenticate` | None | None | `{ sessions: Array<{ id, userAgent, ipAddress, createdAt, isCurrent }> }` (200) | `RefreshToken` | `Settings.tsx` |
| `/api/settings/logout-all` | `POST` | Invalidate all refresh tokens across all devices | `settings.routes.ts` $\rightarrow$ `settingsController.logoutAllDevices` | `authenticate` | None | None | `{ message: "All sessions terminated." }` (200) | `RefreshToken` (deleted) | `Settings.tsx` |
| `/api/settings/account` | `DELETE` | Permanently delete user account and associated data | `settings.routes.ts` $\rightarrow$ `settingsController.deleteAccount` | `authenticate`, `validate(deleteAccountSchema)` | `{ password }` | None | `{ message: "Account deleted." }` (200) | `User` (Cascade deletion across all tables) | `Settings.tsx` |

---

## 10. Administrator Moderation Portal APIs (`/api/admin`)

| Endpoint | Method | Purpose | Route File & Controller | Middleware | Request Body | Query/Params | Response Structure | DB Models Affected | Frontend Caller |
|---|---|---|---|---|---|---|---|---|---|
| `/api/admin/overview` | `GET` | Platform-wide KPIs & high-level stats | `admin.routes.ts` $\rightarrow$ `adminController.getOverview` | `authenticate`, `authorize(ADMIN)` | None | None | `{ totalUsers, totalInterviews, totalSubmissions, activeFlags }` (200) | `User`, `InterviewSession`, `AiReviewFlag` | `AdminDashboard.tsx` |
| `/api/admin/users` | `GET` | Paginated user directory | `admin.routes.ts` $\rightarrow$ `adminController.listUsers` | `authenticate`, `authorize(ADMIN)` | None | `page`, `limit`, `search`, `role` | `{ users: User[], total }` (200) | `User`, `UserProfile`, `AcademicDetails` | `AdminDashboard.tsx` |
| `/api/admin/users/:id` | `PATCH` | Update user role (`USER` $\leftrightarrow$ `ADMIN`) or active status | `admin.routes.ts` $\rightarrow$ `adminController.updateUser` | `authenticate`, `authorize(ADMIN)`, `validate(adminUpdateUserSchema)` | `{ role?, isActive? }` | `id` (CUID) | `{ user: User }` (200) | `User` | `AdminDashboard.tsx` |
| `/api/admin/resource-requests` | `GET` | List student study material requests | `admin.routes.ts` $\rightarrow$ `adminController.listResourceRequests` | `authenticate`, `authorize(ADMIN)` | None | None | `{ requests: ResourceRequest[] }` (200) | `ResourceRequest` | `AdminDashboard.tsx` |
| `/api/admin/resource-requests/:id` | `PATCH` | Approve or reject student request | `admin.routes.ts` $\rightarrow$ `adminController.updateResourceRequest` | `authenticate`, `authorize(ADMIN)`, `validate(adminUpdateRequestSchema)` | `{ status: "APPROVED" \| "REJECTED", adminNotes? }` | `id` (CUID) | `{ request: ResourceRequest }` (200) | `ResourceRequest` | `AdminDashboard.tsx` |
| `/api/admin/ai-reviews` | `GET` | List candidate-flagged interview evaluations | `admin.routes.ts` $\rightarrow$ `adminController.listAiReviews` | `authenticate`, `authorize(ADMIN)` | None | `status?` | `{ flags: AiReviewFlag[] }` (200) | `AiReviewFlag`, `InterviewSession` | `AdminDashboard.tsx` |
| `/api/admin/ai-reviews/:id` | `PATCH` | Resolve or dismiss flagged evaluation with audit notes | `admin.routes.ts` $\rightarrow$ `adminController.resolveAiReview` | `authenticate`, `authorize(ADMIN)`, `validate(adminResolveFlagSchema)` | `{ status: "RESOLVED" \| "DISMISSED", resolutionNotes? }` | `id` (CUID) | `{ flag: AiReviewFlag }` (200) | `AiReviewFlag` | `AdminDashboard.tsx` |
| `/api/admin/analytics` | `GET` | Detailed placement and branch score distributions | `admin.routes.ts` $\rightarrow$ `adminController.getAnalytics` | `authenticate`, `authorize(ADMIN)` | None | None | `{ branchAverages, difficultyPassRates, companyDistribution }` (200) | `InterviewSession`, `InterviewFeedback` | `AdminDashboard.tsx` |
| `/api/admin/coding-problems` | `GET` | List coding problems with full test case datasets | `admin.routes.ts` $\rightarrow$ `adminController.listCodingProblems` | `authenticate`, `authorize(ADMIN)` | None | None | `{ problems: CodingProblem[] }` (200) | `CodingProblem` | `AdminDashboard.tsx` |
| `/api/admin/coding-problems` | `POST` | Create coding problem with judge test cases | `admin.routes.ts` $\rightarrow$ `adminController.createCodingProblem` | `authenticate`, `authorize(ADMIN)` | Full problem object including test cases | None | `{ problem: CodingProblem }` (201) | `CodingProblem` | `AdminDashboard.tsx` |
| `/api/admin/coding-problems/:id` | `PUT` | Update coding problem | `admin.routes.ts` $\rightarrow$ `adminController.updateCodingProblem` | `authenticate`, `authorize(ADMIN)` | Full problem object | `id` (CUID) | `{ problem: CodingProblem }` (200) | `CodingProblem` | `AdminDashboard.tsx` |
| `/api/admin/coding-problems/:id` | `DELETE` | Delete coding problem | `admin.routes.ts` $\rightarrow$ `adminController.deleteCodingProblem` | `authenticate`, `authorize(ADMIN)` | None | `id` (CUID) | `{ message: "Problem deleted." }` (200) | `CodingProblem` | `AdminDashboard.tsx` |
| `/api/admin/interviews` | `GET` | Audit student interview sessions across campus | `admin.routes.ts` $\rightarrow$ `adminController.listInterviews` | `authenticate`, `authorize(ADMIN)` | None | `branch?`, `type?` | `{ interviews: InterviewSession[] }` (200) | `InterviewSession` | `AdminDashboard.tsx` |

# 10 — System Architecture & Sequence Diagrams

This document contains architectural blueprints and execution sequence diagrams representing the actual implemented flows in PrepAI.

---

## 1. High-Level Full-Stack System Architecture

```mermaid
flowchart TD
    subgraph Browser ["Candidate / Admin Browser"]
        SPA["React 18 SPA (Vite)"]
        Monaco["Monaco Editor (VS Code Engine)"]
        Contexts["AuthContext & AppContext"]
    end

    subgraph SecurityBoundary ["Security & API Gateway (Express)"]
        CORS["CORS & Helmet"]
        RateLimits["Tiered Rate Limiters"]
        JWTAuth["JWT Middleware & RBAC Guard"]
        Zod["Zod Payload Validation"]
    end

    subgraph CoreServices ["Backend Application Services"]
        AuthSvc["Auth Service"]
        InterviewSvc["Interview Service"]
        CodingSvc["Coding & Judge Service"]
        ResumeSvc["Resume Service"]
        RecSvc["Recommendation Engine"]
        ReportSvc["Report & PDF Compiler"]
        AdminSvc["Admin Service"]
    end

    subgraph ExternalEcosystem ["External Services & AI"]
        Gemini["Google Gemini 3.5 Flash"]
        OpenAI["OpenAI GPT-4o-mini"]
        OnlineCompiler["OnlineCompiler.io API"]
        Cloudinary["Cloudinary CDN"]
        SMTP["Gmail SMTP (Port 587)"]
    end

    subgraph DatabaseLayer ["Database"]
        Prisma["Prisma ORM Client"]
        Postgres[("PostgreSQL 15+ (24 Models)")]
    end

    Browser <-->|JSON REST over HTTPS / Cookie Auth| SecurityBoundary
    SecurityBoundary --> CoreServices
    CoreServices --> ExternalEcosystem
    CoreServices --> Prisma
    Prisma <--> Postgres
```

---

## 2. Authentication & Silent Refresh Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Engineering Candidate
    participant UI as React Frontend
    participant API as Express Auth Router
    participant DB as PostgreSQL (Prisma)

    %% Login
    Candidate->>UI: Enters Email & Password
    UI->>API: POST /api/auth/login
    API->>DB: Query User by email
    API->>API: Verify password with bcrypt.compare()
    API->>DB: Insert hashed RefreshToken, update lastLoginAt
    API-->>UI: 200 OK (AccessToken in JSON, RefreshToken in HTTP-Only Cookie)
    UI-->>Candidate: Navigates to Dashboard

    %% Access Token Expired
    Note over UI,API: 15 minutes pass. Access token expires.
    Candidate->>UI: Navigates to Coding Practice
    UI->>API: GET /api/coding/problems (Bearer Expired_Access_Token)
    API-->>UI: 401 Unauthorized (Token expired)

    %% Transparent Refresh Interceptor
    Note over UI: api.ts catches 401 & triggers silent refresh
    UI->>API: POST /api/auth/refresh (Cookie: refreshToken)
    API->>DB: Find active RefreshToken by SHA-256 hash
    API->>DB: Rotate RefreshToken in DB
    API-->>UI: 200 OK (New AccessToken + New Cookie)
    
    %% Retrying original request
    UI->>API: GET /api/coding/problems (Bearer New_Access_Token)
    API->>DB: Query CodingProblems
    API-->>UI: 200 OK (Problems array)
    UI-->>Candidate: Renders problem list seamlessly
```

---

## 3. AI Mock Interview & Follow-up Loop Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate
    participant Room as LiveAIInterviewRoom.tsx
    participant Controller as interview.controller.ts
    participant Service as interview.service.ts
    participant Gemini as geminiProvider.ts
    participant DB as PostgreSQL (Prisma)

    %% Start
    Candidate->>Room: Types technical response to Question #1
    Candidate->>Room: Clicks "Submit Response"
    Room->>Controller: POST /api/interviews/sessions/:id/answers
    Controller->>Service: submitAnswer(sessionId, questionId, text)
    
    %% AI Evaluation
    Service->>DB: Fetch session, current question, and history
    Service->>Gemini: evaluateAnswer(prompt, expectedConcepts, answer, history)
    Gemini->>Gemini: 14s Timeout Guard + JSON schema validation
    Gemini-->>Service: Rubric Scores (6D) + Examiner Feedback + Follow-up Question

    %% Upsert & Question Insertion
    Service->>DB: Transaction: tx.interviewAnswer.upsert()
    Service->>DB: Transaction: Shift subsequent questions orderIndex + 1
    Service->>DB: Transaction: Insert followUpQuestion as Q2 (FU)
    Service-->>Controller: Return updated session
    Controller-->>Room: 200 OK (evaluation, followUpQuestion, session)
    Room-->>Candidate: Updates 6-dimension rubric, shows examiner feedback & Q2 (FU) badge
```

---

## 4. Multi-Language Code Execution & Judging Pipeline

```mermaid
flowchart TD
    CandidateCode["Candidate Source Code (C++, Python, Java, JS, Go)"] --> Editor["Monaco Code Editor"]
    Editor --> Action{"Action Selected"}

    Action -->|Run Sample| RunAPI["POST /api/coding/problems/:id/run"]
    Action -->|Submit Solution| SubmitAPI["POST /api/coding/problems/:id/submit"]

    subgraph SandboxedRunner ["codeExecution.service.ts"]
        FormatPayload["Map Language ID (g++-15, python-3.14, etc.)\nCap at 100 KB"]
        ExecEngine["Invoke OnlineCompiler.io / Judge0 API\n(35s Timeout Race)"]
        Normalize["Normalize Output, Exit Code & Metrics"]
    end

    RunAPI --> SandboxedRunner
    SubmitAPI --> LoopTestCases["Iterate Problem Test Cases (coding.service.ts)"]
    LoopTestCases --> SandboxedRunner

    SandboxedRunner --> VerdictCheck{"Is Output == Expected?"}
    VerdictCheck -->|All Passed| Accepted["Verdict: ACCEPTED\nUpdate UserCodingProgress"]
    VerdictCheck -->|Mismatch| WrongAnswer["Verdict: WRONG_ANSWER\nShow expected vs got diff"]
    VerdictCheck -->|Exit Code 124| TLE["Verdict: TIME_LIMIT_EXCEEDED"]
    VerdictCheck -->|Compilation Failed| CompileErr["Verdict: COMPILATION_ERROR\nShow compiler diagnostics"]

    Accepted --> SaveDB["Persist in CodingSubmission Table"]
    WrongAnswer --> SaveDB
    TLE --> SaveDB
    CompileErr --> SaveDB
```

---

## 5. Resume Parsing & Personalized Interview Alignment

```mermaid
flowchart TD
    UserResume["Resume File (PDF / DOCX, Max 5MB)"] --> Dropzone["ResumeAnalyzer.tsx Upload Dropzone"]
    Dropzone --> UploadAPI["POST /api/resumes/analyze (Multipart FormData)"]
    
    subgraph BackendResumeService ["resume.service.ts"]
        MemoryMulter["Multer Memory Buffer"]
        FileTypeCheck{"File Type"}
        FileTypeCheck -->|PDF| PDFParse["pdf-parse (Extract Text)"]
        FileTypeCheck -->|DOCX| Mammoth["mammoth.extractRawText"]
        
        PDFParse --> CloudinaryStream["Cloudinary uploadStream (Save CDN URL)"]
        Mammoth --> CloudinaryStream
        
        PDFParse --> GeminiResume["geminiProvider.analyzeResume()"]
        Mammoth --> GeminiResume
    end
    
    UploadAPI --> BackendResumeService
    GeminiResume --> StructuredJSON["Extract JSON: Summary, Skills, Projects, Work Experience, Focus Areas"]
    StructuredJSON --> DBResume["Save to Resume & ResumeAnalysis Tables"]
    DBResume --> UIResponse["Display Extracted Skills & Project Highlights"]
    UIResponse --> StartInterview["'Launch Resume-Based Mock Interview'"]
    StartInterview --> InterviewRoom["AI Interviewer personalizes questions directly on candidate's real projects"]
```

---

## 6. Post-Interview Remediation & Study Dossier Pipeline

```mermaid
flowchart TD
    CompletedInterview["Completed Interview Session"] --> GapsAnalysis["recommendation.service.ts\n(Extract Questions < 75% & Missing Concepts)"]
    
    subgraph MatchingEngine ["PostgreSQL Recommendation Matcher"]
        QueryResources["Query PreparationResource (GATE PYQs, Core CS Notes)"]
        QueryProblems["Query CodingProblem (Striver A2Z / CP-31 Problems)"]
        QueryCompany["Query CompanyQuestion (Google, Amazon, etc.)"]
    end
    
    GapsAnalysis --> MatchingEngine
    MatchingEngine --> PriorityAssign["Assign Priority (HIGH / MEDIUM / LOW) & Estimated Study Hours"]
    PriorityAssign --> RecUI["Display Priority Recommendation Cards in LiveAIInterviewRoom"]

    CompletedInterview --> StudyNotesTrigger["POST /api/interviews/sessions/:id/study-notes"]
    StudyNotesTrigger --> GeminiDossier["geminiProvider.generateStudyNotes()"]
    GeminiDossier --> CacheNotes["Cache in InterviewFeedback.studyNotes"]
    CacheNotes --> RenderPDF["report.service.ts (PDFKit Document Generation)"]
    RenderPDF --> StreamPDF["GET /api/interviews/sessions/:id/study-notes/pdf\n(Downloadable Master Revision Dossier)"]
```

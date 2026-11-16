# PrepAI – AI-Powered Technical Interview Preparation Platform

**B.Tech Major Project Final Presentation, Viva Voce & Technical Dossier**  
**Department of Computer Science & Engineering**  
**Maulana Azad National Institute of Technology (MANIT), Bhopal**

---

## 1. Project Abstract

**PrepAI** is an enterprise-grade, intelligent technical interview preparation and assessment platform designed specifically for undergraduate engineering students and placement candidates. Unlike conventional preparation tools that rely on static question banks or one-way video recordings, PrepAI introduces an **adaptive, AI-driven technical examiner** capable of conducting real-time verbal and coding cross-examinations.

Powered by Google Generative AI (Gemini 3.5 / 3.1 Flash) with a resilient multi-model fallback cascade, PrepAI dynamically synthesizes technical questions tailored to a student's engineering discipline (Computer Science, Electronics & Communication, Electrical, and Mechanical Engineering), target hiring company (Google, Microsoft, Amazon, Atlassian, Oracle, TCS Ninja/Digital), and verified resume experience.

PrepAI incorporates a **Socratic follow-up engine** that detects incomplete, shallow, or hand-wavy claims in candidate responses and counter-probes their logic in real time. Following each interview, the platform evaluates the candidate across six standardized hiring dimensions, generates chapter-by-chapter remediation study notes with code walkthroughs, and produces an official vector-rendered PDF performance report. Complementing the verbal examiner is an in-browser **multi-language code execution sandbox** (supporting C++, Java, Python, and JavaScript) with automated judging against hidden test cases.

---

## 2. Problem Statement & Motivation

### The Engineering Placement Dilemma
Every year, thousands of B.Tech students appear for campus recruitment drives and off-campus technical evaluations. Candidates face significant hurdles:

1. **Lack of Personalized Technical Mock Feedback**: Mock interviews conducted by peers or seniors are subjective, irregular, and lack rigorous evaluation rubrics. Commercial human mock platforms charge prohibitive fees ($50–$150 per session), making regular practice inaccessible to most students.
2. **Static & Predictable Practice Platforms**: Platforms like LeetCode and GeeksforGeeks offer rich coding problems but fail to prepare students for the **verbal cross-examination** where interviewers probe design decisions, edge cases, time complexity tradeoffs, and architectural invariants.
3. **Discipline-Specific Placement Gaps**: Non-CSE students (ECE, EE, ME) who prepare for technical software roles or core engineering technical interviews lack targeted question repositories aligned with their academic curriculum and target industry profiles.
4. **Disjointed Preparation Ecosystem**: Students are forced to juggle multiple disconnected tools: one for resume ATS checks, one for LeetCode practice, another for past-year company questions, and manual notes for interview remediation.

### The PrepAI Solution
PrepAI unifies the entire technical recruitment lifecycle into a single cohesive platform:
- **Resume Diagnostic Scanner**: Extracts candidate experience and seeds personalized technical interview probes.
- **Adaptive Verbal Examiner**: Socratic multi-turn interview with real-time speech-to-text.
- **Monaco Code Sandbox**: Low-latency code compilation and hidden test-case grading.
- **Automated Post-Interview Remediation**: Automatically identifies conceptual gaps and synthesizes tailored revision material.
- **Verifiable PDF Performance Scorecards**: Shareable, downloadable reports with dimensional radar benchmarks.

---

## 3. High-Level System Architecture

PrepAI is built using a modern, decoupled monolithic client-server architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (React 18 + Vite)                       │
│  - Tailwind CSS + Lucide Icons + Dotted Canvas Grid                   │
│  - Web Speech API (Real-Time Audio Transcription)                      │
│  - Monaco Code Editor (Multi-Language Syntax Highlighting)             │
│  - Axios Client (Transparent 401 Silent Token Rotation)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND GATEWAY (Node.js + Express)                  │
│  - Helmet Security Headers & CORS Protection                           │
│  - Windowed Rate Limiting (General + Auth/Compiler Endpoints)          │
│  - Dual-Token JWT Authentication (15m Access + 7d Rotating Refresh)    │
│  - Role-Based Access Control (RBAC: USER, ADMIN)                       │
│  - Zod Request Schema Validation                                       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       CORE APPLICATION SERVICES      │  │      EXTERNAL PROVIDERS      │
│  - Interview Service (Session/Rubric)│  │  - Google Gemini AI API      │
│  - Coding Service (Judge Pipeline)   │  │    (Cascade: 3.5 -> 3.1)     │
│  - Resume Service (pdf-parse/mammoth)│  │  - OpenAI API (Fallback)     │
│  - Report Service (PDFKit Vector)    │  │  - OnlineCompiler.io / Judge0│
│  - Recommendation & Study Note Engine│  │  - Gmail SMTP (Nodemailer)   │
│  - Admin Telemetry & Audit Service   │  │  - Cloudinary Media Storage  │
└───────────────────┬──────────────────┘  └──────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER (PostgreSQL 15+)                   │
│  - Prisma ORM (24 Models, 8 Enums, Strict Foreign Key Cascades)        │
│  - SHA-256 Hashed Refresh Token Storage                                │
│  - Comprehensive Indexing on userId, sessionId, and problemId          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Architectural Innovations

### 1. Adaptive Socratic Interviewing Loop
Unlike static questionnaire systems, PrepAI evaluates candidate answers in real time against a 6-dimensional hiring rubric:
$$\text{Overall Score} = \frac{\sum_{i=1}^{6} w_i \cdot \text{Dimension Score}_i}{\sum_{i=1}^{6} w_i}$$

When an answer exhibits high surface-level confidence but low technical depth ($<60\%$), or when a candidate introduces an unproven algorithmic claim, the AI evaluator halts the linear sequence and dynamically inserts an **adaptive follow-up question** (`isFollowUp: true`) directly into the session timeline.

### 2. Multi-Tier AI Provider Cascade & 14s Timeout Guard
External LLM APIs occasionally suffer from rate limits, network jitter, or cold starts. PrepAI implements an automated failover strategy in `geminiProvider.ts`:
1. Attempts evaluation with `gemini-3.5-flash` with a 14-second strict timeout (`Promise.race`).
2. If timed out or rejected, automatically falls back to `gemini-3.1-flash-lite`.
3. If primary Google endpoints are degraded, optionally attempts secondary `gpt-4o-mini`.
4. If external networks are completely partitioned, falls back to a deterministic, offline synthesis engine ensuring zero user session crashes.

### 3. Dual-Token Sliding Refresh Authentication
PrepAI combines user convenience with high security:
- **Access Token**: Short-lived (15 minutes), signed via HS256 HMAC, stored only in client memory.
- **Refresh Token**: Long-lived (7 days), stored as a cryptographically hashed SHA-256 string in the database and delivered to the browser exclusively via a `SameSite=Strict`, `HttpOnly`, `Secure` cookie.
- **Replay Detection**: Any attempt to use an old refresh token immediately invalidates the entire refresh token family for that user.

### 4. Low-Latency Code Execution Pipeline
The platform integrates Monaco Editor with a multi-language compiler sandbox. Source code is dispatched to the backend execution service, which wraps the user program, injects input streams, monitors memory usage and execution time, and terminates long-running code exceeding 2,000 ms to prevent infinite loops.

### 5. Server-Side Vector PDF Report Generation
Rather than capturing brittle frontend DOM screenshots or running heavyweight headless browsers (e.g. Puppeteer), PrepAI utilizes **PDFKit** to render native vector PDF reports directly on the backend. Reports include candidate metadata, score summaries, dimensional radar benchmarks, complete question-answer transcripts, model solutions, and personalized remediation roadmaps.

---

## 5. Technology Stack Summary

| Layer | Technologies Used | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite | High developer velocity, rapid HMR, optimized production bundle size. |
| **Styling & Icons** | Tailwind CSS, Lucide React | Modern, responsive utility classes with unified lavender/slate palette and dotted canvas grid. |
| **Code Editor** | Microsoft Monaco Editor (`@monaco-editor/react`) | Industry-standard IDE experience identical to VS Code with full syntax highlighting. |
| **Backend Runtime** | Node.js (v18+), Express.js | Event-driven, non-blocking asynchronous I/O ideal for orchestrating AI and compiler requests. |
| **Language** | TypeScript (Frontend & Backend) | Full static type safety across API boundaries, reducing runtime defects. |
| **Database & ORM** | PostgreSQL 15, Prisma ORM | ACID-compliant relational storage with type-safe schema migrations and relational cascading. |
| **Primary AI Engine** | Google Generative AI (Gemini Flash) | Ultra-low latency (< 1.2s response time), large context window, cost-effective scaling. |
| **Security & Auth** | Bcrypt (10 rounds), JSON Web Tokens, Helmet | Industry-standard password hashing, stateless authorization, and HTTP defense-in-depth. |
| **Document Generation** | PDFKit | High-performance, streaming vector PDF rendering without external browser dependencies. |
| **Document Parsing** | `pdf-parse`, `mammoth` | In-memory text extraction from candidate PDF and Word resumes without writing to disk. |
| **Cloud Deployment** | Render, Docker, PostgreSQL Cloud | Automated Blueprint deployment via `render.yaml`, unified SPA rewrites, and environment isolation. |

---

## 6. Functional Module Catalog

PrepAI includes 11 fully integrated functional modules:

1. **Authentication & Identity**: User registration with academic department and semester binding, email activation via SMTP, login, silent token rotation, and password reset.
2. **AI Mock Interview Engine**: Configurable verbal and coding interviews with discipline, difficulty, topic, and company targeting.
3. **Live Interview Room**: Real-time microphone audio transcription, dynamic question carousel, Socratic follow-up triggers, rubric drawer, and timekeeper.
4. **Post-Interview Remediation**: Automated gap analysis identifying weak rubric dimensions, tailored study notes with code snippets, and linked learning resources.
5. **Interactive Coding Workbench**: LeetCode-style problem catalog, test-case previewer, standard I/O console, and multi-language compiler.
6. **Resume Diagnostic Scanner**: ATS scoring, skill extraction, project analysis, and automated interview question seeding.
7. **Preparation Resources Library**: Curated departmental study materials, past-year examination papers, and interview cheat sheets.
8. **Company Question Archive**: Real technical interview questions from top tech employers categorized by frequency and branch.
9. **Student Bookmarks**: Quick-access repository for saving challenging coding problems, questions, and resources.
10. **Analytics & Performance Tracking**: Graphical radar charts visualizing skill growth over time and placement readiness scores.
11. **Admin Oversight & Moderation Portal**: Real-time platform metrics, user management, resource approval workflows, and flagged evaluation dispute resolution.

---

## 7. Verification, Testing & Quality Assurance

The PrepAI project underwent thorough verification prior to deployment:

- **Automated Test Suite**: 28 out of 28 unit and integration tests passing (`interview.test.ts`, `coding.test.ts`, `api.test.ts`).
- **TypeScript Compilation**: Zero compilation errors across both backend (`tsc --noEmit`) and frontend (`vite build`).
- **End-to-End Live Audit**: Verified end-to-end execution on candidate "Rahul Sharma" (CSE, Semester 7):
  - Session ID: `cm8190abc-test-session-001`
  - 6 Questions answered, evaluated across all 6 dimensions.
  - Overall Score: `81.67 / 100` (Proficient Tier).
  - Remediation study notes generated.
  - 4-page official PDF report compiled and verified.
- **Production Readiness**: Fully configured for single-command deployment via `render.yaml` with PostgreSQL database provisioning.

---

## 8. Viva Voce & Project Defense Cheat Sheet

### Q1: Why did you choose Google Gemini over OpenAI GPT-4?
**Answer**: *Google Gemini 3.5/3.1 Flash was chosen primarily for its balance of speed and cost. Technical interview mock sessions require sub-1.5 second response times so the candidate experiences an interactive conversation rather than a sluggish delay. Gemini Flash delivers latency 2-3x lower than standard GPT-4 at a fraction of the token cost. Furthermore, our architecture includes an abstract AI provider interface (`geminiProvider.ts` and `openaiProvider.ts`), enabling seamless failover should Gemini become unavailable.*

### Q2: How does the platform prevent candidates from waiting indefinitely if the AI model stalls?
**Answer**: *All external AI requests are wrapped in a strict 14-second timeout race using `Promise.race()` against a rejection timer. If the primary model (`gemini-3.5-flash`) does not respond within 14 seconds, the request is aborted and automatically rerouted to our secondary fallback model (`gemini-3.1-flash-lite`). If both models fail, our deterministic fallback synthesis engine produces curated questions or scoring based on stored rubrics, ensuring the candidate's session never hangs or crashes.*

### Q3: What is the Socratic follow-up mechanism and how is it triggered?
**Answer**: *During the live interview, when a candidate submits an answer, our evaluation prompt assesses not only correctness but also technical depth, edge case awareness, and complexity analysis. If the candidate achieves high accuracy but scores below 60% on technical depth, or introduces an algorithmic assertion without justifying the invariant, the evaluator triggers `generateAdaptiveFollowUp()`. This constructs a targeted counter-question (e.g. asking how the solution scales under memory pressure or with streaming inputs) and dynamically inserts it as a child question (`isFollowUp: true`) into the interview timeline.*

### Q4: Why implement a dual-token JWT architecture instead of a simple session cookie or single long-lived JWT?
**Answer**: *A single long-lived JWT in `localStorage` is vulnerable to XSS attacks and cannot be revoked without maintaining a centralized token blacklist. A purely stateful session cookie introduces database lookup overhead on every single API request. Our dual-token approach offers the best of both worlds: a short-lived (15-minute) JWT access token held in memory provides ultra-fast, stateless authorization, while a 7-day refresh token stored in an `HttpOnly`, `SameSite=Strict` cookie allows transparent, silent renewal (`api.ts` Axios interceptor) and enables immediate server-side revocation on logout.*

### Q5: How do you prevent malicious code execution in the Coding Practice module?
**Answer**: *Code is never executed on the host application server. Submissions are dispatched to isolated sandbox workers (via Judge0 / OnlineCompiler engine). Execution is strictly sandboxed with constrained CPU quotas, 2,000 ms wall-clock execution limits to prevent infinite loops, disabled network access to prevent unauthorized outbound socket connections, and strict memory limits (512 MB). Any timeout immediately terminates the process with a `TIME_LIMIT_EXCEEDED` status.*

### Q6: Why render PDF reports using PDFKit on the backend rather than using the browser's `window.print()`?
**Answer**: *Browser `window.print()` relies on the user's local operating system, screen dimensions, browser print engine, and CSS print media queries. This leads to unpredictable page breaks, missing graphics, and unstyled tables. By using PDFKit on the server, PrepAI programmatically constructs exact vector graphics, consistent typography, custom headers, and multi-column tables with millimeter precision, guaranteeing an identical, professional report regardless of the candidate's device.*

### Q7: How does PrepAI adapt to non-Computer Science engineering branches?
**Answer**: *During registration and interview configuration, candidates specify their engineering department (`CSE`, `ECE`, `EE`, `ME`). When generating questions and selecting preparation resources, the backend injects domain-specific taxonomies: Embedded Systems, Verilog, and Microcontrollers for ECE; Power Electronics, Control Systems, and Microprocessors for EE; Thermodynamics, Fluid Mechanics, and CAD/Dynamics for ME. This ensures students outside CSE receive technically rigorous, branch-aligned preparation for both core engineering and multidisciplinary technology interviews.*

---

## 9. Comprehensive Documentation Index

For deep technical inspection of specific subsystems, refer to the documentation suite in `docs/technical-documentation/`:

1. [01_PROJECT_OVERVIEW.md](file:///C:/major-project/docs/technical-documentation/01_PROJECT_OVERVIEW.md) — Executive summary, repository tree, and component catalog.
2. [02_FRONTEND_ARCHITECTURE.md](file:///C:/major-project/docs/technical-documentation/02_FRONTEND_ARCHITECTURE.md) — React 18, Vite, Context architecture, and routing.
3. [03_BACKEND_ARCHITECTURE.md](file:///C:/major-project/docs/technical-documentation/03_BACKEND_ARCHITECTURE.md) — Monolithic layer design, middleware, and error handling.
4. [04_FUNCTIONALITY_BREAKDOWN.md](file:///C:/major-project/docs/technical-documentation/04_FUNCTIONALITY_BREAKDOWN.md) — Comprehensive breakdown of all 11 platform modules.
5. [05_API_REFERENCE.md](file:///C:/major-project/docs/technical-documentation/05_API_REFERENCE.md) — Complete REST contracts for all 42 endpoints.
6. [06_DATABASE_ARCHITECTURE.md](file:///C:/major-project/docs/technical-documentation/06_DATABASE_ARCHITECTURE.md) — PostgreSQL ER diagram, 24 Prisma models, and cascade rules.
7. [07_AI_INTEGRATION.md](file:///C:/major-project/docs/technical-documentation/07_AI_INTEGRATION.md) — Gemini cascade, prompts, rubrics, and timeout safeguards.
8. [08_AUTHENTICATION_AND_SECURITY.md](file:///C:/major-project/docs/technical-documentation/08_AUTHENTICATION_AND_SECURITY.md) — JWT rotation, Bcrypt, RBAC, and rate limiting.
9. [09_EXTERNAL_SERVICES_AND_DEPENDENCIES.md](file:///C:/major-project/docs/technical-documentation/09_EXTERNAL_SERVICES_AND_DEPENDENCIES.md) — Third-party APIs, SDKs, and environment configurations.
10. [10_SYSTEM_ARCHITECTURE_DIAGRAMS.md](file:///C:/major-project/docs/technical-documentation/10_SYSTEM_ARCHITECTURE_DIAGRAMS.md) — Visual Mermaid diagrams for all core pipelines.
11. [11_TESTING_AND_FUNCTIONALITY_AUDIT.md](file:///C:/major-project/docs/technical-documentation/11_TESTING_AND_FUNCTIONALITY_AUDIT.md) — Test verification report and live candidate audit trace.
12. [12_CODE_NAVIGATION_INDEX.md](file:///C:/major-project/docs/technical-documentation/12_CODE_NAVIGATION_INDEX.md) — Quick-reference symbol lookup table and file registry.
13. [13_END_TO_END_WORKFLOWS.md](file:///C:/major-project/docs/technical-documentation/13_END_TO_END_WORKFLOWS.md) — Step-by-step traces for all 7 primary user workflows.

---

*PrepAI — Developed with academic rigor and engineering excellence.*

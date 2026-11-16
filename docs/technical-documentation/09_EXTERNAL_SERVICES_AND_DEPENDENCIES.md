# 09 — External Services, Dependencies & Environment Configuration

## 1. Third-Party Services Architecture

```mermaid
flowchart LR
    subgraph PrepAI ["PrepAI Core Backend"]
        Backend["Express Application"]
    end

    subgraph External ["External Third-Party Ecosystem"]
        Gemini["Google Gemini API\n(Primary AI Evaluation Engine)"]
        OpenAI["OpenAI API\n(Polished Roadmaps & Fallback)"]
        OnlineCompiler["OnlineCompiler.io\n(Sandboxed Code Execution)"]
        Judge0["Judge0 CE\n(Alternative Sandbox Runner)"]
        Cloudinary["Cloudinary CDN\n(Resume Cloud Storage)"]
        Gmail["Gmail SMTP (Port 587)\n(Verification & Recovery Emails)"]
        Postgres[("Managed PostgreSQL\n(Render / Supabase / Local)")]
    end

    Backend -->|Generative AI Prompts| Gemini
    Backend -->|Report Polishing| OpenAI
    Backend -->|Multi-Language Code Runner| OnlineCompiler
    Backend -.->|Fallback Execution| Judge0
    Backend -->|Resume Asset Upload| Cloudinary
    Backend -->|Transactional Emails| Gmail
    Backend -->|Prisma Connection Pool| Postgres
```

---

## 2. Detailed Service Specifications

### 2.1 Google Gemini API
* **Provider:** Google Cloud / Google AI Studio.
* **SDK:** `@google/generative-ai` (v0.24.0).
* **Configured Model:** `gemini-3.5-flash` (with automated fallback to `gemini-3.1-flash-lite`, `gemini-3-flash-preview`, and `gemini-flash-latest`).
* **Role in PrepAI:**
  * Generates interview questions across 3 modes.
  * Evaluates verbal responses across 6 dimensions.
  * Synthesizes targeted Socratic follow-up probes.
  * Parses resume text into structured skills, projects, and work experience.
  * Compiles post-interview Technical Mastery Study Dossiers.
* **Environment Variables:** `GEMINI_API_KEY`, `GEMINI_MODEL`.
* **Failure Handling:** 14-second `withTimeout` race; if a candidate model times out or returns 503/429, cascades to the next candidate model or falls back to deterministic synthesis.

---

### 2.2 OpenAI API
* **Provider:** OpenAI.
* **SDK:** `openai` (v4.87.3).
* **Configured Model:** `gpt-4o-mini`.
* **Role in PrepAI:** Optional secondary provider used exclusively for polishing final interview feedback summaries and generating formatted multi-week preparation roadmaps.
* **Environment Variables:** `OPENAI_API_KEY`, `OPENAI_MODEL`.
* **Failure Handling:** If `OPENAI_API_KEY` is omitted, or if the API returns 429 (quota exhausted) or network error, PrepAI catches the error gracefully and delegates report generation to Gemini without interruption.

---

### 2.3 OnlineCompiler.io & Judge0 CE
* **Provider:** OnlineCompiler.io (RapidAPI / Standalone API) & Judge0 CE.
* **Role in PrepAI:** Executes student-submitted code in an isolated, sandboxed container across C++, Python, Java, JavaScript, and Go.
* **Compilers Configured:**
  * C++: `g++-15` (or Judge0 ID 54)
  * Python: `python-3.14` (or Judge0 ID 71)
  * Java: `openjdk-25` (or Judge0 ID 62)
  * JavaScript: `nodejs-24` (or Judge0 ID 63)
  * Go: `go-1.26` (or Judge0 ID 60)
* **Environment Variables:** `ONLINECOMPILER_API_URL`, `ONLINECOMPILER_API_KEY`, `JUDGE0_API_URL`, `JUDGE0_API_KEY`.
* **Failure Handling:** Normalizes exit codes (e.g. 124 $\rightarrow$ `TIME_LIMIT_EXCEEDED`), checks compilation error patterns, and returns typed verdicts (`ACCEPTED`, `WRONG_ANSWER`, `COMPILATION_ERROR`, `RUNTIME_ERROR`).

---

### 2.4 Cloudinary
* **Provider:** Cloudinary Media Cloud.
* **SDK:** `cloudinary` (v2.5.1).
* **Role in PrepAI:** Cloud-hosted, persistent storage for candidate uploaded resumes (PDF/DOCX), generating secure HTTPS CDN URLs.
* **Environment Variables:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
* **Failure Handling:** If Cloudinary credentials are not configured, resumes are still parsed locally via in-memory buffers so interview features continue working uninhibited.

---

### 2.5 Gmail SMTP
* **Provider:** Google Gmail SMTP.
* **Library:** `nodemailer` (v6.10.0).
* **Connection Details:** `smtp.gmail.com`, Port `587`, `secure: false` (STARTTLS).
* **Role in PrepAI:** Sends transactional verification emails (`/verify-email?token=...`) and password recovery links (`/reset-password?token=...`).
* **Environment Variables:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.
* **Failure Handling:** Normalizes 16-character Google App Passwords by stripping whitespace; logs delivery acceptance without exposing credentials.

---

## 3. Environment Variables Specification

### Backend Variables (`backend/.env`)

```ini
# Server Configuration
NODE_ENV=production                         # development | production | test
PORT=5000                                   # Express port (Render automatically assigns PORT)
CLIENT_URL=https://prepai.onrender.com      # Allowed CORS origins (comma-separated supported)

# Database
DATABASE_URL=postgresql://user:pass@host:5432/prepai_db?schema=public

# Authentication Secrets
JWT_SECRET=replace-with-a-strong-64-char-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-strong-64-char-random-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Primary AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash

# Secondary AI (OpenAI)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Code Execution
ONLINECOMPILER_API_URL=https://api.onlinecompiler.io
ONLINECOMPILER_API_KEY=your-onlinecompiler-api-key

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx          # 16-character Gmail App Password
SMTP_FROM="PrepAI" <no-reply@prepai.local>

# Default Administrator Seed Account
ADMIN_EMAIL=admin@prepai.local
ADMIN_PASSWORD=YourSecureAdminPassword123!
```

### Frontend Variables (`frontend/stitch_ai_technical_interview_platform/.env`)

```ini
VITE_API_URL=https://prepai-backend.onrender.com/api # Backend REST API base URL
```

---

## 4. Package Dependency Inventory

### Backend (`backend/package.json`)
* **Core:** `express`, `cors`, `helmet`, `compression`, `cookie-parser`, `dotenv`, `morgan`
* **Data & ORM:** `@prisma/client`, `prisma`, `pg` (via Prisma engine)
* **AI:** `@google/generative-ai`, `openai`
* **Security:** `bcryptjs`, `jsonwebtoken`, `zod`, `express-rate-limit`
* **File & Documents:** `multer`, `pdfkit`, `pdf-parse`, `mammoth`, `cloudinary`
* **Communications:** `nodemailer`
* **TypeScript & Testing:** `typescript`, `tsx`, `vitest`, `supertest`

### Frontend (`frontend/stitch_ai_technical_interview_platform/package.json`)
* **Core:** `react`, `react-dom`, `react-router-dom`
* **UI & Styling:** `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`, `postcss`, `autoprefixer`
* **Code Editor:** `@monaco-editor/react`
* **Build Tool:** `vite`, `@vitejs/plugin-react`

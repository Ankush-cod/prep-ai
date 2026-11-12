# PrepAI — Frontend Source Export Package

Production-ready frontend application export for **PrepAI**, styled with the **Obsidian Telemetry** design system.

---

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom Obsidian Telemetry palette
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Architecture**: Single Page Application (SPA), zero backend dependencies

---

## 📁 Source Code Organization

```
prepai-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Complete route hierarchy
│   ├── index.css                     # Global Obsidian Telemetry styles & custom scrollbars
│   ├── types/
│   │   └── prepai.ts                 # TypeScript interfaces for Student, Session & Bookmarks
│   ├── data/
│   │   └── mockData.ts               # Parameterized user context (Rahul Sharma / CSE Track)
│   ├── components/
│   │   └── layout/
│   │       ├── UserShell.tsx         # Persistent left sidebar, breadcrumbs & streak header
│   │       └── AdminShell.tsx        # Dedicated operations console & node telemetry
│   └── screens/
│       ├── LandingPageScreen.tsx     # Public landing & hero onboarding
│       ├── ResumeAnalyzerScreen.tsx  # Standard PDF parser, keyword extraction & probes
│       ├── LiveAIInterviewRoomScreen.tsx # Text-based AI proctor & rubric telemetry
│       ├── InterviewHistoryScreen.tsx # Past mock rounds, PDF dossier export & filters
│       ├── AnalyticsDashboardScreen.tsx # 12-week calibration curve & consistency grid
│       ├── BookmarksScreen.tsx       # Segmented problem & resource playlists
│       ├── UserProfileScreen.tsx     # Academic credentials & preparation parameters
│       ├── SettingsScreen.tsx        # Security, session revocation & interview defaults
│       └── AdminOverviewScreen.tsx   # Platform health, moderation queue & student stats
```

---

## 🎨 Obsidian Telemetry Design Tokens

All tokens are defined in `tailwind.config.js`:
- **Surface Lowest (Canvas)**: `#0d0e12`
- **Surface**: `#121317`
- **Surface Container (Cards)**: `#1a1b20`
- **Primary Accent**: `#8b5cf6` (Purple 500)
- **Subtle Borders**: `rgba(255, 255, 255, 0.08)`
- **Typography**: Geist Sans (`font-sans`), Geist Mono (`font-mono`)

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

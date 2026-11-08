# 🛡️ HackMatrix / TRUSTLENS — AI-Powered Digital Trust & Repository Security

<div align="center">

![HackMatrix Banner](https://img.shields.io/badge/HackMatrix-Digital%20Trust%20Platform-527A50?style=for-the-badge&logo=shield&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-A9825B?style=for-the-badge)

<p align="center">
  <strong>Explore the Web. Inspect Your Code. Stay Protected.</strong><br>
  Unified digital security platform combining website threat intelligence with deep, multi-engine GitHub repository security health checks and the Three-State Warrior Reaction system.
</p>

[✨ Overview](#-overview) • [⚔️ Warrior Reaction System](#️-three-state-warrior-reaction-system) • [🔍 GitHub Repo Security](#-github-repository-security-health-check) • [🚀 Key Capabilities](#-key-capabilities) • [🛠️ Tech Stack](#️-technology-stack) • [⚡ Quick Start](#-quick-start) • [🔒 Privacy & Safety](#-privacy--security)

</div>

---

## 🌟 Overview

**HackMatrix** (with **TRUSTLENS**) is an AI-powered cybersecurity intelligence platform designed to make threat investigation transparent, actionable, and visual:

* **GitHub Repository Security Health Check**: Multi-engine code inspection analyzing repositories for hardcoded secrets, dangerous code patterns, and vulnerable open-source dependencies.
* **Three-State Warrior Reaction System**: Expressive voxel guardian reacting to your code's authoritative risk verdict (Healthy, Warnings, or Critical Threat).
* **Website Security Scanner**: Real-time URL validation and threat intelligence exploration.
* **Full-Motion Cinematic Hero**: Ambient video backdrop with translucent overlay and handcrafted interactive cybersecurity canvas.
* **Smart Findings Explorer**: Collapsible "Show More" issue viewer displaying immediate priorities first without overwhelming the screen.

---

## ⚔️ Three-State Warrior Reaction System

The **TRUSTLENS Security Warrior** provides instant visual recognition of your repository's security health:

| Expression | Health Status | Meaning & Visual |
| :--- | :--- | :--- |
| **Happy Warrior** | `GREEN` (Score $\ge 80$) | **All Clear & Healthy**: No critical vulnerabilities or exposed secrets. Cheerful, confident fist pump. |
| **Thinking Warrior** | `YELLOW` (Score $50 - 79$) | **Attention Required / Inconclusive**: Moderate warnings or configuration weaknesses. Thinking posture with STOP hand. |
| **Defensive Warrior** | `RED` (Score $< 50$) | **Critical Threat Detected**: High-severity vulnerabilities, exposed API keys/tokens, or RCE vectors. Equipped with diamond sword & shield. |

> **Privacy Rule**: The character images appear **only after a completed scan** in the results dashboard to reflect actual telemetry, never before a scan is initiated.

---

## 🔍 GitHub Repository Security Health Check

Inspect any public GitHub repository URL or username (`https://github.com/owner/repo` or `owner/repo`):

```
  [GitHub URL / User]
          │
          ▼
  [FastAPI Backend Pipeline]
          ├──> Gitleaks Engine   (API Keys, Cloud Credentials, Tokens with Secret Masking)
          ├──> Semgrep SAST      (DOM XSS, SQLi, Eval/Exec RCE, Insecure Crypto)
          ├──> OSV Vulnerabilities (Google OSV Batch API: Real-time CVE / GHSA Advisories)
          └──> PolyGuard AI      (Heuristic Code Classification)
          │
          ▼
  [Risk Engine & AI Blueprint]  ──> Normalization, 0-100 Scoring & Actionable Developer Steps
          │
          ▼
  [Interactive Report UI]       ──> Warrior Reaction + Severity Counters + Show More Explorer
```

### Security Engine Breakdown:
1. **Gitleaks (Secrets Detection)**: Flags exposed AWS keys, GitHub PATs, Slack webhooks, database connection strings, and private RSA keys. **All detected secrets are automatically masked** (`ghp_****cdef`) and never stored in MongoDB.
2. **Semgrep (SAST)**: Static Application Security Testing scanning for dangerous execution (`eval`, `exec`, `subprocess shell=True`), injection flaws, and unsafe `innerHTML` assignments.
3. **OSV-Scanner (CVE Intelligence)**: Parses dependency manifests (`package.json`, `package-lock.json`, `requirements.txt`, `go.mod`, `cargo.lock`) against the Google Open Source Vulnerability (OSV) database.
4. **AI Explainer**: Generates plain-language executive summaries, vector breakdowns, and prioritized developer remediation checklists.

---

## 🚀 Key Capabilities

| Capability | Description |
| :--- | :--- |
| **🧠 Multi-Engine Code Telemetry** | Correlates static analysis, secret scans, and dependency advisories into a single 0–100 health score. |
| **🛡️ Interactive Findings Explorer** | Filter by Category (`Secrets`, `Code SAST`, `Dependencies`) with collapsible "Show More" expansion. |
| **🔒 Strict Secret Masking** | Guaranteed redaction: sensitive credentials are never printed in plaintext in logs, reports, or the database. |
| **🌐 Responsive Clean Navigation** | Adaptive navbar with frictionless mobile/tablet slide-down drawer and zero button collisions. |
| **⚡ Graceful Disconnect Fallback** | Honest status handling: if an inspection service is offline, it displays an informative offline state with zero fabricated scores. |

---

## 🛠️ Technology Stack

### Frontend:
* **Framework**: [React 19](https://react.dev/)
* **Build Tooling**: [Vite 8](https://vitejs.dev/) with Fast Refresh
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Pixel Art CSS Tokens
* **Typography**: Press Start 2P, Space Grotesk, Inter, JetBrains Mono
* **Linter**: [Oxlint](https://oxc.rs/)

### Backend:
* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with Asyncio
* **Server**: [Uvicorn](https://www.uvicorn.org/)
* **Database**: MongoDB (via [Motor](https://motor.readthedocs.io/)) with automatic in-memory cache fallback
* **HTTP Client**: [HTTPX](https://www.python-httpx.org/) (parallel repository fetching with connection pooling)
* **Vulnerability Feed**: Google OSV API (`api.osv.dev`)

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/soumik7484-art/mcui.git
cd mcui
```

### 2. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start Vite frontend server
npm run dev
```
Frontend runs at: `http://localhost:5173`

### 3. Backend Setup
```bash
# Create and activate Python virtual environment
python -m venv backend/.venv

# Windows:
backend\.venv\Scripts\activate
# macOS/Linux:
source backend/.venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Create environment configuration
cp backend/.env.example backend/.env

# Start FastAPI backend server
uvicorn main:app --app-dir backend --port 8000 --reload
```
Backend API docs (Swagger UI) run at: `http://127.0.0.1:8000/docs`

---

## ⚙️ Environment Variables

Create `backend/.env` (see [`backend/.env.example`](backend/.env.example)):

```env
# Optional: Increases GitHub API rate limits (5,000 req/hr vs 60 unauthenticated)
GITHUB_TOKEN=your_github_personal_access_token

# Optional: MongoDB connection (defaults to in-memory cache if offline)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=hackmatrix_db

# Backend Port
PORT=8000
```

---

## 🔒 Privacy & Security

* **Zero Secret Persistence**: Raw detected credentials are masked in-memory and never written to disk or database.
* **Passive Analysis Only**: Scans only publicly permitted repository files. Never executes untrusted repository code.
* **No Authentication Required**: Runs public repository audits without requiring GitHub OAuth or personal credentials.

---

<div align="center">
  <sub>Built with 💚 for transparent, explainable digital security. © 2026 HackMatrix.</sub>
</div>

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import PORT
from services.github_service import github_service
from services.gitleaks_engine import gitleaks_engine
from services.semgrep_engine import semgrep_engine
from services.osv_engine import osv_engine
from services.polyguard_engine import polyguard_engine
from services.ai_explainer import ai_explainer
from services.risk_engine import risk_engine
from services.mongo_storage import storage

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect MongoDB in background
    await storage.connect()
    yield

app = FastAPI(
    title="Raven / TRUSTLENS Security Engine API",
    description="Backend API for Website Investigation & GitHub Repository Security Health Checks.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ──
class RepoScanRequest(BaseModel):
    repository_url: str = Field(..., description="GitHub repository URL (https://github.com/owner/repo) or owner/repo format")

class WebsiteScanRequest(BaseModel):
    url: str = Field(..., description="Target website URL to investigate")

# ── GitHub Repository Security Endpoints ──

@app.get("/api/v1/github/health", tags=["System Health"])
async def get_github_health():
    """
    Reports availability of GitHub API integration, scanner engines, storage, and models.
    """
    gh_health = await github_service.check_api_health()
    db_health = await storage.health_status()
    
    return {
        "status": "healthy" if gh_health.get("status") in {"available", "degraded"} else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "github_api": gh_health,
            "database": db_health,
            "engines": {
                "gitleaks": gitleaks_engine.get_status(),
                "semgrep": semgrep_engine.get_status(),
                "osv_scanner": osv_engine.get_status(),
                "polyguard": polyguard_engine.get_status()
            }
        }
    }

@app.get("/api/v1/github/repositories/{username}", tags=["GitHub Integration"])
async def get_user_repositories(username: str):
    """
    Retrieves public repositories for a given GitHub username.
    """
    result = await github_service.get_user_repositories(username)
    if not result.get("success", False):
        raise HTTPException(
            status_code=result.get("status", 400),
            detail=result.get("error", "Failed to retrieve user repositories")
        )
    return result

async def run_repo_security_scan(scan_id: str, owner: str, repo: str):
    """
    Executes multi-engine security inspection asynchronously.
    """
    try:
        # Step 1: Update status to fetching
        await storage.save_scan_state(scan_id, {
            "status": "in_progress",
            "progress_message": "Retrieving repository metadata and permitted source files...",
            "step": 1,
            "total_steps": 5
        })

        meta_res = await github_service.get_repository_details(owner, repo)
        if not meta_res.get("success", False):
            await storage.save_scan_state(scan_id, {
                "status": "failed",
                "error": meta_res.get("error", "Repository inspection failed"),
                "step": 1
            })
            return

        metadata = meta_res["metadata"]
        default_branch = metadata["default_branch"]

        # Step 2: Download permitted files
        await storage.save_scan_state(scan_id, {
            "status": "in_progress",
            "progress_message": f"Downloading source trees within safety bounds for {owner}/{repo}...",
            "step": 2,
            "metadata": metadata
        })

        files_res = await github_service.fetch_repository_files(owner, repo, default_branch)
        if not files_res.get("success", False):
            await storage.save_scan_state(scan_id, {
                "status": "failed",
                "error": files_res.get("error", "Failed to retrieve source files"),
                "step": 2
            })
            return

        files = files_res.get("files", [])
        commits = await github_service.get_recent_commits(owner, repo)

        # Step 3: Run security engines
        await storage.save_scan_state(scan_id, {
            "status": "in_progress",
            "progress_message": "Running Gitleaks secret detection, Semgrep SAST, and OSV dependency analysis...",
            "step": 3,
            "files_count": len(files)
        })

        # Run scanners
        completed_checks = ["Gitleaks Secret Detection", "Semgrep SAST", "OSV Dependency Audit"]
        unavailable_checks = []

        # A. Gitleaks
        gitleaks_findings = gitleaks_engine.scan_files(files, commits)

        # B. Semgrep
        semgrep_findings = semgrep_engine.scan_files(files)

        # C. OSV Scanner
        osv_findings = await osv_engine.scan_manifests(files)

        # D. PolyGuard (supplementary experimental signal)
        polyguard_engine.scan_snippets(files)
        unavailable_checks.append("PolyGuard (Experimental deep learning classifier in standby mode)")

        all_raw = gitleaks_findings + semgrep_findings + osv_findings
        normalized_findings = risk_engine.normalize_and_deduplicate(all_raw)

        # Step 4: Risk scoring & AI explanation
        await storage.save_scan_state(scan_id, {
            "status": "in_progress",
            "progress_message": "Generating AI-assisted explanation and remediation blueprint...",
            "step": 4
        })

        stats = {
            "total": len(normalized_findings),
            "critical": sum(1 for f in normalized_findings if f["severity"] == "CRITICAL"),
            "high": sum(1 for f in normalized_findings if f["severity"] == "HIGH"),
            "medium": sum(1 for f in normalized_findings if f["severity"] == "MEDIUM"),
            "low": sum(1 for f in normalized_findings if f["severity"] == "LOW"),
            "informational": sum(1 for f in normalized_findings if f["severity"] == "INFORMATIONAL"),
            "secrets": sum(1 for f in normalized_findings if f["category"] == "Secret Exposure"),
            "sast": sum(1 for f in normalized_findings if f["category"] == "Code Vulnerability"),
            "dependencies": sum(1 for f in normalized_findings if f["category"] == "Vulnerable Dependency")
        }

        score, risk_cat, risk_expl = risk_engine.calculate_health_score(
            normalized_findings,
            len(files),
            completed_checks,
            unavailable_checks
        )

        ai_summary = ai_explainer.generate_explanation(f"{owner}/{repo}", normalized_findings, stats)

        # Final Report Structure (Strictly adheres to Section 11 of requirements)
        final_report = {
            "scan_id": scan_id,
            "status": "completed",
            "repository_overview": {
                "name": metadata["name"],
                "owner": metadata["owner"],
                "full_name": metadata["full_name"],
                "visibility": metadata["visibility"],
                "language": metadata["language"],
                "default_branch": default_branch,
                "stars": metadata["stars"],
                "forks": metadata["forks"],
                "html_url": metadata["html_url"],
                "last_updated": metadata["updated_at"],
                "scan_completed_at": datetime.now(timezone.utc).isoformat()
            },
            "security_health": {
                "overall_score": score,
                "risk_category": risk_cat,
                "checks_completed": completed_checks,
                "checks_unavailable": unavailable_checks,
                "summary_explanation": risk_expl
            },
            "findings_summary": stats,
            "findings": normalized_findings,
            "secret_detection": [f for f in normalized_findings if f["category"] == "Secret Exposure"],
            "code_security": [f for f in normalized_findings if f["category"] == "Code Vulnerability"],
            "dependency_security": [f for f in normalized_findings if f["category"] == "Vulnerable Dependency"],
            "ai_summary": ai_summary,
            "scan_transparency": {
                "tools_used": ["Gitleaks (Secret Engine)", "Semgrep (Static Analysis)", "Google OSV API (Dependency Advisory)"],
                "checks_completed": completed_checks,
                "checks_unavailable": unavailable_checks,
                "repository_scope_examined": f"{len(files)} source/manifest file(s) evaluated within safety bounds",
                "git_history_coverage": f"{len(commits)} recent commit(s) verified for exposed messages",
                "scan_limitations": "Binary files, oversized packages, and deep vendor archives are excluded for security."
            }
        }

        await storage.save_report(scan_id, final_report)
        await storage.save_scan_state(scan_id, {
            "status": "completed",
            "progress_message": "Security health inspection complete.",
            "step": 5,
            "report": final_report
        })

    except Exception as e:
        await storage.save_scan_state(scan_id, {
            "status": "failed",
            "error": f"Internal scan execution error: {str(e)}",
            "step": 5
        })

@app.post("/api/v1/github/scan", tags=["GitHub Scanner"], status_code=status.HTTP_202_ACCEPTED)
async def start_github_scan(req: RepoScanRequest, background_tasks: BackgroundTasks):
    """
    Accepts a repository URL or owner/repository, validates it, and triggers a background security health check.
    """
    parsed = github_service.parse_github_input(req.repository_url)
    if not parsed.get("valid", False):
        raise HTTPException(
            status_code=400,
            detail=parsed.get("error", "Invalid repository input format. Provide a valid GitHub URL or owner/repo.")
        )

    if parsed["type"] == "user":
        raise HTTPException(
            status_code=400,
            detail=f"Target '{parsed['username']}' is a user profile. Please specify a repository or select one from their public repos."
        )

    owner = parsed["owner"]
    repo = parsed["repo"]
    scan_id = f"gh-{uuid.uuid4().hex[:12]}"

    # Initial state
    await storage.save_scan_state(scan_id, {
        "scan_id": scan_id,
        "owner": owner,
        "repo": repo,
        "status": "queued",
        "progress_message": "Scan queued. Initializing security telemetry engines...",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "step": 0
    })

    background_tasks.add_task(run_repo_security_scan, scan_id, owner, repo)

    return {
        "success": True,
        "scan_id": scan_id,
        "status": "queued",
        "owner": owner,
        "repo": repo,
        "message": "Repository security health check started."
    }

@app.get("/api/v1/github/scan/{scan_id}", tags=["GitHub Scanner"])
async def get_github_scan_status(scan_id: str):
    """
    Returns scan progress, current state, or completed findings.
    """
    state = await storage.get_scan_state(scan_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found.")
    return state

@app.get("/api/v1/github/scan/{scan_id}/report", tags=["GitHub Scanner"])
async def get_github_scan_report(scan_id: str):
    """
    Returns the complete structured security health report.
    """
    report = await storage.get_report(scan_id)
    if not report:
        state = await storage.get_scan_state(scan_id)
        if state and state.get("status") == "in_progress":
            raise HTTPException(status_code=202, detail="Scan is still in progress. Please poll again.")
        raise HTTPException(status_code=404, detail=f"Report for scan ID '{scan_id}' not found.")
    return report

# ── Website Scanner Endpoints (Currently Not Connected) ──

@app.post("/api/scan", tags=["Website Scanner"])
async def start_website_scan(req: WebsiteScanRequest):
    """
    Website scanning engine is currently disconnected.
    Returns 503 Service Unavailable to prevent fabricated reports or fake scores.
    """
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Website security scanner backend is currently disconnected. Telemetry pipeline is offline."
    )

@app.get("/api/scan/{scan_id}", tags=["Website Scanner"])
async def get_website_scan(scan_id: str):
    """
    Website scan result endpoint is disconnected.
    """
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Website security scanner backend is currently disconnected."
    )

@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {"status": "ok", "service": "Raven Unified Security Service"}

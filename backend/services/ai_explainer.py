from typing import List, Dict, Any

class AIExplainer:
    """
    Synthesizes and contextualizes verified findings into developer-friendly explanations
    and practical remediation actions. Never fabricates CVEs or fake file lines.
    """
    def generate_explanation(self, repo_name: str, findings: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
        critical_count = stats.get("critical", 0)
        high_count = stats.get("high", 0)
        medium_count = stats.get("medium", 0)
        low_count = stats.get("low", 0)
        total = stats.get("total", 0)

        # 1. Executive Summary
        if critical_count > 0:
            summary = (
                f"Urgent security exposure detected in {repo_name}. "
                f"Found {critical_count} critical and {high_count} high-severity findings that require immediate developer attention, "
                f"primarily involving exposed credentials or direct command/code execution risks."
            )
        elif high_count > 0:
            summary = (
                f"Elevated risk indicators observed in {repo_name}. "
                f"Found {high_count} high-severity findings that may allow cross-site scripting, dangerous string queries, or dependency vulnerabilities."
            )
        elif medium_count > 0:
            summary = (
                f"Moderate security recommendations identified for {repo_name}. "
                f"Found {medium_count} medium-priority items related to weak cryptography configurations or outdated packages."
            )
        elif total == 0:
            summary = (
                f"No immediate critical secrets, injection patterns, or known CVE vulnerabilities were detected across the examined scope of {repo_name}. "
                "Ensure continuous monitoring and periodic dependency audits."
            )
        else:
            summary = f"Review completed for {repo_name}. {total} informational and low-priority items recorded."

        # 2. Key Risk Breakdown
        key_risks = []
        secrets = [f for f in findings if f["category"] == "Secret Exposure"]
        if secrets:
            key_risks.append({
                "category": "Secret Exposure",
                "risk": f"{len(secrets)} hardcoded secret(s) or access token(s) identified in code files.",
                "impact": "Exposed tokens can allow unauthorized automated API actions, database exfiltration, or cloud infrastructure compromise."
            })

        vulns = [f for f in findings if f["category"] == "Code Vulnerability"]
        if vulns:
            key_risks.append({
                "category": "Code Vulnerability",
                "risk": f"{len(vulns)} static application security testing (SAST) rule violation(s).",
                "impact": "Flaws like dynamic evaluation or unescaped HTML can lead to remote code execution or client-side session hijacking."
            })

        deps = [f for f in findings if f["category"] == "Vulnerable Dependency"]
        if deps:
            key_risks.append({
                "category": "Vulnerable Dependency",
                "risk": f"{len(deps)} dependency version(s) matching known CVE/GHSA advisories.",
                "impact": "Known package vulnerabilities can be exploited using publicly available vulnerability POC scripts."
            })

        # 3. Prioritized Next Steps
        next_steps = []
        if secrets:
            next_steps.append("Revoke and rotate all flagged credentials immediately in the respective provider dashboards.")
            next_steps.append("Remove credentials from Git history and move them into a secure Secret Store or environment variables.")
        if deps:
            next_steps.append("Run package manager update commands (`npm audit fix`, `pip install --upgrade`, or update manifest locks) to apply recommended fixed versions.")
        if vulns:
            next_steps.append("Refactor unsafe dynamic functions to use parameterized queries, safe DOM APIs, or input sanitization.")
        if not next_steps:
            next_steps.append("Maintain automated pre-commit hooks to block secrets before they reach the repository.")
            next_steps.append("Integrate automated CI vulnerability scanning into pull request workflows.")

        return {
            "summary": summary,
            "key_risks": key_risks,
            "next_steps": next_steps,
            "confidence_note": "Explanations are strictly derived from verified Gitleaks, Semgrep, and OSV database findings."
        }

ai_explainer = AIExplainer()

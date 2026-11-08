import re
import shutil
import subprocess
import tempfile
import os
from typing import List, Dict, Any

class GitleaksEngine:
    def __init__(self):
        self.cli_available = shutil.which("gitleaks") is not None
        # Standard Gitleaks regex rules
        self.rules = [
            {
                "id": "aws-access-key-id",
                "title": "AWS Access Key ID",
                "pattern": re.compile(r'(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}'),
                "severity": "CRITICAL",
                "description": "AWS access key identifier detected. Can allow unauthorized AWS cloud resource manipulation."
            },
            {
                "id": "github-pat",
                "title": "GitHub Personal Access Token",
                "pattern": re.compile(r'(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,255}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}'),
                "severity": "CRITICAL",
                "description": "Exposed GitHub Personal Access Token granting repository, organization, or workflow access."
            },
            {
                "id": "slack-bot-token",
                "title": "Slack Bot Token",
                "pattern": re.compile(r'xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}'),
                "severity": "HIGH",
                "description": "Slack OAuth bot token that allows automated posting, message reading, or workspace manipulation."
            },
            {
                "id": "google-api-key",
                "title": "Google Cloud / API Key",
                "pattern": re.compile(r'AIza[0-9A-Za-z\-_]{35}'),
                "severity": "HIGH",
                "description": "Google API key granting access to Google Cloud Services, Maps, Firebase, or YouTube APIs."
            },
            {
                "id": "private-key-rsa",
                "title": "Private RSA / SSH Key",
                "pattern": re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
                "severity": "CRITICAL",
                "description": "Unencrypted private cryptographic key block. Threat actors can authenticate as server or identity."
            },
            {
                "id": "generic-api-secret",
                "title": "Hardcoded API Secret / Key",
                "pattern": re.compile(r'(?i)(?:api_key|apikey|secret_key|client_secret|auth_token)\s*[:=]\s*["\']([a-zA-Z0-9_\-\.]{24,120})["\']'),
                "severity": "HIGH",
                "description": "Potentially exposed third-party secret or API key assigned directly in source code."
            },
            {
                "id": "database-connection-url",
                "title": "Database Connection URL with Credentials",
                "pattern": re.compile(r'(?:postgres|postgresql|mysql|mongodb|mongodb\+srv|redis)://[^:\s]+:[^@\s]+@[a-zA-Z0-9_\-\.]+'),
                "severity": "CRITICAL",
                "description": "Database connection string containing embedded plaintext username and password credentials."
            },
            {
                "id": "hardcoded-password",
                "title": "Plaintext Password Assignment",
                "pattern": re.compile(r'(?i)(?:password|passwd|db_password)\s*[:=]\s*["\']([^"\'\s]{8,64})["\']'),
                "severity": "MEDIUM",
                "description": "Hardcoded password variable found in source file."
            }
        ]

    def mask_secret(self, secret: str) -> str:
        """
        Masks the secret so actual credentials are NEVER printed in responses, reports or logs.
        Example: ghp_1234567890abcdef -> ghp_****cdef
        """
        s = secret.strip()
        if len(s) <= 8:
            return "****"
        prefix = s[:4]
        suffix = s[-4:]
        return f"{prefix}****{suffix}"

    def scan_files(self, files: List[Dict[str, Any]], commits: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        findings = []
        finding_count = 0

        # Scan active files
        for f in files:
            path = f.get("path", "")
            content = f.get("content", "")
            if not content:
                continue

            lines = content.split("\n")
            for line_idx, line in enumerate(lines, start=1):
                # Avoid analyzing extremely long compiled bundle lines
                if len(line) > 1500:
                    continue

                for rule in self.rules:
                    match = rule["pattern"].search(line)
                    if match:
                        raw_val = match.group(0)
                        # Filter out common placeholders / templates
                        if any(token in raw_val.lower() for token in {"your-key", "placeholder", "xxx", "00000", "example", "mysecret"}):
                            continue

                        finding_count += 1
                        masked = self.mask_secret(raw_val)

                        findings.append({
                            "finding_id": f"gitleaks-{finding_count}",
                            "source_engine": "Gitleaks",
                            "category": "Secret Exposure",
                            "title": rule["title"],
                            "description": rule["description"],
                            "severity": rule["severity"],
                            "confidence": "CONFIRMED" if rule["severity"] == "CRITICAL" else "HIGH",
                            "file_path": path,
                            "line_number": line_idx,
                            "vulnerability_id": rule["id"],
                            "evidence_summary": f"Detected pattern '{rule['title']}' matching: `{masked}`",
                            "remediation": "Immediately revoke and rotate the exposed credential in the respective service console. Remove the secret from code history and migrate to environment variables or a Secret Manager.",
                            "reference_url": "https://github.com/gitleaks/gitleaks",
                            "detection_status": "CONFIRMED",
                            "is_historical": False
                        })

        # Scan commit messages for accidentally committed tokens
        if commits:
            for c in commits:
                msg = c.get("message", "")
                sha = c.get("sha", "")
                for rule in self.rules:
                    match = rule["pattern"].search(msg)
                    if match:
                        raw_val = match.group(0)
                        finding_count += 1
                        masked = self.mask_secret(raw_val)
                        findings.append({
                            "finding_id": f"gitleaks-hist-{finding_count}",
                            "source_engine": "Gitleaks",
                            "category": "Secret Exposure",
                            "title": f"Historical Commit Secret: {rule['title']}",
                            "description": f"Exposed secret in Git commit message ({sha}).",
                            "severity": rule["severity"],
                            "confidence": "CONFIRMED",
                            "file_path": f"Commit {sha}",
                            "line_number": 1,
                            "vulnerability_id": f"{rule['id']}-commit",
                            "evidence_summary": f"Commit message contained secret: `{masked}`",
                            "remediation": "Rotate this credential immediately. Rewrite Git history using git-filter-repo or BFG Repo-Cleaner if public.",
                            "reference_url": "https://github.com/gitleaks/gitleaks",
                            "detection_status": "CONFIRMED",
                            "is_historical": True
                        })

        return findings

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "Gitleaks",
            "cli_installed": self.cli_available,
            "engine_status": "available",
            "rules_loaded": len(self.rules),
            "description": "Secret detection for API keys, cloud tokens, database URLs, and private keys"
        }

gitleaks_engine = GitleaksEngine()

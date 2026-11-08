import json
import re
import shutil
from typing import List, Dict, Any, Tuple
import httpx

class OSVEngine:
    def __init__(self):
        self.cli_available = shutil.which("osv-scanner") is not None
        self.api_url = "https://api.osv.dev/v1/querybatch"

    def parse_manifest(self, file_path: str, content: str) -> List[Tuple[str, str, str]]:
        """
        Extracts (ecosystem, package_name, version) from manifest content.
        Ecosystems supported: npm, PyPI, Go, crates.io
        """
        dependencies: List[Tuple[str, str, str]] = []
        filename = file_path.split("/")[-1].lower()

        try:
            if filename == "package.json":
                data = json.loads(content)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                for pkg, ver in deps.items():
                    clean_ver = re.sub(r'[\^~>=<]', '', ver).strip()
                    if clean_ver and clean_ver[0].isdigit():
                        dependencies.append(("npm", pkg, clean_ver))

            elif filename == "package-lock.json":
                data = json.loads(content)
                packages = data.get("packages", {})
                for pkg_path, info in packages.items():
                    pkg_name = pkg_path.replace("node_modules/", "").strip()
                    ver = info.get("version", "").strip()
                    if pkg_name and ver and ver[0].isdigit():
                        dependencies.append(("npm", pkg_name, ver))

            elif filename == "requirements.txt":
                for line in content.split("\n"):
                    line = line.strip().split("#")[0].strip()
                    if "==" in line:
                        parts = line.split("==")
                        pkg = parts[0].strip()
                        ver = parts[1].strip()
                        if pkg and ver:
                            dependencies.append(("PyPI", pkg, ver))

            elif filename == "go.mod":
                for line in content.split("\n"):
                    line = line.strip()
                    m = re.match(r'^(?:require\s+)?([a-zA-Z0-9.\-_/]+)\s+v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)', line)
                    if m:
                        dependencies.append(("Go", m.group(1), m.group(2)))

            elif filename == "cargo.lock":
                current_name = None
                for line in content.split("\n"):
                    line = line.strip()
                    if line.startswith('name = '):
                        current_name = line.split('name = ')[1].strip('"\';')
                    elif line.startswith('version = ') and current_name:
                        ver = line.split('version = ')[1].strip('"\';')
                        dependencies.append(("crates.io", current_name, ver))
                        current_name = None

        except Exception:
            pass

        return dependencies

    async def scan_manifests(self, files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        manifest_files = [f for f in files if f.get("is_manifest", False) or any(
            f["path"].lower().endswith(m) for m in ["package.json", "package-lock.json", "requirements.txt", "go.mod", "cargo.lock"]
        )]

        all_deps: List[Tuple[str, str, str, str]] = [] # (ecosystem, name, version, file_path)
        for mf in manifest_files:
            deps = self.parse_manifest(mf["path"], mf.get("content", ""))
            for eco, name, ver in deps[:50]: # Bounded per manifest
                all_deps.append((eco, name, ver, mf["path"]))

        if not all_deps:
            return []

        # Deduplicate
        unique_queries = {}
        for eco, name, ver, path in all_deps:
            key = f"{eco}:{name}:{ver}"
            if key not in unique_queries:
                unique_queries[key] = {
                    "package": {"name": name, "ecosystem": eco},
                    "version": ver,
                    "_file_path": path
                }

        batch_list = list(unique_queries.values())[:80] # Limit batch query to 80 packages
        queries_payload = [{"package": item["package"], "version": item["version"]} for item in batch_list]

        findings = []
        count = 0

        async with httpx.AsyncClient(timeout=14.0) as client:
            try:
                res = await client.post(self.api_url, json={"queries": queries_payload})
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    for idx, result in enumerate(results):
                        vulns = result.get("vulns", [])
                        if not vulns:
                            continue

                        origin = batch_list[idx]
                        pkg_name = origin["package"]["name"]
                        pkg_ver = origin["version"]
                        file_path = origin["_file_path"]

                        for v in vulns:
                            count += 1
                            vuln_id = v.get("id", "UNKNOWN-CVE")
                            summary = v.get("summary") or v.get("details", "")[:180] or "Known vulnerability reported in open source vulnerability database."
                            
                            # Severity mapping from CVSS or database
                            severity = "HIGH"
                            database_specific = v.get("database_specific", {})
                            if "severity" in database_specific:
                                sev_str = str(database_specific["severity"]).upper()
                                if "CRIT" in sev_str:
                                    severity = "CRITICAL"
                                elif "HIGH" in sev_str:
                                    severity = "HIGH"
                                elif "MOD" in sev_str or "MED" in sev_str:
                                    severity = "MEDIUM"
                                elif "LOW" in sev_str:
                                    severity = "LOW"

                            # Extract fixed version if available
                            fixed_version = "Check reference"
                            affected = v.get("affected", [])
                            for aff in affected:
                                for r in aff.get("ranges", []):
                                    for event in r.get("events", []):
                                        if "fixed" in event:
                                            fixed_version = event["fixed"]
                                            break

                            ref_url = f"https://osv.dev/vulnerability/{vuln_id}"
                            references = v.get("references", [])
                            if references and len(references) > 0:
                                ref_url = references[0].get("url", ref_url)

                            findings.append({
                                "finding_id": f"osv-{count}",
                                "source_engine": "OSV-Scanner",
                                "category": "Vulnerable Dependency",
                                "title": f"Vulnerability {vuln_id} in {pkg_name}",
                                "description": summary,
                                "severity": severity,
                                "confidence": "CONFIRMED",
                                "file_path": file_path,
                                "line_number": 1,
                                "vulnerability_id": vuln_id,
                                "evidence_summary": f"Package `{pkg_name}` installed version `{pkg_ver}` is vulnerable. Fixed in `{fixed_version}`.",
                                "remediation": f"Upgrade `{pkg_name}` to version `{fixed_version}` or later.",
                                "reference_url": ref_url,
                                "detection_status": "CONFIRMED",
                                "package_name": pkg_name,
                                "installed_version": pkg_ver,
                                "fixed_version": fixed_version
                            })
            except Exception:
                pass

        return findings

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "OSV-Scanner",
            "cli_installed": self.cli_available,
            "engine_status": "available",
            "database": "Google Open Source Vulnerabilities (OSV) API",
            "description": "Dependency vulnerability scanner querying official OSV CVE/GHSA databases for npm, PyPI, Go, and Cargo"
        }

osv_engine = OSVEngine()

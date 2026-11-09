from typing import List, Dict, Any, Tuple

class RiskEngine:
    def normalize_and_deduplicate(self, raw_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_keys = set()
        normalized = []

        for f in raw_findings:
            file_path = f.get("file_path", "")
            line = f.get("line_number", 1)
            cat = f.get("category", "")
            vuln_id = f.get("vulnerability_id", "")

            # Deduplication key
            dedup_key = f"{file_path}:{line}:{vuln_id or cat}"
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            # Ensure all required normalized fields exist
            normalized.append({
                "finding_id": f.get("finding_id", f"norm-{len(normalized)+1}"),
                "source_engine": f.get("source_engine", "Unknown"),
                "category": cat,
                "title": f.get("title", "Security Finding"),
                "description": f.get("description", ""),
                "severity": f.get("severity", "MEDIUM"),
                "confidence": f.get("confidence", "HIGH"),
                "file_path": file_path,
                "line_number": line,
                "vulnerability_id": vuln_id,
                "evidence_summary": f.get("evidence_summary", ""),
                "remediation": f.get("remediation", "Review and remediate according to security best practices."),
                "reference_url": f.get("reference_url", ""),
                "detection_status": f.get("detection_status", "CONFIRMED"),
                "is_historical": f.get("is_historical", False)
            })

        # Sort: CRITICAL > HIGH > MEDIUM > LOW > INFORMATIONAL
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFORMATIONAL": 4}
        normalized.sort(key=lambda x: severity_order.get(x["severity"], 99))
        return normalized

    def calculate_health_score(
        self,
        findings: List[Dict[str, Any]],
        files_scanned: int,
        completed_checks: List[str],
        unavailable_checks: List[str]
    ) -> Tuple[int, str, str]:
        """
        Calculates risk score (1-100), risk category, and reasoning.
        1/100 is green and okay (clean/healthy).
        Mid range (25-50) is normal / needs attention.
        100/100 is dangerous (critical risk).
        If insufficient checks ran or 0 files scanned, marks as INCONCLUSIVE.
        """
        if files_scanned == 0 or len(completed_checks) == 0:
            return 0, "INCONCLUSIVE", "Insufficient repository source files or engine telemetry to calculate a meaningful score."

        crit_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
        high_count = sum(1 for f in findings if f["severity"] == "HIGH")
        med_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
        low_count = sum(1 for f in findings if f["severity"] == "LOW")

        if crit_count > 0:
            category = "CRITICAL_RISK"
            score = min(100, max(85, 80 + crit_count * 10))
            if crit_count >= 2 or high_count >= 1:
                score = 100
            explanation = f"Critical risk detected: {crit_count} credential or injection vulnerability found. High risk of immediate exploitation."
        elif high_count > 0:
            category = "HIGH_RISK"
            score = min(85, max(60, 50 + high_count * 12))
            explanation = f"High risk detected: {high_count} significant vulnerability indicators found across dependencies or code patterns."
        elif med_count > 0:
            category = "NEEDS_ATTENTION"
            score = min(50, max(25, 20 + med_count * 6))
            explanation = f"Moderate risk: {med_count} security hygiene findings identified that should be remediated in upcoming sprints."
        elif low_count > 0:
            category = "HEALTHY"
            score = min(15, max(2, 1 + low_count * 2))
            explanation = "Low-priority informational findings only. Scope is generally healthy and secure."
        else:
            category = "HEALTHY"
            score = 1
            explanation = "No high or critical security vulnerabilities detected across the analyzed scope and dependency manifests."

        return score, category, explanation

risk_engine = RiskEngine()

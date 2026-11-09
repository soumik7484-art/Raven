import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.gemini_refiner import (
    extract_telemetry_digest,
    synthesize_fallback_refinement,
    GeminiRefinedReport
)
from services.website_scanner import synthesize_scan_report


class TestAIRefinerConsistency(unittest.TestCase):
    def test_case_1_clean_website(self):
        """Case 1: Clean website with all checks passing."""
        scan_data = synthesize_scan_report(
            target_url="https://github.com/",
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 80},
            uh_result={"status": "clean", "matches": []},
            tls_result={"valid": True, "issuer": "DigiCert", "protocol": "TLSv1.3"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED", "dom_inspection_available": True, "inspection_state": "completed", "title": "GitHub"}
        )

        digest = extract_telemetry_digest(scan_data)
        self.assertEqual(digest["final_security_score"], 1)
        self.assertEqual(digest["risk_category"], "LOW")
        self.assertEqual(len(digest["confirmed_incidents"]), 0)
        self.assertEqual(len(digest["suspicious_indicators"]), 0)
        self.assertEqual(digest["investigation_status"], "VERIFIED SAFE")
        self.assertEqual(digest["investigation_coverage"], 100)

        report = synthesize_fallback_refinement(scan_data)
        self.assertEqual(report.confirmed_findings, [])
        self.assertEqual(report.suspicious_indicators, [])
        self.assertIn("1/100", report.executive_summary)
        self.assertIn("LOW RISK", report.executive_summary)
        self.assertNotIn("100/100", report.executive_summary)

    def test_case_2_low_severity_finding(self):
        """Case 2: Domain with low-severity heuristic flag (e.g. .xyz TLD)."""
        scan_data = synthesize_scan_report(
            target_url="https://legitimate-blog.xyz/",
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0},
            uh_result={"status": "clean", "matches": []},
            tls_result={"valid": True, "issuer": "Let's Encrypt"},
            dom_result={"status": "completed", "dom_inspection_available": True, "inspection_state": "completed"}
        )

        digest = extract_telemetry_digest(scan_data)
        self.assertGreaterEqual(len(digest["suspicious_indicators"]), 1)
        self.assertTrue(any(".xyz" in ind for ind in digest["suspicious_indicators"]))
        self.assertEqual(len(digest["confirmed_incidents"]), 0)

        report = synthesize_fallback_refinement(scan_data)
        self.assertGreaterEqual(len(report.suspicious_indicators), 1)

    def test_case_3_medium_phishing_tokens_and_dom_failure(self):
        """
        Case 3: The exact user-reported bug!
        - Medium finding: Deceptive Phishing Keyword Tokens
        - Low finding: High-Risk Top-Level Domain (.xyz)
        - DOM inspection unavailable: Error 16: Device or resource busy
        Must NOT report 0 indicators, 100/100 LOW RISK!
        """
        scan_data = synthesize_scan_report(
            target_url="http://suspicious-verify-login.xyz",
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0},
            uh_result={"status": "clean", "matches": []},
            tls_result={"valid": False, "error": "TLS probe failed"},
            dom_result={
                "status": "inconclusive",
                "content_inspection_state": "INCONCLUSIVE",
                "dom_inspection_available": False,
                "inspection_state": "error",
                "dom_verification": "inconclusive",
                "fetch_error": "[Errno 16] Device or resource busy",
                "message": "DOM inspection error: [Errno 16] Device or resource busy"
            }
        )

        digest = extract_telemetry_digest(scan_data)
        # Verify score is in moderate risk range (25-65), not 100 or 1
        self.assertEqual(digest["final_security_score"], 40)
        self.assertEqual(digest["risk_category"], "MEDIUM")
        self.assertEqual(digest["verdict_status"], "CAUTION ADVISED")
        self.assertEqual(digest["investigation_status"], "INVESTIGATION INCOMPLETE")
        self.assertEqual(digest["investigation_coverage"], 65)

        # Confirmed incidents vs suspicious indicators separation
        self.assertEqual(len(digest["confirmed_incidents"]), 0) # Heuristics are not confirmed malware
        self.assertGreaterEqual(len(digest["suspicious_indicators"]), 2)
        indicator_text = " ".join(digest["suspicious_indicators"])
        self.assertIn(".xyz", indicator_text)
        self.assertTrue("login" in indicator_text or "verify" in indicator_text or "phishing" in indicator_text)

        # Limitation must be recorded
        limitations_text = " ".join(digest["investigation_limitations"])
        self.assertIn("DOM", limitations_text)
        self.assertIn("Device or resource busy", limitations_text)

        # Synthesize fallback report and verify strict consistency
        report = synthesize_fallback_refinement(scan_data)
        self.assertIn("40/100", report.executive_summary)
        self.assertIn("MODERATE RISK", report.executive_summary)
        self.assertNotIn("100/100", report.executive_summary)
        self.assertNotIn("0 suspicious indicator", report.executive_summary)
        self.assertGreaterEqual(len(report.suspicious_indicators), 2)
        self.assertTrue(any("Device or resource busy" in lim for lim in report.investigation_limitations))

    def test_case_4_confirmed_critical_threat(self):
        """Case 4: Confirmed critical threat flagged by Google Safe Browsing / VirusTotal."""
        scan_data = synthesize_scan_report(
            target_url="https://malicious-active-c2.com/login",
            gsb_result={"status": "malicious", "matches": [{"threatType": "MALWARE"}]},
            vt_result={"status": "malicious", "malicious_count": 12, "suspicious_count": 3},
            uh_result={"status": "malicious", "query_status": "ok"},
            tls_result={"valid": True, "issuer": "Trusted CA"},
            dom_result={"status": "completed", "dom_inspection_available": True, "inspection_state": "completed"}
        )

        digest = extract_telemetry_digest(scan_data)
        self.assertEqual(digest["final_security_score"], 100)
        self.assertEqual(digest["risk_category"], "CRITICAL")
        self.assertEqual(digest["verdict_status"], "CONFIRMED THREAT")
        self.assertGreaterEqual(len(digest["confirmed_incidents"]), 1)

        report = synthesize_fallback_refinement(scan_data)
        self.assertIn("CRITICAL RISK", report.executive_summary)
        self.assertIn("100/100", report.executive_summary)
        self.assertGreaterEqual(len(report.confirmed_findings), 1)

    def test_case_5_dom_timeout_incomplete_telemetry(self):
        """Case 5: Otherwise clean site where DOM inspection timed out."""
        scan_data = synthesize_scan_report(
            target_url="https://slow-unresponsive-site.org",
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0},
            uh_result={"status": "clean", "matches": []},
            tls_result={"valid": True, "issuer": "Sectigo"},
            dom_result={
                "status": "inconclusive",
                "content_inspection_state": "INCONCLUSIVE",
                "dom_inspection_available": False,
                "inspection_state": "timeout",
                "fetch_error": "Connection timed out during DOM inspection"
            }
        )

        digest = extract_telemetry_digest(scan_data)
        self.assertEqual(digest["investigation_status"], "INVESTIGATION INCOMPLETE")
        self.assertEqual(digest["investigation_coverage"], 65)
        self.assertTrue(any("timed out" in lim or "unavailable" in lim for lim in digest["investigation_limitations"]))

        report = synthesize_fallback_refinement(scan_data)
        self.assertTrue(any("DOM" in lim for lim in report.investigation_limitations))


if __name__ == "__main__":
    unittest.main()

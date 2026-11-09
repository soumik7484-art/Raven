import json
import unittest
from unittest.mock import patch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.gemini_refiner import (
    GeminiRefinedReport,
    extract_telemetry_digest,
    synthesize_fallback_refinement,
    refine_scan_report
)

def run_coro(coro):
    """Executes a coroutine synchronously without event loop socket initialization."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value

class TestGeminiRefiner(unittest.TestCase):
    def setUp(self):
        self.sample_scan_data = {
            "scan_id": "web-test-1234",
            "url": "https://secure-login-paypa1.com/auth",
            "final_score": 15,
            "risk_level": "CRITICAL",
            "incident_list": [
                {
                    "title": "Confirmed Brand Impersonation: PayPal",
                    "severity": "CRITICAL",
                    "description": "Visual homograph and credential interception detected."
                }
            ],
            "indicators": [
                "Punycode homoglyph detected",
                "Self-signed TLS certificate"
            ],
            "details": {
                "domain_info": {
                    "is_punycode": True,
                    "potential_impersonation": True
                },
                "ssl_info": {
                    "valid": False,
                    "self_signed": True
                },
                "threat_intelligence": {
                    "virustotal": {"available": True, "malicious": True, "verdict": "malicious"},
                    "google_safe_browsing": {"available": False, "verdict": "unknown"}
                }
            },
            "risk_explanation": "Extremely critical threat due to credential phishing and homograph domain spoofing."
        }

    def test_1_digest_extraction(self):
        digest = extract_telemetry_digest(self.sample_scan_data)
        self.assertEqual(digest["scan_id"], "web-test-1234")
        self.assertEqual(digest["final_security_score"], 15)
        self.assertEqual(digest["risk_category"], "CRITICAL")
        self.assertEqual(len(digest["confirmed_incidents"]), 1)
        self.assertIn("virustotal", digest["provider_availability"])

    def test_2_deterministic_fallback_synthesis(self):
        fallback = synthesize_fallback_refinement(self.sample_scan_data)
        self.assertIsInstance(fallback, GeminiRefinedReport)
        self.assertIn("15/100", fallback.executive_summary)
        self.assertIn("CRITICAL", fallback.executive_summary)
        self.assertTrue(len(fallback.confirmed_findings) >= 1)
        self.assertTrue(len(fallback.recommended_actions) >= 1)
        self.assertTrue(len(fallback.potential_impact) >= 1)
        limitations_text = " ".join(fallback.investigation_limitations)
        self.assertIn("google_safe_browsing", limitations_text)

    def test_3_fallback_when_offline(self):
        with patch("services.gemini_refiner.GEMINI_API_KEY", ""):
            result = run_coro(refine_scan_report(self.sample_scan_data))
            self.assertEqual(result["status"], "disabled")
            self.assertIn("refined_report", result)
            validated = GeminiRefinedReport.model_validate(result["refined_report"])
            self.assertIsNotNone(validated.executive_summary)
            self.assertIn("15/100", validated.executive_summary)

if __name__ == "__main__":
    unittest.main()

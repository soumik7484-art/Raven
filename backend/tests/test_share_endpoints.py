import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import sanitize_for_public_sharing, CreateShareRequest, create_share_report, get_share_report, revoke_share_report
from fastapi import HTTPException

def run_coro(coro):
    """Executes a non-blocking coroutine synchronously without event loop sockets."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value

class TestShareEndpoints(unittest.TestCase):

    def setUp(self):
        self.mock_scan_report = {
            "scan_id": "web-test1234",
            "url": "https://suspicious-paypal-verify.xyz/login",
            "domain": "suspicious-paypal-verify.xyz",
            "classification": "suspicious",
            "score": 65,
            "final_risk_report": {
                "overall_risk_score": 65,
                "risk_category": "Moderate Risk",
                "explanation": "Potential brand impersonation detected for PayPal.",
                "recommendation": "Do not enter login credentials on this website."
            },
            "domain_intelligence": {
                "hostname": "suspicious-paypal-verify.xyz",
                "risk_indicators": [
                    "Potential brand impersonation: 'paypal' referenced in non-official domain",
                    "Domain registered under frequently abused TLD (.xyz)"
                ],
                "ssl_report": {
                    "is_valid": True,
                    "protocol": "TLSv1.3",
                    "issuer": "Let's Encrypt",
                    "tls_outcome": "VALID_TLS"
                }
            },
            "website_assessment": {
                "is_accessible": True,
                "content_inspection_state": "COMPLETED",
                "brand_impersonation": {
                    "is_impersonation_detected": True,
                    "target_brand": "paypal",
                    "verification_type": "potential_hostname_similarity"
                }
            },
            "threat_intelligence": {
                "is_threat_confirmed": False,
                "threat_types": [],
                "providers_checked": 3,
                "providers_malicious_count": 0
            },
            "secret_api_key_internal": "SECRET_KEY_NEVER_EXPOSE"
        }

    def test_1_sanitize_for_public_sharing(self):
        """Verify sanitized report preserves security posture and strips sensitive/internal fields."""
        sanitized = sanitize_for_public_sharing(self.mock_scan_report, "RVN-TEST9999")
        self.assertEqual(sanitized["share_id"], "RVN-TEST9999")
        self.assertEqual(sanitized["score"], 65)
        self.assertEqual(sanitized["risk_category"], "Moderate Risk")
        self.assertNotIn("secret_api_key_internal", sanitized)
        self.assertGreater(len(sanitized["findings"]), 0)
        self.assertFalse(sanitized["is_revoked"])

    def test_2_share_workflow_and_revocation(self):
        """Verify create -> retrieve -> revoke -> 410 gone lifecycle."""
        req = CreateShareRequest(report_data=self.mock_scan_report)
        res = run_coro(create_share_report(req))
        self.assertTrue(res["success"])
        share_id = res["share_id"]
        self.assertTrue(share_id.startswith("RVN-"))

        # Retrieve report
        retrieved = run_coro(get_share_report(share_id))
        self.assertEqual(retrieved["share_id"], share_id)
        self.assertEqual(retrieved["score"], 65)

        # Revoke report
        revoke_res = run_coro(revoke_share_report(share_id))
        self.assertTrue(revoke_res["success"])

        # Verify subsequent retrieval raises 410 Gone
        with self.assertRaises(HTTPException) as cm:
            run_coro(get_share_report(share_id))
        self.assertEqual(cm.exception.status_code, 410)

    def test_3_nonexistent_share_id_returns_404(self):
        """Verify nonexistent share ID raises 404 Not Found."""
        with self.assertRaises(HTTPException) as cm:
            run_coro(get_share_report("RVN-NONEXISTENT"))
        self.assertEqual(cm.exception.status_code, 404)

if __name__ == "__main__":
    unittest.main()

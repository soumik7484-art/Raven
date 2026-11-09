"""
test_api_integration.py — Complete Backend API Integration Test Suite

Tests all Raven API endpoints:
- System Health (/api/health)
- GitHub Service Health (/api/v1/github/health)
- Website Scanner with SSRF validation (/api/scan)
- Website Scanner with EICAR test case (/api/scan)
- Public Report Sharing, Retrieval, and Revocation (/api/share, /api/share/{share_id})
- GitHub Repository Scanner Input Validation (/api/v1/github/scan)
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app


class TestRavenApiIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # ── 1. System Health ──
    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("Raven", data["service"])

    # ── 2. GitHub Service Health ──
    def test_02_github_health(self):
        res = self.client.get("/api/v1/github/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("services", data)
        self.assertIn("engines", data["services"])
        engines = data["services"]["engines"]
        self.assertIn("gitleaks", engines)
        self.assertIn("semgrep", engines)
        self.assertIn("osv_scanner", engines)

    # ── 3. SSRF Protection via Website Scan API ──
    def test_03_ssrf_protection_via_api(self):
        # 127.0.0.1 loopback
        res = self.client.post("/api/scan", json={"url": "http://127.0.0.1:8000"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["threat_type"], "SSRF Policy Violation")
        self.assertEqual(data["classification"], "suspicious")
        self.assertEqual(data["detection_status"], "Access Prohibited")

        # Cloud metadata
        res2 = self.client.post("/api/scan", json={"url": "http://169.254.169.254/latest/meta-data/"})
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["threat_type"], "SSRF Policy Violation")

    # ── 4. EICAR Test via Website Scan API ──
    def test_04_eicar_test_via_api(self):
        res = self.client.post("/api/scan", json={"url": "https://www.eicar.org/download-anti-malware-testfile/"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["detection_status"], "Test Artifact Detected")
        self.assertEqual(data["classification"], "safe")
        self.assertLessEqual(data["score"], 19)

    # ── 5. Share Report Lifecycle (Create -> Read -> Revoke) ──
    def test_05_share_report_lifecycle(self):
        # Create share report
        scan_payload = {
            "submitted_url": "https://example.com/",
            "domain": "example.com",
            "score": 1,
            "classification": "safe",
            "detection_status": "Verified Clean",
            "threat_type": "None Detected",
            "explanation": "Target verified clean.",
            "recommended_action": "Safe to browse.",
            "evidence": ["TLS Security: Valid certificate"],
            "domain_intelligence": {
                "hostname": "example.com",
                "ssl_report": {"is_valid": True, "protocol": "TLSv1.3", "issuer": "DigiCert", "tls_outcome": "VALID_TLS"}
            },
            "website_assessment": {
                "content_inspection_state": "COMPLETED",
                "is_accessible": True,
                "dom_verification": "completed"
            }
        }

        res = self.client.post("/api/share", json={"report_data": scan_payload})
        self.assertEqual(res.status_code, 200)
        share_data = res.json()
        self.assertTrue(share_data["success"])
        share_id = share_data["share_id"]
        self.assertTrue(share_id.startswith("RVN-"))

        # Retrieve share report
        get_res = self.client.get(f"/api/share/{share_id}")
        self.assertEqual(get_res.status_code, 200)
        doc = get_res.json()
        self.assertEqual(doc["share_id"], share_id)
        self.assertEqual(doc["domain"], "example.com")
        self.assertFalse(doc["is_revoked"])

        # Revoke share report
        revoke_res = self.client.post(f"/api/share/{share_id}/revoke")
        self.assertEqual(revoke_res.status_code, 200)
        self.assertTrue(revoke_res.json()["success"])

        # Subsequent retrieval must return HTTP 410 GONE
        get_revoked = self.client.get(f"/api/share/{share_id}")
        self.assertEqual(get_revoked.status_code, 410)

    # ── 6. GitHub Scanner Input Validation ──
    def test_06_github_scanner_validation(self):
        # Invalid input format
        bad_res = self.client.post("/api/v1/github/scan", json={"repository_url": "invalid@@not-a-repo"})
        self.assertEqual(bad_res.status_code, 400)

        # Profile URL instead of repo
        profile_res = self.client.post("/api/v1/github/scan", json={"repository_url": "https://github.com/torvalds"})
        self.assertEqual(profile_res.status_code, 400)
        self.assertIn("user profile", profile_res.json()["detail"])


if __name__ == "__main__":
    unittest.main()

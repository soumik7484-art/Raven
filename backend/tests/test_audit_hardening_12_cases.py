"""
test_audit_hardening_12_cases.py — Phase 13 Final Pre-Deployment Regression Test Suite

Verifies all 12 mandatory test cases required for production hackathon deployment:
1. https://www.google.com/ (Clean baseline)
2. https://www.mozilla.org/ (Clean non-profit)
3. https://github.com/login (Legitimate same-origin login page; must NOT be flagged as phishing)
4. https://www.eicar.org/download-anti-malware-testfile/ (Official anti-malware test artifact)
5. https://testsafebrowsing.appspot.com/s/phishing.html (GSB Phishing test page)
6. https://testsafebrowsing.appspot.com/s/malware.html (GSB Malware test page)
7. https://www.internetbadguys.com/ (Cisco test malicious domain)
8. Valid Punycode/homograph test cases (Legitimate IDN vs Deceptive Homograph)
9. Legitimate URL shortener (Shortener handling & safe destination resolution)
10. Unreachable hostname (NXDOMAIN; must NOT be classified as malicious)
11. Malformed URL (Safe parsing & normalization)
12. URL with redirect chain (Safe hop tracking & loop protection)
+ SSRF protection suite (127.0.0.1, 169.254.169.254, 10.0.0.0/8, [::1])
"""

import sys
import os
import unittest
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.website_scanner import (
    normalize_target_url,
    synthesize_scan_report,
    evaluate_lexical_heuristics,
    check_homograph_and_punycode,
    is_eicar_test_case,
    scan_website
)
from services.ssrf_protector import validate_target_hostname
from services.gemini_refiner import extract_telemetry_digest, synthesize_fallback_refinement


def run_coro(coro):
    return asyncio.run(coro)


class TestRavenPreDeploymentAudit12Cases(unittest.TestCase):

    # ── CASE 1: Google (Clean Baseline) ──
    def test_case_01_google_clean_baseline(self):
        url = "https://www.google.com/"
        norm = normalize_target_url(url)
        self.assertEqual(norm["hostname"], "www.google.com")
        self.assertEqual(norm["scheme"], "https")

        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 75, "total_engines": 75},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "Google Trust Services"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED", "has_login_form": False, "brand_mentions": ["google"]}
        )

        self.assertLessEqual(report["score"], 19)
        self.assertEqual(report["classification"], "safe")
        self.assertEqual(report["final_risk_report"]["risk_category"], "Low Risk")
        self.assertEqual(report["detection_status"], "Verified Clean")
        self.assertEqual(report["threat_intelligence"]["providers_malicious_count"], 0)

        # AI briefing verification
        digest = extract_telemetry_digest(report)
        self.assertEqual(digest["risk_category"], "LOW")
        self.assertEqual(digest["verdict_status"], "VERIFIED SAFE")
        ai_rep = synthesize_fallback_refinement(report)
        self.assertIn("LOW RISK", ai_rep.executive_summary)

    # ── CASE 2: Mozilla (Clean Non-Profit) ──
    def test_case_02_mozilla_clean_non_profit(self):
        url = "https://www.mozilla.org/"
        norm = normalize_target_url(url)
        self.assertEqual(norm["hostname"], "www.mozilla.org")

        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 72, "total_engines": 72},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "DigiCert Inc"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED", "has_login_form": False, "brand_mentions": []}
        )

        self.assertLessEqual(report["score"], 19)
        self.assertEqual(report["classification"], "safe")
        self.assertEqual(report["final_risk_report"]["risk_category"], "Low Risk")

    # ── CASE 3: GitHub Login (Legitimate Same-Origin Login) ──
    def test_case_03_github_login_legitimate(self):
        url = "https://github.com/login"
        norm = normalize_target_url(url)
        self.assertEqual(norm["hostname"], "github.com")

        # Crucial test: has_login_form is True, but same-origin (NOT external credential exfiltration)
        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 70, "total_engines": 70},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "DigiCert Inc"},
            dom_result={
                "status": "completed",
                "content_inspection_state": "COMPLETED",
                "has_login_form": True,
                "has_external_credential_action": False,
                "has_insecure_http_action": False,
                "brand_mentions": []
            }
        )

        # Must NOT be classified as phishing or malicious
        self.assertLessEqual(report["score"], 19)
        self.assertEqual(report["classification"], "safe")
        self.assertEqual(report["final_risk_report"]["risk_category"], "Low Risk")
        self.assertFalse(report["website_assessment"]["form_analysis"]["has_external_credential_action"])

    # ── CASE 4: EICAR Anti-Malware Test Artifact ──
    def test_case_04_eicar_test_artifact(self):
        url = "https://www.eicar.org/download-anti-malware-testfile/"
        norm = normalize_target_url(url)
        self.assertTrue(is_eicar_test_case(url, norm["hostname"]))

        # Even if VirusTotal reports detections for the test artifact:
        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "suspicious", "malicious_count": 4, "suspicious_count": 2, "harmless_count": 50, "total_engines": 65},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "Let's Encrypt"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED", "has_login_form": False, "brand_mentions": []}
        )

        # Must recognize EICAR as legitimate test artifact, NOT active attack
        self.assertEqual(report["detection_status"], "Test Artifact Detected")
        self.assertEqual(report["threat_type"], "EICAR Anti-Malware Test Resource")
        self.assertEqual(report["classification"], "safe")
        self.assertLessEqual(report["score"], 19)
        self.assertIn("EICAR", report["explanation"])

        # AI briefing verification
        digest = extract_telemetry_digest(report)
        self.assertEqual(digest["risk_category"], "LOW")
        self.assertIn("EICAR", digest["confirmed_incidents"][0]["title"])

    # ── CASE 5: Google Safe Browsing Phishing Test ──
    def test_case_05_gsb_phishing_test(self):
        url = "https://testsafebrowsing.appspot.com/s/phishing.html"
        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "malicious", "matches": [{"threatType": "SOCIAL_ENGINEERING"}], "message": "Confirmed blacklisted"},
            vt_result={"status": "malicious", "malicious_count": 12, "suspicious_count": 1, "harmless_count": 40, "total_engines": 60},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "Google Trust Services"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED", "has_login_form": True}
        )

        self.assertEqual(report["classification"], "malicious")
        self.assertEqual(report["final_risk_report"]["risk_category"], "Critical Risk")
        self.assertGreaterEqual(report["score"], 80)
        self.assertEqual(report["detection_status"], "Confirmed Threat")

    # ── CASE 6: Google Safe Browsing Malware Test ──
    def test_case_06_gsb_malware_test(self):
        url = "https://testsafebrowsing.appspot.com/s/malware.html"
        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "malicious", "matches": [{"threatType": "MALWARE"}], "message": "Confirmed blacklisted"},
            vt_result={"status": "malicious", "malicious_count": 15, "suspicious_count": 0, "harmless_count": 35, "total_engines": 60},
            uh_result={"status": "malicious", "threat": "malware_download"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "Google Trust Services"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED"}
        )

        self.assertEqual(report["classification"], "malicious")
        self.assertEqual(report["final_risk_report"]["risk_category"], "Critical Risk")
        self.assertEqual(report["score"], 100)

    # ── CASE 7: InternetBadGuys Simulated Malicious Domain ──
    def test_case_07_internetbadguys_test(self):
        url = "https://www.internetbadguys.com/"
        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "suspicious", "malicious_count": 2, "suspicious_count": 3, "harmless_count": 45, "total_engines": 65},
            uh_result={"status": "clean"},
            tls_result={"valid": False, "tls_outcome": "INVALID_CERTIFICATE", "message": "Untrusted test certificate"},
            dom_result={"status": "completed", "content_inspection_state": "COMPLETED"}
        )

        # Suspicious vendor signals
        self.assertEqual(report["classification"], "suspicious")
        self.assertGreaterEqual(report["score"], 40)
        self.assertLessEqual(report["score"], 59)
        self.assertEqual(report["final_risk_report"]["risk_category"], "Suspicious")

    # ── CASE 8: Punycode & Homographs (Legitimate IDN vs Deceptive Spoof) ──
    def test_case_08_punycode_and_homographs(self):
        # A. Legitimate IDN: münchen.de
        munchen = "xn--mnchen-3ya.de"
        h_info = check_homograph_and_punycode(munchen)
        self.assertTrue(h_info["has_punycode"])
        self.assertFalse(h_info["is_deceptive_homograph"], "Legitimate IDN must not be marked deceptive homograph")

        h_rep = evaluate_lexical_heuristics(f"https://{munchen}/", munchen)
        self.assertFalse(h_rep["is_deceptive_homograph"])
        self.assertLess(h_rep["risk_score"], 20, "Legitimate IDN must not receive high heuristic penalty")

        # B. Deceptive Homograph: gооgle.com with Cyrillic 'о'
        cyrillic_google = "g\u043E\u043Egle.com"
        h_info_spoof = check_homograph_and_punycode(cyrillic_google)
        self.assertTrue(h_info_spoof["is_deceptive_homograph"])
        self.assertEqual(h_info_spoof["spoofed_brand"], "google")

        h_rep_spoof = evaluate_lexical_heuristics(f"https://{cyrillic_google}/", cyrillic_google)
        self.assertTrue(h_rep_spoof["is_deceptive_homograph"])
        self.assertGreaterEqual(h_rep_spoof["risk_score"], 45)

    # ── CASE 9: Legitimate URL Shortener ──
    def test_case_09_url_shortener(self):
        short_url = "https://bit.ly/3xyz123"
        norm = normalize_target_url(short_url)
        self.assertTrue(norm["is_shortener"])
        self.assertEqual(norm["hostname"], "bit.ly")

        # Clean destination resolution
        report = synthesize_scan_report(
            target_url=short_url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 70, "total_engines": 70},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "DigiCert"},
            dom_result={
                "status": "completed",
                "content_inspection_state": "COMPLETED",
                "redirect_chain": [{"hop": 1, "status_code": 301, "from_url": short_url, "to_url": "https://wikipedia.org/"}],
                "final_url": "https://wikipedia.org/"
            }
        )

        # Shortener pointing to clean target is NOT automatically malicious
        self.assertEqual(report["classification"], "safe")
        self.assertLessEqual(report["score"], 19)

    # ── CASE 10: Unreachable Hostname (NXDOMAIN) ──
    def test_case_10_unreachable_hostname_nxdomain(self):
        url = "https://nonexistent-random-domain-xyz-12345.test/"
        norm = normalize_target_url(url)

        report = synthesize_scan_report(
            target_url=url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 0, "total_engines": 0},
            uh_result={"status": "clean"},
            tls_result={"valid": False, "tls_outcome": "DNS_FAILED", "message": "getaddrinfo failed"},
            dom_result={
                "status": "inconclusive",
                "content_inspection_state": "INCONCLUSIVE",
                "dom_inspection_available": False,
                "is_dns_failure": True,
                "fetch_error": "DNS resolution failed (host unresolvable / NXDOMAIN)"
            }
        )

        # Crucial: Unreachable domain is NOT malicious!
        self.assertNotEqual(report["classification"], "malicious")
        self.assertEqual(report["detection_status"], "Host Unresolvable")
        self.assertLessEqual(report["score"], 19)
        self.assertEqual(report["final_risk_report"]["risk_category"], "Low Risk")

    # ── CASE 11: Malformed URL Handling ──
    def test_case_11_malformed_url_handling(self):
        malformed_inputs = [
            "google.com",
            "https://google.com:443/",
            "http://google.com/",
            "   https://github.com/login   ",
            "https://192.168.1.1:8080/test?a=1&b=2#frag",
        ]
        for raw in malformed_inputs:
            norm = normalize_target_url(raw)
            self.assertTrue(norm["full_url"].startswith("http"))
            self.assertTrue(len(norm["hostname"]) > 0)

    # ── CASE 12: Redirect Chain Tracking ──
    def test_case_12_redirect_chain_tracking(self):
        initial_url = "http://google.com"
        report = synthesize_scan_report(
            target_url=initial_url,
            gsb_result={"status": "clean", "matches": []},
            vt_result={"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 70, "total_engines": 70},
            uh_result={"status": "clean"},
            tls_result={"valid": True, "protocol": "TLSv1.3", "issuer": "Google Trust Services"},
            dom_result={
                "status": "completed",
                "content_inspection_state": "COMPLETED",
                "redirect_chain": [
                    {"hop": 1, "status_code": 301, "from_url": "http://google.com", "to_url": "https://google.com/"},
                    {"hop": 2, "status_code": 301, "from_url": "https://google.com/", "to_url": "https://www.google.com/"}
                ],
                "final_url": "https://www.google.com/"
            }
        )

        chain = report["website_assessment"]["redirect_chain"]
        self.assertEqual(len(chain), 2)
        self.assertEqual(report["website_assessment"]["final_url"], "https://www.google.com/")
        self.assertIn("Followed 2 redirect hop(s)", " ".join(report["evidence"]))

    # ── SSRF DEFENSE SUITE ──
    def test_ssrf_prohibited_targets(self):
        ssrf_targets = [
            "127.0.0.1",
            "127.0.0.2",
            "localhost",
            "169.254.169.254", # AWS/GCP/Azure metadata
            "10.0.0.1",
            "10.255.255.254",
            "172.16.0.1",
            "192.168.1.1",
            "0.0.0.0",
            "::1",
            "metadata.google.internal",
            "instance-data",
        ]
        for t in ssrf_targets:
            res = validate_target_hostname(t)
            self.assertFalse(res["is_safe"], f"SSRF target {t} should be rejected!")
            self.assertTrue(res["is_ssrf_blocked"], f"SSRF target {t} must trigger is_ssrf_blocked!")


if __name__ == "__main__":
    unittest.main()

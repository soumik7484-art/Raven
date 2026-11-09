import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.website_scanner import (
    is_legitimate_brand_domain,
    evaluate_lexical_heuristics,
    check_homograph_and_punycode,
    synthesize_scan_report,
)

class TestBrandReportingConsistency(unittest.TestCase):

    def test_1_google_looking_subdomain(self):
        """1. Google-looking subdomain must trigger potential brand impersonation, not confirmed spoofing."""
        hostname = "google.com.security-verification.xyz"
        url = f"https://{hostname}/login"

        self.assertFalse(is_legitimate_brand_domain(hostname, "google"))

        heuristics = evaluate_lexical_heuristics(url, hostname)
        flags = heuristics["flags"]

        brand_flag = next((f for f in flags if "Potential brand impersonation" in f and "google" in f), None)
        self.assertIsNotNone(brand_flag, "Should generate potential brand impersonation flag")
        self.assertIn("Potential brand impersonation: 'google'", brand_flag)
        self.assertNotIn("Confirmed", brand_flag)

    def test_2_genuine_google_domain(self):
        """2. Genuine Google domains and subdomains must be recognized as legitimate with 0 impersonation findings."""
        genuine_hosts = [
            "google.com",
            "accounts.google.com",
            "mail.google.com",
            "google.co.uk",
            "google.de",
            "google.co.in"
        ]
        for host in genuine_hosts:
            with self.subTest(host=host):
                self.assertTrue(is_legitimate_brand_domain(host, "google"), f"{host} should be legitimate")
                heuristics = evaluate_lexical_heuristics(f"https://{host}/", host)
                brand_flags = [f for f in heuristics["flags"] if "impersonation" in f.lower()]
                self.assertEqual(len(brand_flags), 0, f"{host} must have 0 brand impersonation flags")

    def test_3_unicode_homograph_domain(self):
        """3. Unicode homograph and punycode domains must be detected and flagged."""
        # 'gооgle.com' with Cyrillic 'о' (U+043E)
        cyrillic_host = "g\u043E\u043Egle.com"
        info = check_homograph_and_punycode(cyrillic_host)
        self.assertTrue(info["has_unicode"] or info["has_punycode"])

        heuristics = evaluate_lexical_heuristics(f"https://{cyrillic_host}/", cyrillic_host)
        flags = heuristics["flags"]
        homograph_flag = next((f for f in flags if "homograph" in f.lower() or "punycode" in f.lower()), None)
        self.assertIsNotNone(homograph_flag, "Should detect homograph or punycode")
        self.assertIn("Punycode (IDN) detected", homograph_flag)

    def test_4_dom_inspection_timeout(self):
        """4. When DOM inspection times out, webpage-level verification is marked inconclusive, never a success."""
        url = "https://google.com.security-verification.xyz/login"
        gsb_result = {"status": "clean", "matches": []}
        vt_result = {"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 70, "total_engines": 70}
        uh_result = {"status": "clean"}
        tls_result = {"valid": True, "protocol": "TLSv1.3", "issuer": "Let's Encrypt"}
        dom_result = {
            "status": "inconclusive",
            "content_inspection_state": "INCONCLUSIVE",
            "dom_inspection_available": False,
            "inspection_state": "timeout",
            "dom_verification": "inconclusive",
            "fetch_error": "Connection timed out during DOM inspection",
            "message": "Webpage DOM content inspection timed out; webpage-level verification is inconclusive."
        }

        report = synthesize_scan_report(
            target_url=url,
            gsb_result=gsb_result,
            vt_result=vt_result,
            uh_result=uh_result,
            tls_result=tls_result,
            dom_result=dom_result
        )

        web_assess = report["website_assessment"]
        self.assertEqual(web_assess["content_inspection_state"], "INCONCLUSIVE")
        self.assertFalse(web_assess["dom_inspection_available"])
        self.assertEqual(web_assess["dom_verification"], "inconclusive")
        self.assertFalse(web_assess["is_accessible"])

        brand_imp = web_assess["brand_impersonation"]
        self.assertTrue(brand_imp["is_impersonation_detected"])
        self.assertEqual(brand_imp["verification_type"], "potential_hostname_similarity")

    def test_5_clean_threat_intelligence_with_suspicious_hostname(self):
        """5. Threat intelligence must remain independent from hostname detection."""
        url = "https://google.com.security-verification.xyz/account"
        gsb_result = {"status": "clean", "matches": []}
        vt_result = {"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 70, "total_engines": 70}
        uh_result = {"status": "clean"}
        tls_result = {"valid": True, "protocol": "TLSv1.3", "issuer": "Let's Encrypt"}
        dom_result = {
            "status": "completed",
            "content_inspection_state": "COMPLETED",
            "dom_inspection_available": True,
            "inspection_state": "completed",
            "dom_verification": "completed",
            "title": "Welcome",
            "has_login_form": False,
            "brand_mentions": []
        }

        report = synthesize_scan_report(
            target_url=url,
            gsb_result=gsb_result,
            vt_result=vt_result,
            uh_result=uh_result,
            tls_result=tls_result,
            dom_result=dom_result
        )

        ti = report["threat_intelligence"]
        self.assertFalse(ti["is_threat_confirmed"], "Threat intelligence must not be marked threat confirmed from hostname alone")
        self.assertEqual(ti["providers_malicious_count"], 0)
        self.assertEqual(len(ti["threat_types"]), 0)

        self.assertTrue(report["website_assessment"]["brand_impersonation"]["is_impersonation_detected"])
        self.assertIn("Potential Brand Impersonation", report["threat_type"])

    def test_6_confirmed_brand_impersonation(self):
        """6. Confirmed brand impersonation via DOM content verification marks as confirmed and sets score 100."""
        url = "https://google.com.security-verification.xyz/login"
        gsb_result = {"status": "clean", "matches": []}
        vt_result = {"status": "clean", "malicious_count": 0, "suspicious_count": 0, "harmless_count": 70, "total_engines": 70}
        uh_result = {"status": "clean"}
        tls_result = {"valid": True, "protocol": "TLSv1.3", "issuer": "Let's Encrypt"}
        dom_result = {
            "status": "completed",
            "content_inspection_state": "COMPLETED",
            "dom_inspection_available": True,
            "inspection_state": "completed",
            "dom_verification": "completed",
            "title": "Google Sign-in - Central Security Check",
            "has_login_form": True,
            "brand_mentions": ["google"]
        }

        report = synthesize_scan_report(
            target_url=url,
            gsb_result=gsb_result,
            vt_result=vt_result,
            uh_result=uh_result,
            tls_result=tls_result,
            dom_result=dom_result
        )

        web_assess = report["website_assessment"]
        brand_imp = web_assess["brand_impersonation"]
        self.assertTrue(brand_imp["is_impersonation_detected"])
        self.assertEqual(brand_imp["verification_type"], "confirmed_webpage_spoof")
        self.assertEqual(brand_imp["dom_verification"], "confirmed")

        self.assertEqual(report["classification"], "malicious")
        self.assertEqual(report["score"], 100)
        self.assertEqual(report["final_risk_report"]["risk_category"], "Critical Risk")

if __name__ == "__main__":
    unittest.main()

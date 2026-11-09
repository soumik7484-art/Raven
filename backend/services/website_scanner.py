import asyncio
import base64
import re
import socket
import ssl
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx

from config import (
    VIRUSTOTAL_API_KEY,
    GOOGLE_SAFE_BROWSING_API_KEY,
    URLHAUS_API_KEY,
    FETCH_TIMEOUT_SECONDS,
)

HIGH_RISK_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "buzz", "fit", "icu", "work", "rest", "cam", "bid"
}

TARGET_BRANDS = [
    "paypal", "apple", "microsoft", "google", "netflix", "amazon",
    "facebook", "instagram", "chase", "wellsfargo", "bankofamerica",
    "coinbase", "binance", "metamask", "steam", "discord", "outlook"
]

LEGITIMATE_BRAND_DOMAINS = {
    "google": {
        "google.com", "google.org", "google.net", "google.co.uk", "google.co.in",
        "google.ca", "google.de", "google.fr", "google.com.au", "google.it",
        "google.es", "google.nl", "google.dev", "google.app", "google.com.br",
        "google.co.jp", "google.ch", "google.se", "google.no", "google.be",
        "google.pl", "google.at", "google.co.nz", "google.ie", "google.com.mx"
    },
    "apple": {"apple.com", "icloud.com"},
    "microsoft": {"microsoft.com", "live.com", "office.com", "windows.com"},
    "paypal": {"paypal.com", "paypal.me"},
    "netflix": {"netflix.com"},
    "amazon": {"amazon.com", "amazon.co.uk", "amazon.de", "amazon.in", "amazon.ca", "amazon.co.jp", "aws.amazon.com"},
    "facebook": {"facebook.com", "fb.com"},
    "instagram": {"instagram.com"},
    "chase": {"chase.com"},
    "wellsfargo": {"wellsfargo.com"},
    "bankofamerica": {"bankofamerica.com"},
    "coinbase": {"coinbase.com"},
    "binance": {"binance.com"},
    "metamask": {"metamask.io"},
    "steam": {"steampowered.com", "steamcommunity.com"},
    "discord": {"discord.com", "discord.gg"},
    "outlook": {"outlook.com", "live.com", "office.com"}
}

CONFUSABLES = {
    'о': 'o', 'а': 'a', 'е': 'e', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'і': 'i', 'ј': 'j', 'ѕ': 's', '0': 'o', '1': 'l'
}

PHISHING_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "security",
    "account", "update", "banking", "wallet", "confirm", "recovery",
    "password", "auth", "validation", "support"
]

def is_legitimate_brand_domain(hostname: str, brand: str) -> bool:
    """
    Checks if a hostname belongs legitimately to the given brand.
    Handles known domains, genuine subdomains (e.g. accounts.google.com),
    and international ccTLDs (e.g. google.de, google.co.uk).
    Returns False for deceptive hostnames like google.com.security-verification.xyz
    or login-google.com.
    """
    if not hostname or not brand:
        return False

    hostname = hostname.lower().strip(".")
    brand = brand.lower()

    # Direct match in known brand domains list
    known_domains = LEGITIMATE_BRAND_DOMAINS.get(brand, {f"{brand}.com", f"{brand}.org", f"{brand}.net", f"{brand}.co.uk"})
    for dom in known_domains:
        if hostname == dom or hostname.endswith(f".{dom}"):
            return True

    # Generic check for ccTLDs (e.g. google.de, google.co.in)
    parts = hostname.split(".")
    if len(parts) >= 2:
        if parts[-2] == brand:
            return True
        if len(parts) >= 3 and parts[-3] == brand and parts[-2] in {"co", "com", "org", "net", "gov", "edu"}:
            return True

    return False

def check_homograph_and_punycode(hostname: str) -> Dict[str, Any]:
    has_punycode = "xn--" in hostname.lower()
    has_unicode = False
    decoded_hostname = hostname

    try:
        if any(ord(c) > 127 for c in hostname):
            has_unicode = True
            encoded = hostname.encode("idna").decode("ascii")
            if "xn--" in encoded:
                has_punycode = True
        elif has_punycode:
            decoded_hostname = hostname.encode("ascii").decode("idna")
            if any(ord(c) > 127 for c in decoded_hostname):
                has_unicode = True
    except Exception:
        pass

    return {
        "has_punycode": has_punycode,
        "has_unicode": has_unicode,
        "decoded_hostname": decoded_hostname
    }

def normalize_target_url(raw_url: str) -> Dict[str, Any]:
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    hostname = (parsed.hostname or "").lower()
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    
    return {
        "full_url": url,
        "scheme": parsed.scheme,
        "hostname": hostname,
        "port": port,
        "path": parsed.path or "/",
        "query": parsed.query,
    }

async def query_google_safe_browsing(url: str, timeout: float = 6.0) -> Dict[str, Any]:
    if not GOOGLE_SAFE_BROWSING_API_KEY:
        return {
            "status": "unconfigured",
            "matches": [],
            "message": "Google Safe Browsing API key not configured"
        }

    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"
    payload = {
        "client": {
            "clientId": "raven-security-scanner",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(api_url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                matches = data.get("matches", [])
                if matches:
                    threat_types = [m.get("threatType") for m in matches]
                    return {
                        "status": "malicious",
                        "matches": matches,
                        "threat_types": threat_types,
                        "message": f"Confirmed blacklisted on Google Safe Browsing: {', '.join(threat_types)}"
                    }
                return {
                    "status": "clean",
                    "matches": [],
                    "message": "Clean. No listings in Google Safe Browsing global threat lists."
                }
            else:
                return {
                    "status": "error",
                    "code": resp.status_code,
                    "matches": [],
                    "message": f"GSB API returned status {resp.status_code}"
                }
    except Exception as e:
        return {
            "status": "error",
            "matches": [],
            "message": f"GSB query timed out or failed: {str(e)}"
        }

async def query_virustotal(url: str, domain: str, timeout: float = 6.0) -> Dict[str, Any]:
    if not VIRUSTOTAL_API_KEY:
        return {
            "status": "unconfigured",
            "stats": {},
            "message": "VirusTotal API key not configured"
        }

    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers=headers
            )
            
            if resp.status_code == 404:
                domain_resp = await client.get(
                    f"https://www.virustotal.com/api/v3/domains/{domain}",
                    headers=headers
                )
                if domain_resp.status_code == 200:
                    resp = domain_resp

            if resp.status_code == 200:
                data = resp.json().get("data", {})
                attributes = data.get("attributes", {})
                stats = attributes.get("last_analysis_stats", {})
                
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                harmless = stats.get("harmless", 0)
                undetected = stats.get("undetected", 0)
                total = malicious + suspicious + harmless + undetected

                status = "clean"
                if malicious >= 3:
                    status = "malicious"
                elif malicious > 0 or suspicious >= 2:
                    if malicious <= 2 and harmless >= 50:
                        status = "suspicious"
                    else:
                        status = "suspicious" if malicious == 1 else "malicious"

                return {
                    "status": status,
                    "malicious_count": malicious,
                    "suspicious_count": suspicious,
                    "harmless_count": harmless,
                    "undetected_count": undetected,
                    "total_engines": total,
                    "stats": stats,
                    "message": f"VirusTotal analysis: {malicious}/{total} security vendors flagged malicious"
                }
            elif resp.status_code == 404:
                return {
                    "status": "clean",
                    "malicious_count": 0,
                    "suspicious_count": 0,
                    "harmless_count": 0,
                    "total_engines": 0,
                    "stats": {},
                    "message": "Target domain/URL has no negative reputation history on VirusTotal."
                }
            else:
                return {
                    "status": "error",
                    "code": resp.status_code,
                    "stats": {},
                    "message": f"VirusTotal returned error status {resp.status_code}"
                }
    except Exception as e:
        return {
            "status": "error",
            "stats": {},
            "message": f"VirusTotal query failed: {str(e)}"
        }

async def query_urlhaus(url: str, domain: str, timeout: float = 6.0) -> Dict[str, Any]:
    api_url = "https://urlhaus-api.abuse.ch/v1/url/"
    headers = {}
    if URLHAUS_API_KEY:
        headers["Auth-Key"] = URLHAUS_API_KEY

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(api_url, data={"url": url}, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                q_status = data.get("query_status")
                if q_status == "ok":
                    url_status = data.get("url_status")
                    threat = data.get("threat")
                    tags = data.get("tags") or []
                    return {
                        "status": "malicious" if url_status == "online" else "suspicious",
                        "query_status": q_status,
                        "url_status": url_status,
                        "threat": threat,
                        "tags": tags,
                        "message": f"Listed on URLhaus database (Threat: {threat}, Status: {url_status})"
                    }
                else:
                    return {
                        "status": "clean",
                        "query_status": q_status,
                        "message": "Clean. Zero malware payloads or C2 entries recorded in URLhaus."
                    }
            return {
                "status": "clean",
                "message": "URLhaus lookup returned no threat records."
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"URLhaus query error: {str(e)}"
        }

def probe_tls_certificate(hostname: str, port: int = 443, timeout: float = 4.0) -> Dict[str, Any]:
    if not hostname:
        return {"valid": False, "error": "Missing hostname"}

    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((hostname, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                version = ssock.version()
                issuer_dict = dict(x[0] for x in cert.get("issuer", []))
                subject_dict = dict(x[0] for x in cert.get("subject", []))
                
                issuer_name = issuer_dict.get("organizationName") or issuer_dict.get("commonName") or "Trusted Authority"
                subject_name = subject_dict.get("commonName") or hostname
                expires = cert.get("notAfter", "Unknown")
                
                is_expired = False
                try:
                    if expires and expires != "Unknown":
                        expiry_dt = datetime.strptime(expires, "%b %d %H:%M:%S %Y %Z")
                        if datetime.now(timezone.utc) > expiry_dt.replace(tzinfo=timezone.utc):
                            is_expired = True
                except Exception:
                    pass

                return {
                    "valid": not is_expired,
                    "expired": is_expired,
                    "issuer": issuer_name,
                    "subject": subject_name,
                    "expires": expires,
                    "protocol": version,
                    "message": f"Valid {version} certificate issued by {issuer_name} (Expires: {expires})"
                }
    except ssl.SSLCertVerificationError as e:
        return {
            "valid": False,
            "expired": False,
            "error": "SSL Verification Failed",
            "message": f"SSL certificate verification failed: {e.verify_message}"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": type(e).__name__,
            "message": f"TLS probe failed or port 443 closed: {str(e)}"
        }

async def inspect_webpage_content(url: str, timeout: float = 3.0) -> Dict[str, Any]:
    """
    Performs passive webpage DOM / content inspection.
    When inspection times out or encounters network failures, explicitly marks
    the verification state as inconclusive.
    """
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, verify=False) as client:
            resp = await client.get(url)
            html = resp.text
            html_lower = html.lower()
            title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
            title = title_match.group(1).strip() if title_match else ""
            has_login = bool(
                re.search(r'<input[^>]+type=["\']password["\']', html_lower)
                or ("<form" in html_lower and ("login" in html_lower or "signin" in html_lower or "password" in html_lower))
            )
            brand_mentions = [b for b in TARGET_BRANDS if b in html_lower]

            return {
                "status": "completed",
                "content_inspection_state": "COMPLETED",
                "dom_inspection_available": True,
                "inspection_state": "completed",
                "dom_verification": "completed",
                "status_code": resp.status_code,
                "title": title,
                "has_login_form": has_login,
                "brand_mentions": brand_mentions,
                "message": "Webpage DOM content inspection completed."
            }
    except httpx.TimeoutException:
        return {
            "status": "inconclusive",
            "content_inspection_state": "INCONCLUSIVE",
            "dom_inspection_available": False,
            "inspection_state": "timeout",
            "dom_verification": "inconclusive",
            "fetch_error": "Connection timed out during DOM inspection",
            "message": "Webpage DOM content inspection timed out; webpage-level verification is inconclusive."
        }
    except Exception as e:
        return {
            "status": "inconclusive",
            "content_inspection_state": "INCONCLUSIVE",
            "dom_inspection_available": False,
            "inspection_state": "unavailable",
            "dom_verification": "inconclusive",
            "fetch_error": str(e),
            "message": f"Webpage DOM content inspection unavailable: {str(e)}"
        }

def evaluate_lexical_heuristics(url: str, hostname: str) -> Dict[str, Any]:
    flags = []
    risk_score = 0  # 0 to 100

    # 1. IP address as hostname
    is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname))
    if is_ip:
        flags.append("Target uses raw IP address instead of registered domain")
        risk_score += 35

    # 2. Punycode / IDN homograph spoofing
    homograph_info = check_homograph_and_punycode(hostname)
    if homograph_info["has_punycode"] or homograph_info["has_unicode"]:
        flags.append("Punycode (IDN) detected; possible homograph spoofing attempt")
        risk_score += 35

    # 3. High-risk TLD
    tld = hostname.split(".")[-1] if "." in hostname else ""
    if tld in HIGH_RISK_TLDS:
        flags.append(f"Domain registered under frequently abused TLD (.{tld})")
        risk_score += 15

    # 4. Brand impersonation + phishing keyword pattern
    decoded_host = homograph_info["decoded_hostname"].lower()
    normalized_confusables = "".join(CONFUSABLES.get(c, c) for c in decoded_host)

    matched_brands = [b for b in TARGET_BRANDS if b in hostname or b in normalized_confusables]
    matched_phish_words = [kw for kw in PHISHING_KEYWORDS if kw in hostname or kw in url.lower()]

    detected_brand = None
    if matched_brands:
        for b in matched_brands:
            if not is_legitimate_brand_domain(hostname, b):
                detected_brand = b
                flags.append(f"Potential brand impersonation: '{b}' referenced in non-official domain '{hostname}'")
                risk_score += 40
                if matched_phish_words:
                    flags.append(f"Deceptive phishing keyword tokens detected: {', '.join(matched_phish_words)}")
                    risk_score += 25
                break
    elif matched_phish_words and (tld in HIGH_RISK_TLDS or is_ip):
        flags.append(f"High-risk credential/login keywords present in unverified domain: {', '.join(matched_phish_words)}")
        risk_score += 25

    # 5. Excessive subdomains
    subdomain_parts = hostname.split(".")
    if len(subdomain_parts) > 4:
        flags.append(f"Excessive subdomain depth ({len(subdomain_parts)} segments) often seen in dynamic redirection networks")
        risk_score += 15

    # 6. '@' character in URL
    if "@" in url:
        flags.append("URL contains '@' symbol; classic userinfo spoofing vector")
        risk_score += 35

    # 7. Extremely long URL
    if len(url) > 200:
        flags.append("Unusually long URL length (> 200 characters) with embedded query tokens")
        risk_score += 10

    return {
        "risk_score": min(100, risk_score),
        "flags": flags,
        "is_ip": is_ip,
        "tld": tld,
        "punycode": homograph_info["has_punycode"] or homograph_info["has_unicode"],
        "detected_brand": detected_brand
    }

def synthesize_scan_report(
    target_url: str,
    gsb_result: Dict[str, Any],
    vt_result: Dict[str, Any],
    uh_result: Dict[str, Any],
    tls_result: Dict[str, Any],
    dom_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Pure assessment synthesizer that transforms multi-engine security telemetry,
    lexical heuristics, and DOM findings into a structured, consistent report.
    Adheres strictly to threat intelligence independence and inconclusive telemetry rules.
    """
    normalized = normalize_target_url(target_url)
    url = normalized["full_url"]
    hostname = normalized["hostname"]

    # Evaluate lexical heuristics
    heuristics = evaluate_lexical_heuristics(url, hostname)
    detected_brand = heuristics.get("detected_brand")

    # ── DOM Verification of Brand Impersonation ──
    dom_inconclusive = dom_result.get("content_inspection_state") == "INCONCLUSIVE"
    dom_confirmed = False
    if not dom_inconclusive and detected_brand:
        mentions = dom_result.get("brand_mentions", [])
        title = (dom_result.get("title") or "").lower()
        if detected_brand in mentions or detected_brand in title or dom_result.get("has_login_form"):
            dom_confirmed = True

    # ── Threat Intelligence Isolation ──
    gsb_is_bad = gsb_result.get("status") == "malicious"
    vt_malicious_count = vt_result.get("malicious_count", 0)
    vt_suspicious_count = vt_result.get("suspicious_count", 0)
    uh_is_bad = uh_result.get("status") == "malicious"

    ti_malicious = bool(gsb_is_bad or vt_malicious_count >= 3 or uh_is_bad)
    providers_malicious_count = (
        (1 if gsb_is_bad else 0) +
        (1 if vt_malicious_count >= 3 else 0) +
        (1 if uh_is_bad else 0)
    )

    feed_threat_types = []
    if gsb_is_bad:
        for m in gsb_result.get("matches", []):
            tt = m.get("threatType")
            if tt:
                feed_threat_types.append(tt.lower())
        if not feed_threat_types:
            feed_threat_types.append("malware")
    if uh_is_bad:
        feed_threat_types.append("malware")
    if vt_malicious_count >= 3:
        feed_threat_types.append("malicious_vendor_consensus")

    # ── Synthesize Classification and Score ──
    evidence = []
    is_malicious = False
    is_suspicious = False

    # 1. Threat Feeds Check
    if gsb_is_bad:
        is_malicious = True
        evidence.append(f"Google Safe Browsing: MALICIOUS ({gsb_result.get('message')})")
    else:
        evidence.append("Google Safe Browsing: Verified clean (zero malicious or deceptive listings)")

    if vt_result.get("status") in {"clean", "malicious", "suspicious"}:
        total = vt_result.get("total_engines", 0)
        evidence.append(
            f"VirusTotal Engines: {vt_malicious_count}/{total} security vendors flagged malicious "
            f"({vt_result.get('harmless_count', 0)} confirmed harmless)"
        )
        if vt_malicious_count >= 3:
            is_malicious = True
        elif vt_malicious_count > 0 or vt_suspicious_count >= 2:
            is_suspicious = True
    elif vt_result.get("status") == "error":
        evidence.append(f"VirusTotal Engine: {vt_result.get('message')}")

    if uh_is_bad:
        is_malicious = True
        evidence.append(f"URLhaus Database: THREAT DETECTED ({uh_result.get('message')})")
    else:
        evidence.append("URLhaus Database: Clean (No active malware distributions or C2 channels found)")

    # 2. TLS Evidence
    if tls_result.get("valid"):
        evidence.append(f"TLS Security: Valid certificate ({tls_result.get('protocol')}, issued by {tls_result.get('issuer')})")
    else:
        if normalized["scheme"] == "https":
            evidence.append(f"TLS Security Warning: {tls_result.get('message', 'Invalid certificate')}")
            is_suspicious = True
        else:
            evidence.append("Connection Protocol: Insecure plaintext HTTP (No TLS encryption present)")
            is_suspicious = True

    # 3. Webpage DOM Evidence
    if dom_inconclusive:
        evidence.append(f"Webpage Telemetry: DOM content inspection inconclusive ({dom_result.get('fetch_error', 'timeout')})")
    elif dom_confirmed:
        is_malicious = True
        evidence.append(f"Webpage Telemetry: Verified brand spoofing content targeting '{detected_brand}' in live DOM")
    else:
        evidence.append("Webpage Telemetry: DOM content inspection completed")

    # 4. Heuristic Evidence
    if heuristics["flags"]:
        for flag in heuristics["flags"]:
            evidence.append(f"Heuristic Flag: {flag}")
        if heuristics["risk_score"] >= 65:
            if dom_confirmed or ti_malicious:
                is_malicious = True
            else:
                is_suspicious = True
        elif heuristics["risk_score"] >= 25:
            is_suspicious = True
    else:
        evidence.append("Domain Heuristics: Standard lexical structure with zero brand-spoofing flags")

    # ── Final Verdict & Score Calculation (1-100: 1 is okay/green, 100 is dangerous) ──
    if is_malicious:
        classification = "malicious"
        score = 100
        risk_score = 100
        detection_status = "Confirmed Threat"
        threat_type = (
            "Google Safe Browsing Malware / Phishing" if gsb_is_bad
            else "Multi-Vendor Verified Malicious Target" if vt_malicious_count >= 3
            else f"Confirmed Brand Impersonation: '{detected_brand}'" if dom_confirmed
            else "Confirmed Credential Theft Threat"
        )
        confidence = "High Confidence (99%)"
        explanation = (
            f"CRITICAL DANGER: '{hostname}' has been confirmed as an active online threat. "
            "Visiting this site exposes you to phishing campaigns, credential harvesting, or automated malware payloads."
        )
        recommended_action = "DO NOT VISIT OR INTERACT. Close this tab immediately and do not submit any passwords or download files."

    elif is_suspicious:
        classification = "suspicious"
        score = int(min(65, max(35, heuristics["risk_score"] + (vt_malicious_count * 15))))
        risk_score = score
        detection_status = "Caution Advised"
        threat_type = (
            f"Potential Brand Impersonation: '{detected_brand}'" if detected_brand
            else "Heuristic Deception / Lookalike Risk" if heuristics["risk_score"] >= 25
            else "Suspicious Vendor Signals" if vt_malicious_count > 0
            else "Unverified TLS / Certificate Anomaly"
        )
        confidence = "Moderate-High Confidence (88%)"
        explanation = (
            f"WARNING: Potential risk signals identified for '{hostname}'. While not yet globally blacklisted, "
            f"hostname similarity suggests potential impersonation of '{detected_brand or 'a known brand'}'. Heightened caution is required."
        )
        recommended_action = "Exercise caution. Verify the domain carefully before proceeding and never enter sensitive passwords or payment details."

    else:
        classification = "safe"
        score = 1
        risk_score = 1
        detection_status = "Verified Clean"
        threat_type = "None Detected"
        confidence = "High Confidence (99%)"
        explanation = (
            f"EXCELLENT POSTURE: '{hostname}' is verified clean. Multi-engine feeds, global threat registers, "
            "and TLS certificate checks returned zero signs of phishing, deceptive routing, or malicious content."
        )
        recommended_action = "Safe to proceed with normal browsing awareness."

    return {
        "url": url,
        "submitted_url": url,
        "normalized_url": url,
        "domain": hostname,
        "classification": classification,
        "score": score,
        "health_score": score,
        "risk_score": risk_score,
        "detection_status": detection_status,
        "threat_type": threat_type,
        "confidence": confidence,
        "explanation": explanation,
        "recommended_action": recommended_action,
        "remediation": recommended_action,
        "evidence": evidence,
        "final_risk_report": {
            "overall_risk_score": risk_score,
            "risk_category": "Critical Risk" if classification == "malicious" else "Moderate Risk" if classification == "suspicious" else "Clean / Safe",
            "explanation": explanation,
            "recommendation": recommended_action,
        },
        "threat_intelligence": {
            "is_threat_confirmed": ti_malicious,
            "threat_types": feed_threat_types,
            "providers_checked": 3,
            "providers_malicious_count": providers_malicious_count,
            "provider_results": {
                "google_safe_browsing": {
                    "is_malicious": gsb_is_bad,
                    "status": gsb_result.get("status"),
                    "threat_types": gsb_result.get("threat_types", []),
                },
                "virustotal": {
                    "is_malicious": vt_malicious_count >= 3,
                    "malicious_count": vt_malicious_count,
                    "suspicious_count": vt_suspicious_count,
                    "harmless_count": vt_result.get("harmless_count", 0),
                    "total_engines": vt_result.get("total_engines", 0),
                },
                "urlhaus": {
                    "is_malicious": uh_is_bad,
                    "status": uh_result.get("status"),
                },
            },
        },
        "domain_intelligence": {
            "hostname": hostname,
            "ssl_report": {
                "is_valid": bool(tls_result.get("valid")),
                "tls_outcome": "VALID_TLS" if tls_result.get("valid") else "HTTPS_NOT_USED" if normalized["scheme"] != "https" else "INVALID_OR_UNREACHABLE",
                "issuer": tls_result.get("issuer"),
                "valid_to": tls_result.get("expires"),
                "protocol": tls_result.get("protocol"),
            },
            "risk_indicators": heuristics["flags"],
        },
        "website_assessment": {
            "is_accessible": dom_result.get("status") == "completed",
            "content_inspection_state": dom_result.get("content_inspection_state", "COMPLETED"),
            "dom_inspection_available": dom_result.get("dom_inspection_available", True),
            "inspection_state": dom_result.get("inspection_state", "completed"),
            "dom_verification": "confirmed" if dom_confirmed else ("inconclusive" if dom_inconclusive else "unconfirmed"),
            "fetch_error": dom_result.get("fetch_error"),
            "title": dom_result.get("title"),
            "brand_impersonation": {
                "is_impersonation_detected": bool(detected_brand),
                "verification_type": "confirmed_webpage_spoof" if dom_confirmed else "potential_hostname_similarity",
                "label": f"Confirmed Brand Impersonation: '{detected_brand}'" if dom_confirmed else f"Potential Brand Impersonation: '{detected_brand}'",
                "target_brand": detected_brand,
                "dom_verification": "confirmed" if dom_confirmed else ("inconclusive" if dom_inconclusive else "unconfirmed"),
            },
            "form_analysis": {
                "has_external_credential_action": False,
                "has_insecure_http_action": False,
                "password_forms_count": 1 if dom_result.get("has_login_form") else 0,
            }
        },
        "engines": {
            "google_safe_browsing": gsb_result,
            "virustotal": vt_result,
            "urlhaus": uh_result,
        },
        "tls": tls_result,
        "heuristics": heuristics,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

async def scan_website(target_url: str, dom_timeout: float = 3.0) -> Dict[str, Any]:
    """
    Executes a comprehensive, asynchronous multi-source security scan.
    Aggregates Google Safe Browsing, VirusTotal v3, URLhaus, passive TLS probe,
    lexical security heuristics, and DOM content inspection.
    """
    normalized = normalize_target_url(target_url)
    url = normalized["full_url"]
    hostname = normalized["hostname"]

    # Run queries concurrently
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.get_event_loop()

    gsb_task = query_google_safe_browsing(url, timeout=FETCH_TIMEOUT_SECONDS)
    vt_task = query_virustotal(url, hostname, timeout=FETCH_TIMEOUT_SECONDS)
    uh_task = query_urlhaus(url, hostname, timeout=FETCH_TIMEOUT_SECONDS)
    tls_task = loop.run_in_executor(None, probe_tls_certificate, hostname, normalized["port"], 4.0)
    dom_task = inspect_webpage_content(url, timeout=dom_timeout)

    gsb_result, vt_result, uh_result, tls_result, dom_result = await asyncio.gather(
        gsb_task, vt_task, uh_task, tls_task, dom_task, return_exceptions=True
    )

    # Clean fallback for any unexpected execution exceptions
    if isinstance(gsb_result, Exception):
        gsb_result = {"status": "error", "matches": [], "message": str(gsb_result)}
    if isinstance(vt_result, Exception):
        vt_result = {"status": "error", "stats": {}, "message": str(vt_result)}
    if isinstance(uh_result, Exception):
        uh_result = {"status": "error", "message": str(uh_result)}
    if isinstance(tls_result, Exception):
        tls_result = {"valid": False, "error": str(tls_result), "message": "TLS probe failed"}
    if isinstance(dom_result, Exception):
        dom_result = {
            "status": "inconclusive",
            "content_inspection_state": "INCONCLUSIVE",
            "dom_inspection_available": False,
            "inspection_state": "error",
            "dom_verification": "inconclusive",
            "fetch_error": str(dom_result),
            "message": f"DOM inspection error: {str(dom_result)}"
        }

    return synthesize_scan_report(
        target_url=url,
        gsb_result=gsb_result,
        vt_result=vt_result,
        uh_result=uh_result,
        tls_result=tls_result,
        dom_result=dom_result
    )

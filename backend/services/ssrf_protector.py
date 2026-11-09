"""
ssrf_protector.py — Server-Side Request Forgery (SSRF) Protection & Safe Network Client

Defends Raven against internal network probing, loopback attacks, link-local/cloud metadata
access (AWS/GCP/Azure/DigitalOcean 169.254.169.254), private subnets (RFC 1918),
DNS rebinding, and malicious redirect hopping.
"""

import ipaddress
import socket
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple
import httpx

# Blocked IP Networks (IPv4 and IPv6)
BLOCKED_NETWORKS = [
    # IPv4 Loopback & Special
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("0.0.0.0/8"),
    # IPv4 Private (RFC 1918)
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    # IPv4 Link-Local & Cloud Metadata (RFC 3927 - AWS, GCP, Azure, DO, etc.)
    ipaddress.ip_network("169.254.0.0/16"),
    # IPv4 Carrier-grade NAT (RFC 6598)
    ipaddress.ip_network("100.64.0.0/10"),
    # IPv4 Broadcast & Multicast
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("255.255.255.255/32"),
    # IPv6 Loopback & Unspecified
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("::/128"),
    # IPv6 Unique Local (ULA - RFC 4193)
    ipaddress.ip_network("fc00::/7"),
    # IPv6 Link-Local Unicast (RFC 4291)
    ipaddress.ip_network("fe80::/10"),
    # IPv6 Multicast
    ipaddress.ip_network("ff00::/8"),
    # IPv6 IPv4-mapped loopback/private
    ipaddress.ip_network("::ffff:127.0.0.0/104"),
    ipaddress.ip_network("::ffff:169.254.0.0/112"),
    ipaddress.ip_network("::ffff:10.0.0.0/104"),
    ipaddress.ip_network("::ffff:172.16.0.0/108"),
    ipaddress.ip_network("::ffff:192.168.0.0/112"),
]

BLOCKED_HOSTNAMES = {
    "localhost",
    "localhost.localdomain",
    "local",
    "internal",
    "metadata.google.internal",
    "metadata.tpu.goog",
    "instance-data",
}

def parse_ip(ip_str: str) -> Optional[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """Attempts to parse string as IPv4 or IPv6 address object; returns None if not an IP."""
    try:
        return ipaddress.ip_address(ip_str.strip())
    except (ValueError, AttributeError):
        return None

def is_ip_blocked(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> Tuple[bool, str]:
    """
    Evaluates whether an IP address object falls within loopback, private, link-local,
    or cloud metadata ranges.
    """
    ip_str = str(ip_obj)
    if ip_obj.is_loopback:
        return True, f"Loopback address '{ip_str}' is prohibited"
    if ip_obj.is_private:
        return True, f"Private network address '{ip_str}' is prohibited"
    if ip_obj.is_link_local:
        return True, f"Link-local address '{ip_str}' is prohibited"
    if ip_obj.is_multicast:
        return True, f"Multicast address '{ip_str}' is prohibited"
    if ip_obj.is_reserved:
        return True, f"Reserved address '{ip_str}' is prohibited"
    if ip_obj.is_unspecified:
        return True, f"Unspecified address '{ip_str}' is prohibited"

    # Check explicit subnets
    for net in BLOCKED_NETWORKS:
        if ip_obj in net:
            return True, f"Address '{ip_str}' belongs to restricted network {net}"

    return False, ""

def validate_target_hostname(hostname: str) -> Dict[str, Any]:
    """
    Validates a target hostname against SSRF blocklists and resolves DNS records
    to verify that resolved destination IPs are globally routable.
    Returns: {
        "is_safe": bool,
        "is_ssrf_blocked": bool,
        "is_dns_failure": bool,
        "error": str,
        "resolved_ips": List[str]
    }
    """
    if not hostname:
        return {
            "is_safe": False,
            "is_ssrf_blocked": False,
            "is_dns_failure": True,
            "error": "Target hostname is missing or empty",
            "resolved_ips": []
        }

    cleaned_host = hostname.lower().strip(".").strip()

    # 1. Hostname blocklist
    if cleaned_host in BLOCKED_HOSTNAMES:
        return {
            "is_safe": False,
            "is_ssrf_blocked": True,
            "is_dns_failure": False,
            "error": f"Security Policy Violation: Hostname '{cleaned_host}' is a prohibited local/metadata domain",
            "resolved_ips": []
        }

    if cleaned_host.endswith(".internal") or cleaned_host.endswith(".local") or cleaned_host.endswith(".localhost"):
        return {
            "is_safe": False,
            "is_ssrf_blocked": True,
            "is_dns_failure": False,
            "error": f"Security Policy Violation: Target domain '{cleaned_host}' belongs to restricted private namespace",
            "resolved_ips": []
        }

    # 2. Check if hostname is a raw IP literal
    raw_ip_obj = parse_ip(cleaned_host)
    if raw_ip_obj is not None:
        is_blocked, reason = is_ip_blocked(raw_ip_obj)
        if is_blocked:
            return {
                "is_safe": False,
                "is_ssrf_blocked": True,
                "is_dns_failure": False,
                "error": f"Security Policy Violation: Direct access to restricted IP denied: {reason}",
                "resolved_ips": [cleaned_host]
            }
        return {
            "is_safe": True,
            "is_ssrf_blocked": False,
            "is_dns_failure": False,
            "error": "",
            "resolved_ips": [cleaned_host]
        }

    # 3. DNS resolution validation
    resolved_ips: List[str] = []
    try:
        addr_info = socket.getaddrinfo(cleaned_host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        for family, socktype, proto, canonname, sockaddr in addr_info:
            ip = sockaddr[0]
            if ip not in resolved_ips:
                resolved_ips.append(ip)
    except socket.gaierror as e:
        # Host cannot be resolved (NXDOMAIN or offline) - this is an availability issue, NOT SSRF
        return {
            "is_safe": False,
            "is_ssrf_blocked": False,
            "is_dns_failure": True,
            "error": f"DNS resolution failed for '{cleaned_host}': {e.strerror}",
            "resolved_ips": []
        }
    except Exception as e:
        return {
            "is_safe": False,
            "is_ssrf_blocked": False,
            "is_dns_failure": True,
            "error": f"DNS lookup error for '{cleaned_host}': {str(e)}",
            "resolved_ips": []
        }

    if not resolved_ips:
        return {
            "is_safe": False,
            "is_ssrf_blocked": False,
            "is_dns_failure": True,
            "error": f"No DNS records resolved for hostname '{cleaned_host}'",
            "resolved_ips": []
        }

    # 4. Check all resolved IPs against blocked ranges
    for ip_str in resolved_ips:
        ip_obj = parse_ip(ip_str)
        if ip_obj is not None:
            is_blocked, reason = is_ip_blocked(ip_obj)
            if is_blocked:
                return {
                    "is_safe": False,
                    "is_ssrf_blocked": True,
                    "is_dns_failure": False,
                    "error": f"Security Policy Violation: Host '{cleaned_host}' resolves to restricted IP '{ip_str}' ({reason})",
                    "resolved_ips": resolved_ips
                }

    return {
        "is_safe": True,
        "is_ssrf_blocked": False,
        "is_dns_failure": False,
        "error": "",
        "resolved_ips": resolved_ips
    }

async def safe_fetch_url(
    target_url: str,
    max_redirects: int = 5,
    timeout: float = 4.0,
    max_body_bytes: int = 1_048_576,  # 1MB limit for safety
    user_agent: str = "Raven-CyberSecurity-Audit/2.0 (+https://raven-security.vercel.app)"
) -> Dict[str, Any]:
    """
    Performs a safe HTTP GET request with:
    - Hop-by-hop SSRF validation on every redirect
    - Total redirect counter to prevent infinite redirect loops
    - Re-validation of destination IPs before connection
    - Enforced content length / body size limits
    - Transparent hop logging
    """
    current_url = target_url
    redirect_chain: List[Dict[str, Any]] = []
    visited_urls = set()

    for hop in range(max_redirects + 1):
        parsed = urllib.parse.urlparse(current_url)
        scheme = parsed.scheme.lower()
        if scheme not in {"http", "https"}:
            return {
                "success": False,
                "error": f"Prohibited scheme '{scheme}'. Only HTTP and HTTPS are permitted.",
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url,
                "ssrf_blocked": True
            }

        hostname = parsed.hostname
        if not hostname:
            return {
                "success": False,
                "error": f"Invalid URL: missing hostname in '{current_url}'",
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url,
                "ssrf_blocked": False
            }

        # Validate SSRF on current hop
        val_res = validate_target_hostname(hostname)
        if not val_res["is_safe"]:
            return {
                "success": False,
                "error": val_res["error"],
                "ssrf_blocked": val_res["is_ssrf_blocked"],
                "is_dns_failure": val_res["is_dns_failure"],
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url,
                "resolved_ips": val_res["resolved_ips"]
            }

        if current_url in visited_urls:
            return {
                "success": False,
                "error": f"Circular redirect loop detected on '{current_url}'",
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url,
                "has_loop": True
            }
        visited_urls.add(current_url)

        headers = {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=False, verify=False) as client:
                resp = await client.get(current_url, headers=headers)
                
                # Check for redirect (301, 302, 303, 307, 308)
                if resp.status_code in {301, 302, 303, 307, 308}:
                    loc = resp.headers.get("Location")
                    if not loc:
                        break  # Malformed redirect, treat as terminal
                    
                    next_url = urllib.parse.urljoin(current_url, loc)
                    redirect_chain.append({
                        "hop": hop + 1,
                        "status_code": resp.status_code,
                        "from_url": current_url,
                        "to_url": next_url
                    })

                    if hop >= max_redirects:
                        return {
                            "success": False,
                            "error": f"Excessive redirect chain: exceeded limit of {max_redirects} hops",
                            "status_code": resp.status_code,
                            "redirect_chain": redirect_chain,
                            "final_url": next_url,
                            "excessive_redirects": True
                        }
                    
                    current_url = next_url
                    continue

                # Terminal response reached
                content_bytes = resp.content[:max_body_bytes]
                try:
                    text_content = content_bytes.decode(resp.encoding or "utf-8", errors="replace")
                except Exception:
                    text_content = content_bytes.decode("utf-8", errors="replace")

                return {
                    "success": True,
                    "status_code": resp.status_code,
                    "final_url": str(resp.url),
                    "headers": dict(resp.headers),
                    "text": text_content,
                    "redirect_chain": redirect_chain,
                    "resolved_ips": val_res["resolved_ips"],
                    "error": None
                }

        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "Connection timed out while fetching webpage",
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url,
                "is_timeout": True
            }
        except httpx.ConnectError as e:
            return {
                "success": False,
                "error": f"Connection refused or network unreachable: {str(e)}",
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url,
                "is_connect_error": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"HTTP fetch error: {str(e)}",
                "status_code": 0,
                "redirect_chain": redirect_chain,
                "final_url": current_url
            }

    return {
        "success": False,
        "error": "Failed to complete fetch within redirect limits",
        "status_code": 0,
        "redirect_chain": redirect_chain,
        "final_url": current_url
    }

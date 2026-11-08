/**
 * incidentNormalizer.js
 *
 * Normalizes multi-layer cybersecurity evidence from TrustLens backend FullScanReport
 * into deduplicated, structured security incidents with clear severity, status,
 * explanations, and detection sources.
 *
 * Adheres strictly to classification rules:
 * - Ordinary external non-credential forms are informational observations, NOT security incidents.
 * - HTTP transport is categorized as unencrypted HTTP, NEVER as an expired or invalid certificate.
 * - TLS timeouts/unreachability are categorized as UNKNOWN/unavailable, NEVER as certificate failures.
 * - Uninspected executable/archive links are observations, NOT independent high/critical malware incidents.
 * - Deduplicates multi-scanner reports while preserving all attributing sources.
 * - Accurately reflects failed and unavailable telemetry (DNS, TLS, Content inspection).
 */

export function extractIncidents(data) {
  if (!data || typeof data !== 'object') {
    return {
      summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
      incidents: [],
      observations: [],
      isIncomplete: false,
      missingChecks: [],
      investigationStatus: 'UNVERIFIED',
      investigationCoverage: 0,
    }
  }

  const rawIncidents = []
  const observations = []
  const missingChecks = []

  const submittedUrl = data.submitted_url || data.normalized_url || ''
  const domainIntel = data.domain_intelligence || {}
  const threatIntel = data.threat_intelligence || {}
  const webAssess = data.website_assessment || {}
  const finalRisk = data.final_risk_report || {}
  const hostname = domainIntel.hostname || ''

  // ── 1. Check for Incomplete / Degraded Intelligence Feeds ──
  // DNS Check
  const dnsReport = domainIntel.dns_report || {}
  const dnsStatus = String(dnsReport.status || '').toLowerCase()
  const valInfo = data.validation || {}
  const isResolvable = valInfo.is_resolvable
  const dnsError = dnsReport.error_message || valInfo.dns_error || ''

  if (dnsStatus === 'nxdomain' || dnsError.toLowerCase().includes('nxdomain')) {
    missingChecks.push('DNS resolution failed (host unresolvable / NXDOMAIN)')
    rawIncidents.push({
      id: 'dns-nxdomain',
      title: 'DNS Resolution Failed (Domain Non-Existent)',
      severity: 'MEDIUM',
      status: 'UNVERIFIED',
      description: 'The target hostname could not be resolved to any active IP address (NXDOMAIN). The domain does not exist or has no active DNS zone.',
      sources: ['DNS Intelligence Engine'],
      affected_asset: hostname || submittedUrl,
    })
  } else if (dnsStatus === 'timeout' || dnsError.toLowerCase().includes('timeout')) {
    missingChecks.push('DNS resolution unavailable (query timed out)')
  } else if (dnsStatus === 'error' || isResolvable === false) {
    missingChecks.push(`DNS resolution failed (${dnsError || 'unresolvable'})`)
  }

  // Threat Intel Check
  if (threatIntel.providers_checked === 0) {
    missingChecks.push('Threat intelligence feeds (unconfigured or offline)')
  }

  // DOM Content Check
  const contentState = webAssess.content_inspection_state
  const isDomUnavailable = Boolean(
    webAssess.dom_inspection_available === false ||
    webAssess.is_accessible === false ||
    contentState === 'INSPECTION_UNAVAILABLE' ||
    contentState === 'INSPECTION_ERROR' ||
    ['blocked', 'timeout', 'unavailable', 'partial', 'error'].includes(webAssess.inspection_state)
  )

  if (isDomUnavailable) {
    const errDetail = webAssess.fetch_error || (webAssess.status_code ? `HTTP ${webAssess.status_code}` : webAssess.inspection_state || 'connection unavailable or timed out')
    missingChecks.push(`Webpage DOM content inspection (${errDetail})`)
  }

  // Include any backend failed check messages
  const backendFailed = Array.isArray(finalRisk.failed_checks) ? finalRisk.failed_checks : []
  backendFailed.forEach((fc) => {
    if (fc && fc.description && !missingChecks.includes(fc.description)) {
      missingChecks.push(fc.description)
    }
  })

  // ── 2. Threat Intelligence Incidents ──
  const isThreatConfirmed = Boolean(threatIntel.is_threat_confirmed)
  const providerResults = threatIntel.provider_results || {}
  const maliciousProviders = []

  Object.entries(providerResults).forEach(([key, res]) => {
    if (!res) return
    const isMal = res.is_malicious || String(res.status || '').toLowerCase() === 'malicious'
    if (isMal) {
      const name =
        key === 'google_safe_browsing'
          ? 'Google Safe Browsing'
          : key === 'virustotal'
          ? 'VirusTotal'
          : key === 'urlhaus'
          ? 'URLhaus'
          : key === 'openphish'
          ? 'OpenPhish'
          : key.toUpperCase()
      maliciousProviders.push(name)
    }
  })

  const threatTypes = Array.isArray(threatIntel.threat_types) ? threatIntel.threat_types : []
  const isPhishing = threatTypes.includes('phishing')
  const isMalware = threatTypes.includes('malware')

  if (isThreatConfirmed || maliciousProviders.length > 0) {
    let title = 'Confirmed Malicious Blacklist Flag'
    if (isPhishing && isMalware) {
      title = 'Confirmed Phishing & Malware Campaign'
    } else if (isPhishing) {
      title = 'Confirmed Phishing & Credential Theft Campaign'
    } else if (isMalware) {
      title = 'Confirmed Malware Distribution Host'
    }

    const sources = maliciousProviders.length > 0 ? maliciousProviders : ['Authoritative Threat Feeds']
    rawIncidents.push({
      id: 'ti-malicious-confirmed',
      title,
      severity: 'CRITICAL',
      status: 'CONFIRMED',
      description: `Flagged as an active online security threat across ${sources.length} authoritative intelligence source${sources.length > 1 ? 's' : ''}: ${sources.join(', ')}.`,
      sources,
      affected_asset: submittedUrl,
    })
  } else if (threatIntel.is_threat_suspicious || threatIntel.is_suspicious || threatIntel.threat_tier === 'credible_suspicious') {
    const sources = Array.isArray(threatIntel.suspicious_sources) && threatIntel.suspicious_sources.length > 0
      ? threatIntel.suspicious_sources
      : ['VirusTotal Engine']
    rawIncidents.push({
      id: 'ti-suspicious-anomaly',
      title: 'Suspicious Threat Intelligence Flag',
      severity: 'MEDIUM',
      status: 'SUSPICIOUS',
      description: `Unconfirmed heuristic anomaly detected in threat intelligence telemetry: ${sources.join(', ')}.`,
      sources,
      affected_asset: submittedUrl,
    })
  }

  // ── 3. Webpage Assessment Incidents & Form Classification ──
  if (!isDomUnavailable) {
    const brandInfo = webAssess.brand_impersonation || {}
    if (brandInfo.is_impersonation_detected) {
      const brand = brandInfo.impersonated_brand || brandInfo.target_brand || 'Known Brand'
      rawIncidents.push({
        id: 'brand-impersonation',
        title: `Brand Impersonation / Spoofing: ${brand}`,
        severity: 'CRITICAL',
        status: 'CONFIRMED',
        description: `The webpage mimics the branding, logos, and structure of ${brand} without domain authority.`,
        sources: ['Brand Security Analyzer'],
        affected_asset: hostname || submittedUrl,
      })
    }

    const formAnalysis = webAssess.form_analysis || {}
    if (formAnalysis.has_external_credential_action) {
      // External form WITH password or sensitive credential entry
      rawIncidents.push({
        id: 'form-external-credential',
        title: 'External Credential Exfiltration Action',
        severity: 'CRITICAL',
        status: 'CONFIRMED',
        description: 'HTML form transmits sensitive credentials or passwords directly to an unauthorized external domain.',
        sources: ['Form Security Analyzer'],
        affected_asset: submittedUrl,
      })
    } else if (formAnalysis.has_insecure_http_action) {
      // Form transmits credentials over unencrypted HTTP
      rawIncidents.push({
        id: 'form-insecure-http',
        title: 'Cleartext Credential Transmission over HTTP',
        severity: 'HIGH',
        status: 'CONFIRMED',
        description: 'Authentication form submits password or credential fields over unencrypted HTTP, vulnerable to interception.',
        sources: ['Form Security Analyzer'],
        affected_asset: submittedUrl,
      })
    } else if (formAnalysis.has_external_form_action) {
      // Ordinary non-credential external submission (e.g. newsletter, search)
      observations.push({
        id: 'obs-form-external-handler',
        title: 'Cross-Domain Form Endpoint (Non-Credential)',
        description: 'Webpage contains form action submitting non-credential data (e.g. newsletter or search) to an external service over secure HTTPS.',
        asset: submittedUrl,
      })
    }

    if (webAssess.suspicious_redirect) {
      rawIncidents.push({
        id: 'suspicious-redirect',
        title: 'Anomalous Redirection Pathway',
        severity: 'MEDIUM',
        status: 'SUSPICIOUS',
        description: 'The URL redirects through intermediary hops or protocol shifts before reaching destination.',
        sources: ['DOM Behavior Analyzer'],
        affected_asset: submittedUrl,
      })
    }
  }

  // ── 4. Executable Link Classification ──
  const execLinks = Array.isArray(webAssess.executable_links) ? webAssess.executable_links : []
  if (execLinks.length > 0) {
    if (isMalware) {
      observations.push({
        id: 'obs-malware-payload-link',
        title: 'Associated Downloadable Payload Link',
        description: `Discovered download link associated with confirmed malware distribution host: ${execLinks[0]}`,
        asset: execLinks[0],
      })
    } else {
      observations.push({
        id: 'obs-download-link-uninspected',
        title: 'Downloadable File Link Discovered (Uninspected)',
        description: `Webpage contains links to downloadable files (${execLinks[0]}). The payload has not been analyzed for malware.`,
        asset: execLinks[0],
      })
    }
  }

  // ── 5. Domain & TLS Intelligence Incidents ──
  const ssl = domainIntel.ssl_report || {}
  const rawStatus = String(ssl.status || '').toLowerCase()
  const isHttpUrl = submittedUrl.toLowerCase().startsWith('http://')

  let tlsOutcome = ssl.tls_outcome
  if (!tlsOutcome) {
    if (isHttpUrl && (rawStatus === 'not_applicable' || !ssl.is_valid)) {
      tlsOutcome = 'HTTPS_NOT_USED'
    } else if (rawStatus === 'connection_failed') {
      tlsOutcome = 'TLS_UNAVAILABLE_OR_TIMEOUT'
    } else if (['invalid', 'expired'].includes(rawStatus) || ssl.is_expired || ssl.is_self_signed) {
      tlsOutcome = 'INVALID_CERTIFICATE'
    } else if (ssl.is_valid || rawStatus === 'valid' || rawStatus === 'success') {
      tlsOutcome = 'VALID_CERTIFICATE'
    } else {
      tlsOutcome = 'TLS_UNAVAILABLE_OR_TIMEOUT'
    }
  }

  if (tlsOutcome === 'INVALID_CERTIFICATE') {
    const errorMsg = ssl.error_message || ssl.error || (ssl.is_expired ? 'certificate expired' : ssl.is_self_signed ? 'untrusted self-signed certificate authority' : 'hostname mismatch in certificate SAN/CN')
    rawIncidents.push({
      id: 'ssl-invalid',
      title: 'Untrusted or Expired TLS/SSL Certificate',
      severity: 'HIGH',
      status: 'CONFIRMED',
      description: `TLS security certificate validation explicitly failed: ${errorMsg}.`,
      sources: ['TLS Security Inspector'],
      affected_asset: hostname || submittedUrl,
    })
  } else if (tlsOutcome === 'HTTPS_NOT_USED' || (isHttpUrl && tlsOutcome !== 'VALID_CERTIFICATE')) {
    rawIncidents.push({
      id: 'transport-unencrypted-http',
      title: 'Missing HTTPS Encryption (HTTP Transport)',
      severity: 'LOW',
      status: 'CONFIRMED',
      description: 'The website connection uses unencrypted HTTP transport without TLS, leaving communication vulnerable to passive local interception.',
      sources: ['Transport Security Inspector'],
      affected_asset: submittedUrl,
    })
  } else if (tlsOutcome === 'VALID_CERTIFICATE') {
    if (typeof ssl.days_until_expiration === 'number' && ssl.days_until_expiration < 14) {
      rawIncidents.push({
        id: 'ssl-expiring-soon',
        title: 'TLS Certificate Expiring Soon',
        severity: 'LOW',
        status: 'SUSPICIOUS',
        description: `The SSL encryption certificate will expire in ${ssl.days_until_expiration} days.`,
        sources: ['TLS Security Inspector'],
        affected_asset: hostname || submittedUrl,
      })
    }
  } else if (tlsOutcome === 'TLS_UNAVAILABLE_OR_TIMEOUT') {
    missingChecks.push('TLS certificate verification (connection unavailable or timed out)')
  } else if (tlsOutcome === 'TLS_INSPECTION_ERROR') {
    missingChecks.push('TLS inspection (internal check error)')
  }

  const rdap = domainIntel.rdap_report || {}
  if (typeof rdap.domain_age_days === 'number' && rdap.domain_age_days < 30) {
    rawIncidents.push({
      id: 'domain-newly-registered',
      title: 'Newly Registered Disposable Infrastructure',
      severity: 'MEDIUM',
      status: 'SUSPICIOUS',
      description: `Domain was created only ${rdap.domain_age_days} days ago. Newly registered domains carry elevated statistical threat risk.`,
      sources: ['RDAP Registry Inspector'],
      affected_asset: hostname || submittedUrl,
    })
  }

  const domainRisks = Array.isArray(domainIntel.risk_indicators) ? domainIntel.risk_indicators : []
  const deceptiveIndicator = domainRisks.find((r) => /deceptive|typosquatting|spoofing|userinfo/i.test(r))
  if (deceptiveIndicator) {
    const isBrandSpoof = /deceptive hostname|spoofing|impersonat/i.test(deceptiveIndicator) || domainIntel.risk_level === 'critical'
    rawIncidents.push({
      id: 'domain-deceptive-syntax',
      title: isBrandSpoof ? 'Deceptive Brand Spoofing Hostname' : 'Deceptive URL / Typosquatting Syntax',
      severity: isBrandSpoof ? 'CRITICAL' : 'HIGH',
      status: 'CONFIRMED',
      description: deceptiveIndicator,
      sources: ['Domain Intelligence Engine'],
      affected_asset: hostname || submittedUrl,
    })
  }

  // ── 6. Deduplication & Consolidation ──
  const deduplicatedMap = new Map()

  rawIncidents.forEach((inc) => {
    if (deduplicatedMap.has(inc.id)) {
      const existing = deduplicatedMap.get(inc.id)
      const mergedSources = Array.from(new Set([...existing.sources, ...inc.sources]))
      deduplicatedMap.set(inc.id, {
        ...existing,
        sources: mergedSources,
      })
    } else {
      deduplicatedMap.set(inc.id, inc)
    }
  })

  const incidents = Array.from(deduplicatedMap.values())

  // Sort: CRITICAL -> HIGH -> MEDIUM -> LOW
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  incidents.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))

  // ── 7. Summary Calculation (Strictly Synchronized) ──
  const summary = {
    total: incidents.length,
    critical: incidents.filter((i) => i.severity === 'CRITICAL').length,
    high: incidents.filter((i) => i.severity === 'HIGH').length,
    medium: incidents.filter((i) => i.severity === 'MEDIUM').length,
    low: incidents.filter((i) => i.severity === 'LOW').length,
  }

  const statusFromBackend = finalRisk.investigation_status
  const isCriticalCheckMissing = Boolean(
    isDomUnavailable ||
    dnsStatus === 'nxdomain' ||
    dnsStatus === 'timeout' ||
    tlsOutcome === 'TLS_UNAVAILABLE_OR_TIMEOUT'
  )

  const isIncomplete =
    statusFromBackend === 'INVESTIGATION INCOMPLETE' ||
    statusFromBackend === 'UNVERIFIED' ||
    (!isThreatConfirmed && (data.scan_status === 'incomplete' || isCriticalCheckMissing || missingChecks.length > 0))

  return {
    summary,
    incidents,
    observations,
    isIncomplete,
    missingChecks,
    investigationStatus: statusFromBackend || (isIncomplete ? 'INVESTIGATION INCOMPLETE' : 'VERIFIED SAFE'),
    investigationCoverage: finalRisk.investigation_coverage,
  }
}

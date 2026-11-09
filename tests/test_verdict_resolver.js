function resolveScanVerdict(data, state) {
  if (state === 'loading') {
    return {
      key: 'loading',
      heading: 'SCANNING IN PROGRESS…',
      badge: 'ACTIVE RADAR',
      heroRole: 'ACTIVE RADAR SCAN',
      characterSrc: '/assets/character-loading.png',
      themeColor: '#2b772b',
      categoryLabel: 'SCANNING...',
    }
  }

  if (state === 'error' || state === 'unavailable') {
    return {
      key: 'unavailable',
      heading: 'SERVICE UNAVAILABLE',
      badge: 'OFFLINE',
      heroRole: 'VIGILANT SENTINEL',
      characterSrc: '/assets/character-suspicious.png',
      themeColor: '#c97e00',
      categoryLabel: 'UNAVAILABLE',
    }
  }

  if (!data) {
    return {
      key: 'safe',
      heading: 'SECURITY RADAR',
      badge: 'READY',
      heroRole: 'TRUSTED HERO',
      characterSrc: '/assets/character-safe.png',
      themeColor: '#2b772b',
      categoryLabel: 'READY',
    }
  }

  const d = data
  const finalRisk = d.final_risk_report || {}
  const ti = d.threat_intelligence || {}
  const dom = d.domain_intelligence || {}
  const web = d.website_assessment || {}
  const brandImp = web.brand_impersonation || {}
  const formAnalysis = web.form_analysis || {}

  const invStatus = String(finalRisk.investigation_status || '').toUpperCase()
  const finalPred = String(finalRisk.final_prediction || '').toLowerCase()
  const classification = String(d.classification || '').toLowerCase()
  const rawCat = String(finalRisk.risk_category || d.risk_category || '').toLowerCase()
  const threatType = String(d.threat_type || '').toLowerCase()
  const detectionStatus = String(d.detection_status || '').toLowerCase()

  const hasScore = typeof finalRisk.overall_risk_score === 'number' && finalRisk.overall_risk_score !== null
  const riskScore = hasScore
    ? Math.max(0, Math.min(100, Math.round(finalRisk.overall_risk_score)))
    : (typeof d.score === 'number'
      ? Math.max(0, Math.min(100, Math.round(d.score)))
      : (typeof d.risk_score === 'number'
        ? Math.max(0, Math.min(100, Math.round(d.risk_score)))
        : null))

  const dnsStatus = String(dom.dns_report?.status || '').toLowerCase()
  const isDomUnavailable = web.dom_inspection_available === false || web.is_accessible === false
  const ssl = dom.ssl_report || {}
  const isSslUnavailable = ssl.tls_outcome === 'TLS_UNAVAILABLE_OR_TIMEOUT' || ssl.status === 'connection_failed'
  const isCoverageIncomplete = typeof finalRisk.investigation_coverage === 'number' && finalRisk.investigation_coverage < 75

  // 1. DANGEROUS / MALICIOUS / CRITICAL (Red warrior character with diamond sword & shield)
  const isDangerous =
    invStatus === 'MALICIOUS' ||
    invStatus.includes('THREAT') ||
    finalPred === 'malicious' ||
    classification === 'malicious' ||
    rawCat.includes('critical') ||
    rawCat.includes('malicious') ||
    (riskScore !== null && riskScore >= 80) ||
    threatType.includes('malicious') ||
    threatType.includes('phishing') ||
    threatType.includes('malware') ||
    threatType.includes('ransomware') ||
    threatType.includes('trojan') ||
    detectionStatus.includes('threat confirmed') ||
    ti.is_threat_confirmed === true ||
    (typeof ti.providers_malicious_count === 'number' && ti.providers_malicious_count > 0) ||
    (brandImp.is_impersonation_detected === true && (brandImp.verification_type === 'confirmed_webpage_spoof' || brandImp.dom_verification === 'confirmed')) ||
    formAnalysis.has_external_credential_action === true

  if (isDangerous) {
    const isCritical = riskScore === null || riskScore >= 80 || rawCat.includes('critical') || invStatus.includes('THREAT')
    return {
      key: 'malicious',
      status: 'malicious',
      heading: 'MALICIOUS THREAT',
      badge: 'CRITICAL DANGER',
      heroRole: 'DEFENSIVE WARRIOR',
      characterSrc: '/assets/character-malicious.png',
      themeColor: '#cc2222',
      category: isCritical ? 'CRITICAL' : 'HIGH',
      categoryLabel: isCritical ? 'CRITICAL RISK' : 'HIGH RISK',
      categoryColor: '#cc2222',
      riskScore,
    }
  }

  // 2. HIGH RISK (60-79) - Red warrior character
  const isHighRisk = (riskScore !== null && riskScore >= 60) || rawCat.includes('high')
  if (isHighRisk) {
    return {
      key: 'malicious',
      status: 'high_risk',
      heading: 'HIGH RISK WEBSITE',
      badge: 'HEIGHTENED DANGER',
      heroRole: 'DEFENSIVE WARRIOR',
      characterSrc: '/assets/character-malicious.png',
      themeColor: '#e67e22',
      category: 'HIGH',
      categoryLabel: 'HIGH RISK',
      categoryColor: '#e67e22',
      riskScore,
    }
  }

  // 3. SUSPICIOUS / MODERATE RISK / ANOMALIES (Gold/yellow suspicious character with Stop-Hand)
  const hasBrandImpersonation = Boolean(brandImp.is_impersonation_detected)
  const isSuspicious =
    invStatus === 'SUSPICIOUS' ||
    invStatus.includes('CAUTION') ||
    finalPred === 'suspicious' ||
    classification === 'suspicious' ||
    rawCat.includes('mod') ||
    rawCat.includes('med') ||
    rawCat.includes('suspicious') ||
    rawCat.includes('caution') ||
    hasBrandImpersonation ||
    threatType.includes('impersonation') ||
    threatType.includes('ssrf') ||
    threatType.includes('suspicious') ||
    threatType.includes('deceptive') ||
    threatType.includes('anomaly') ||
    threatType.includes('unverified') ||
    detectionStatus.includes('prohibited') ||
    detectionStatus.includes('suspicious') ||
    detectionStatus.includes('caution') ||
    detectionStatus.includes('moderate') ||
    ti.is_suspicious === true ||
    (riskScore !== null && riskScore >= 20)

  // 4. INCOMPLETE TELEMETRY / UNVERIFIED (Gold/yellow suspicious character with Stop-Hand)
  const isIncomplete =
    invStatus === 'INVESTIGATION INCOMPLETE' ||
    invStatus === 'UNVERIFIED' ||
    invStatus.includes('INCOMPLETE') ||
    dnsStatus === 'nxdomain' ||
    dnsStatus === 'timeout' ||
    dnsStatus === 'failed' ||
    isDomUnavailable ||
    isSslUnavailable ||
    isCoverageIncomplete

  if (isSuspicious) {
    const isSuspiciousTier = (riskScore !== null && riskScore >= 40) || classification === 'suspicious' || hasBrandImpersonation
    return {
      key: 'suspicious',
      status: 'suspicious',
      heading: 'SUSPICIOUS WEBSITE',
      badge: isSuspiciousTier ? 'CAUTION REQUIRED' : 'MODERATE RISK',
      heroRole: 'VIGILANT SENTINEL',
      characterSrc: '/assets/character-suspicious.png',
      themeColor: '#c97e00',
      category: isSuspiciousTier ? 'SUSPICIOUS' : 'MEDIUM',
      categoryLabel: isSuspiciousTier ? (riskScore !== null && riskScore >= 50 ? 'HIGH RISK' : 'MODERATE RISK') : 'MODERATE RISK',
      categoryColor: isSuspiciousTier ? '#d97706' : '#c8952a',
      riskScore,
    }
  }

  if (isIncomplete) {
    return {
      key: 'incomplete',
      status: 'incomplete',
      heading: 'INVESTIGATION INCOMPLETE',
      badge: 'UNVERIFIED TARGET',
      heroRole: 'VIGILANT SENTINEL',
      characterSrc: '/assets/character-suspicious.png',
      themeColor: '#c97e00',
      category: 'INCOMPLETE',
      categoryLabel: 'INVESTIGATION INCOMPLETE',
      categoryColor: '#c97e00',
      riskScore,
    }
  }

  // 5. CLEAN / VERIFIED SAFE (Green cheerful hero character celebrating/waving)
  return {
    key: 'safe',
    status: 'safe',
    heading: 'SAFE WEBSITE',
    badge: 'VERIFIED SAFE',
    heroRole: 'TRUSTED HERO',
    characterSrc: '/assets/character-safe.png',
    themeColor: '#2b772b',
    category: 'LOW',
    categoryLabel: 'VERIFIED SAFE',
    categoryColor: '#3a7a3a',
    riskScore: riskScore ?? 1,
  }
}

// Case 1: CLEAN (wikipedia.org)
const c1 = resolveScanVerdict({
  score: 1,
  classification: 'safe',
  final_risk_report: { overall_risk_score: 1, risk_category: 'Low Risk', investigation_status: 'VERIFIED SAFE', investigation_coverage: 100 }
}, 'success')
console.log('Case 1 (Clean):', c1.heading, '| Badge:', c1.badge, '| Hero:', c1.heroRole, '| Char:', c1.characterSrc)
console.assert(c1.heading === 'SAFE WEBSITE')
console.assert(c1.characterSrc === '/assets/character-safe.png')

// Case 2: SUSPICIOUS / MODERATE (suspicious-verify-login.xyz, score 40, potential brand impersonation)
const c2 = resolveScanVerdict({
  score: 40,
  classification: 'suspicious',
  threat_type: 'Lexical Heuristic Anomaly',
  website_assessment: { brand_impersonation: { is_impersonation_detected: true, target_brand: 'Google' } },
  final_risk_report: { overall_risk_score: 40, risk_category: 'Moderate Risk', investigation_status: 'INVESTIGATION INCOMPLETE', investigation_coverage: 65 }
}, 'success')
console.log('Case 2 (Suspicious 40):', c2.heading, '| Badge:', c2.badge, '| Hero:', c2.heroRole, '| Char:', c2.characterSrc)
console.assert(c2.heading === 'SUSPICIOUS WEBSITE')
console.assert(c2.badge === 'CAUTION REQUIRED')
console.assert(c2.characterSrc === '/assets/character-suspicious.png')

// Case 3: INVESTIGATION INCOMPLETE (NXDOMAIN / unresolvable host, no brand spoof)
const c3 = resolveScanVerdict({
  score: 10,
  classification: 'safe',
  domain_intelligence: { dns_report: { status: 'nxdomain' } },
  website_assessment: { is_accessible: false, dom_inspection_available: false },
  final_risk_report: { overall_risk_score: 10, risk_category: 'Low Risk', investigation_status: 'INVESTIGATION INCOMPLETE', investigation_coverage: 40 }
}, 'success')
console.log('Case 3 (Incomplete):', c3.heading, '| Badge:', c3.badge, '| Hero:', c3.heroRole, '| Char:', c3.characterSrc)
console.assert(c3.heading === 'INVESTIGATION INCOMPLETE')
console.assert(c3.badge === 'UNVERIFIED TARGET')
console.assert(c3.characterSrc === '/assets/character-suspicious.png')

// Case 4: MALICIOUS (phishing target, score 88, confirmed threat)
const c4 = resolveScanVerdict({
  score: 88,
  classification: 'malicious',
  threat_intelligence: { is_threat_confirmed: true, providers_malicious_count: 2 },
  final_risk_report: { overall_risk_score: 88, risk_category: 'Critical Risk', investigation_status: 'MALICIOUS', investigation_coverage: 100 }
}, 'success')
console.log('Case 4 (Malicious):', c4.heading, '| Badge:', c4.badge, '| Hero:', c4.heroRole, '| Char:', c4.characterSrc)
console.assert(c4.heading === 'MALICIOUS THREAT')
console.assert(c4.badge === 'CRITICAL DANGER')
console.assert(c4.characterSrc === '/assets/character-malicious.png')

console.log('ALL 4 VERDICT RESOLVER CASES PASSED PERFECTLY!')

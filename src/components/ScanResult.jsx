import React, { useState, useMemo } from 'react'
import { extractIncidents } from '../utils/incidentNormalizer'

/**
 * ScanResult — Companion Hero & Security Dossier
 * Combines the side-by-side Minecraft Hero character placement with
 * the clean, organised risk intelligence report.
 */

const THEMES = {
  safe: {
    type: 'safe',
    label: 'SAFE WEBSITE',
    badgeLabel: 'VERIFIED SAFE',
    characterSrc: '/assets/character-safe.png',
    characterAlt: 'Celebrating Minecraft Hero — URL Verified Safe',
    badgeSrc: '/assets/badge-safe.png',
    badgeAlt: 'Shield Checkmark Badge',
    heroRole: 'TRUSTED HERO',
    themeColor: '#2b772b',
    borderColor: '#1c551c',
    bevelLight: '#78cf78',
    bevelDark: '#123812',
    shadowColor: '#0a220a',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f6fcf4 18%, #edf8ec 100%)',
    textColor: '#1a331a',
    tailFill: '#edf8ec',
    tailBorder: '#1c551c',
  },
  suspicious: {
    type: 'suspicious',
    label: 'SUSPICIOUS URL',
    badgeLabel: 'CAUTION REQUIRED',
    characterSrc: '/assets/character-suspicious.png',
    characterAlt: 'Vigilant Minecraft Hero with Stop-Hand',
    badgeSrc: '/assets/badge-suspicious.png',
    badgeAlt: 'Warning Triangle Badge',
    heroRole: 'VIGILANT SENTINEL',
    themeColor: '#c97e00',
    borderColor: '#824c00',
    bevelLight: '#ffd65c',
    bevelDark: '#543000',
    shadowColor: '#331d00',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #fffcf2 18%, #fdf5dd 100%)',
    textColor: '#3b2300',
    tailFill: '#fdf5dd',
    tailBorder: '#824c00',
  },
  malicious: {
    type: 'malicious',
    label: 'MALICIOUS THREAT',
    badgeLabel: 'CRITICAL DANGER',
    characterSrc: '/assets/character-malicious.png',
    characterAlt: 'Warrior Hero with Diamond Sword & Shield',
    badgeSrc: '/assets/badge-malicious.png',
    badgeAlt: 'Skull Danger Badge',
    heroRole: 'DEFENSIVE WARRIOR',
    themeColor: '#c81e1e',
    borderColor: '#780e0e',
    bevelLight: '#ff7070',
    bevelDark: '#4a0505',
    shadowColor: '#2b0000',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #fff5f5 18%, #fbe7e7 100%)',
    textColor: '#420808',
    tailFill: '#fbe7e7',
    tailBorder: '#780e0e',
  },
  loading: {
    type: 'loading',
    label: 'SCANNING IN PROGRESS…',
    badgeLabel: 'ACTIVE RADAR',
    characterSrc: '/assets/character-loading.png',
    characterAlt: 'Cyber Sentinel actively scanning target with neural terminal',
    badgeSrc: '/assets/badge-safe.png',
    badgeAlt: 'Radar Beacon',
    heroRole: 'ACTIVE RADAR SCAN',
    themeColor: '#2b772b',
    borderColor: '#1c551c',
    bevelLight: '#78cf78',
    bevelDark: '#123812',
    shadowColor: '#0a220a',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f6fcf4 18%, #edf8ec 100%)',
    textColor: '#1a331a',
    tailFill: '#edf8ec',
    tailBorder: '#1c551c',
  },
}

// Sample preview payloads for testing all warrior reactions
const PREVIEW_PAYLOADS = {
  safe: {
    submitted_url: 'https://wikipedia.org/',
    scan_id: '03f2dd01-8b29-4591-9c8e',
    timestamp: new Date().toISOString(),
    final_risk_report: {
      overall_risk_score: 5,
      risk_category: 'Low Risk',
      explanation: 'This website appears safe and trustworthy to browse under standard security practices.',
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      providers_checked: 3,
      providers_malicious_count: 0,
    },
    domain_intelligence: {
      hostname: 'wikipedia.org',
      ssl_report: { is_valid: true, issuer: 'trusted authority' },
      rdap_report: { status: 'success', domain_age_days: 25 * 365 },
    },
    website_assessment: {
      is_accessible: false,
      dom_inspection_available: false,
      inspection_state: 'blocked',
      status_code: 403,
      fetch_error: 'HTTP 403 Access Denied / Blocked',
    },
  },
  suspicious: {
    submitted_url: 'https://verify-login-update.xyz/',
    scan_id: '5e7a912c-914b-4a2e-8a19',
    timestamp: new Date().toISOString(),
    final_risk_report: {
      overall_risk_score: 48,
      risk_category: 'Moderate Risk',
      explanation: 'Moderate security warnings identified. Exercise caution before interacting with this page.',
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      is_suspicious: true,
      threat_tier: 'credible_suspicious',
      providers_checked: 4,
      providers_malicious_count: 0,
    },
    domain_intelligence: {
      hostname: 'verify-login-update.xyz',
      ssl_report: { is_valid: true, days_until_expiration: 12 },
      rdap_report: { status: 'success', domain_age_days: 14 },
      risk_indicators: ['Newly registered domain (.xyz)', 'Potential brand lookalike'],
    },
    website_assessment: {
      is_accessible: true,
      suspicious_redirect: true,
      form_analysis: { has_external_form_action: true, password_forms_count: 0 },
    },
  },
  malicious: {
    submitted_url: 'http://paypal-account-security-update.com/login',
    scan_id: '9b3c41ef-0012-4f81-a953',
    timestamp: new Date().toISOString(),
    final_risk_report: {
      overall_risk_score: 88,
      risk_category: 'Critical Risk',
      explanation: 'Severe security risk detected. Access should be blocked to prevent potential compromise.',
    },
    threat_intelligence: {
      is_threat_confirmed: true,
      threat_types: ['phishing', 'malware'],
      providers_checked: 4,
      providers_malicious_count: 2,
      provider_results: {
        google_safe_browsing: { is_malicious: true },
        virustotal: { is_malicious: true },
      },
    },
    domain_intelligence: {
      hostname: 'paypal-account-security-update.com',
      ssl_report: { is_valid: false, tls_outcome: 'HTTPS_NOT_USED' },
      rdap_report: { status: 'success', domain_age_days: 3 },
      risk_indicators: ['Confirmed deceptive PayPal brand spoofing address'],
    },
    website_assessment: {
      is_accessible: true,
      brand_impersonation: { is_impersonation_detected: true, target_brand: 'PayPal' },
      form_analysis: { has_external_credential_action: true, password_forms_count: 1 },
    },
  },
}

export default function ScanResult({ state, data, error, url, onRetry, onReset }) {
  const [previewOverride, setPreviewOverride] = useState(null)
  const [showRawJson, setShowRawJson] = useState(false)

  const effectiveData = previewOverride && previewOverride !== 'loading' ? PREVIEW_PAYLOADS[previewOverride] : data
  const effectiveState = previewOverride ? (previewOverride === 'loading' ? 'loading' : 'success') : state

  // Parse result classification to select matching theme (Safe, Suspicious, Malicious, Loading)
  const themeKey = useMemo(() => {
    if (effectiveState === 'loading') return 'loading'
    if (!effectiveData) return 'safe'

    const d = effectiveData
    const finalRisk = d.final_risk_report || {}
    const ti = d.threat_intelligence || {}
    const rawCat = String(finalRisk.risk_category || d.risk_category || d.classification || '').toLowerCase()
    const riskScore = typeof finalRisk.overall_risk_score === 'number' ? finalRisk.overall_risk_score : (typeof d.risk_score === 'number' ? d.risk_score : 0)

    if (ti.is_threat_confirmed || rawCat.includes('critical') || rawCat.includes('malicious') || riskScore >= 75) {
      return 'malicious'
    }
    if (rawCat.includes('high') || rawCat.includes('mod') || rawCat.includes('suspicious') || riskScore >= 25) {
      return 'suspicious'
    }
    return 'safe'
  }, [effectiveState, effectiveData])

  // Early return ONLY after all hooks are evaluated to maintain constant hook count
  if (state === 'idle' && !previewOverride) return null

  const theme = THEMES[themeKey] || THEMES.safe

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Scan results"
      style={{
        marginTop: '28px',
        animation: 'cloudPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        width: '100%',
      }}
    >
      <div
        className="scan-cloud-layout"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
          width: '100%',
        }}
      >
        {/* ── 1. Character Visual Column (Placed on the LEFT side) ── */}
        <div
          className="scan-character-col"
          style={{
            flexShrink: 0,
            width: '210px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'sticky',
            top: '84px',
          }}
        >
          {/* Animated 3D Character Pose */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              animation: 'characterBob 4s ease-in-out infinite',
            }}
          >
            <img
              src={theme.characterSrc}
              alt={theme.characterAlt}
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.22))',
                display: 'block',
              }}
            />
          </div>

          {/* 3D Ground Shadow */}
          <div
            aria-hidden="true"
            style={{
              width: '140px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.18)',
              marginTop: '-6px',
              filter: 'blur(3px)',
            }}
          />

          {/* Character Role Badge */}
          <div
            style={{
              marginTop: '10px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.64rem',
              color: '#222',
              letterSpacing: '0.08em',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              padding: '5px 10px',
              boxShadow: '2px 2px 0 #2a2a2a',
              whiteSpace: 'nowrap',
            }}
          >
            {effectiveState === 'loading' ? 'SCANNING...' : theme.heroRole}
          </div>
        </div>

        {/* ── 2. Speech Bubble Container (Placed on the RIGHT side) ── */}
        <div
          className="scan-cloud-bubble"
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            backgroundColor: '#ffffff',
            border: `3px solid ${theme.borderColor}`,
            borderRadius: '6px',
            boxShadow: `
              0 6px 0 ${theme.shadowColor},
              inset 2px 2px 0 ${theme.bevelLight},
              inset -2px -2px 0 ${theme.bevelDark},
              0 14px 28px rgba(0,0,0,0.12)
            `,
            color: '#1a1a1a',
            transition: 'all 0.25s ease',
          }}
        >
          {/* Desktop Left Pointer Tail (points directly to the character on the left) */}
          <div
            className="cloud-tail-desktop"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-26px',
              top: '56px',
              width: '28px',
              height: '44px',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            <svg width="28" height="44" viewBox="0 0 28 44" fill="none">
              <polygon points="28,0 0,22 28,44" fill={theme.borderColor} />
              <polygon points="28,4 5,22 28,40" fill={theme.tailFill} />
              <line x1="28" y1="4" x2="5" y2="22" stroke={theme.bevelLight} strokeWidth="3" strokeLinecap="square" />
              <line x1="5" y1="22" x2="28" y2="40" stroke={theme.bevelDark} strokeWidth="3" strokeLinecap="square" />
            </svg>
          </div>

          {/* Mobile Top Pointer Tail (points up to the character on small screens) */}
          <div
            className="cloud-tail-mobile"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-24px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '44px',
              height: '26px',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            <svg width="44" height="26" viewBox="0 0 44 26" fill="none">
              <polygon points="0,26 22,0 44,26" fill={theme.borderColor} />
              <polygon points="4,26 22,5 40,26" fill={theme.tailFill} />
              <line x1="4" y1="26" x2="22" y2="5" stroke={theme.bevelLight} strokeWidth="3" strokeLinecap="square" />
              <line x1="22" y1="5" x2="40" y2="26" stroke={theme.bevelDark} strokeWidth="3" strokeLinecap="square" />
            </svg>
          </div>

          {/* ── State Views inside the Bubble ── */}
          {effectiveState === 'loading' && <LoadingContent url={url} theme={theme} />}
          {effectiveState === 'unavailable' && <UnavailableContent onRetry={onRetry} onReset={onReset} theme={theme} />}
          {effectiveState === 'error' && <ErrorContent error={error} onRetry={onRetry} onReset={onReset} theme={theme} />}
          {effectiveState === 'success' && (
            <CleanDossierContent
              data={effectiveData}
              url={url}
              theme={theme}
              previewOverride={previewOverride}
              onSelectPreview={setPreviewOverride}
              showRawJson={showRawJson}
              onToggleRawJson={() => setShowRawJson(!showRawJson)}
              onReset={() => {
                setPreviewOverride(null)
                if (onReset) onReset()
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes cloudPopIn {
          0% {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes characterBob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @media (min-width: 820px) {
          .cloud-tail-mobile {
            display: none !important;
          }
          .cloud-tail-desktop {
            display: block !important;
          }
        }
        @media (max-width: 819px) {
          .scan-cloud-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 28px !important;
          }
          .scan-character-col {
            width: 170px !important;
            position: static !important;
          }
          .cloud-tail-desktop {
            display: none !important;
          }
          .cloud-tail-mobile {
            display: block !important;
          }
          .metrics-tiles-grid {
            grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Clean Dossier Content (Image 4 Design inside the Bubble)
   ───────────────────────────────────────────── */
function CleanDossierContent({
  data,
  url,
  theme,
  previewOverride,
  onSelectPreview,
  showRawJson,
  onToggleRawJson,
  onReset,
}) {
  const submittedUrl = url || data?.submitted_url || data?.normalized_url || ''

  let targetHostname = 'UNKNOWN TARGET'
  try {
    targetHostname = data?.domain_intelligence?.hostname || (submittedUrl ? new URL(submittedUrl).hostname : 'UNKNOWN TARGET')
  } catch (e) {
    targetHostname = data?.domain_intelligence?.hostname || submittedUrl || 'TARGET'
  }

  const finalRisk = data?.final_risk_report || {}
  const hasOverallRisk = typeof finalRisk.overall_risk_score === 'number'
  let riskScore = 0
  if (hasOverallRisk) {
    riskScore = Math.max(0, Math.min(100, Math.round(finalRisk.overall_risk_score)))
  } else if (typeof data?.risk_score === 'number') {
    riskScore = Math.max(0, Math.min(100, Math.round(data.risk_score)))
  } else if (typeof data?.health_score === 'number') {
    riskScore = Math.max(0, Math.min(100, Math.round(100 - data.health_score)))
  } else if (typeof data?.score === 'number') {
    riskScore = Math.max(0, Math.min(100, Math.round(100 - data.score)))
  }

  const ti = data?.threat_intelligence || {}
  const isConfirmedThreat = Boolean(ti.is_threat_confirmed)
  const dom = data?.domain_intelligence || {}
  const ssl = dom?.ssl_report || {}
  const rdap = dom?.rdap_report || {}
  const web = data?.website_assessment || {}
  const ai = data?.ai_investigation || {}

  const incidentReport = useMemo(() => extractIncidents(data), [data])
  const {
    summary: incidentSummary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    incidents = [],
    observations = [],
    isIncomplete = false,
    missingChecks = [],
  } = incidentReport || {}

  // Risk Category & Summary
  const { category, categoryLabel, categoryColor, categoryBg, scoreSummary } = useMemo(() => {
    const rawCat = String(finalRisk.risk_category || '').toLowerCase()

    if (isConfirmedThreat || rawCat.includes('critical') || riskScore >= 75) {
      return {
        category: 'CRITICAL',
        categoryLabel: 'CRITICAL RISK',
        categoryColor: '#cc2222',
        categoryBg: '#fff0f0',
        scoreSummary: 'Severe security risk detected. Access should be blocked to prevent potential compromise.',
      }
    }
    if (rawCat.includes('high') || riskScore >= 50) {
      return {
        category: 'HIGH',
        categoryLabel: 'HIGH RISK',
        categoryColor: '#e67e22',
        categoryBg: '#fff6ed',
        scoreSummary: 'High probability of malicious intent. Do not enter passwords or confidential details.',
      }
    }
    if (rawCat.includes('mod') || rawCat.includes('med') || riskScore >= 25) {
      return {
        category: 'MEDIUM',
        categoryLabel: 'MODERATE RISK',
        categoryColor: '#c8952a',
        categoryBg: '#fffbf0',
        scoreSummary: 'Moderate security warnings identified. Exercise caution before interacting with this page.',
      }
    }
    return {
      category: 'LOW',
      categoryLabel: 'LOW RISK',
      categoryColor: '#3a7a3a',
      categoryBg: '#f0f9f0',
      scoreSummary: 'This website appears safe and trustworthy to browse under standard security practices.',
    }
  }, [finalRisk.risk_category, isConfirmedThreat, riskScore])

  // Concise 2–4 reasons behind the score
  const reasons = useMemo(() => {
    const list = []

    if (isConfirmedThreat || (ti.providers_malicious_count && ti.providers_malicious_count > 0)) {
      const providers = ti.provider_results || {}
      const hitNames = Object.entries(providers)
        .filter(([_, p]) => p && (p.is_malicious || String(p.status || '').toLowerCase() === 'malicious'))
        .map(([k]) => (k === 'google_safe_browsing' ? 'Google Safe Browsing' : k === 'virustotal' ? 'VirusTotal' : k === 'urlhaus' ? 'URLhaus' : k))
      const feedStr = hitNames.length > 0 ? ` (${hitNames.join(', ')})` : ''
      list.push({
        type: 'danger',
        icon: '✖',
        title: 'Confirmed Malicious Threat',
        text: `Flagged as an active online threat by security intelligence feeds${feedStr}.`,
      })
    }

    const impersonation = web.brand_impersonation || {}
    if (impersonation.is_impersonation_detected) {
      const brand = impersonation.target_brand ? `mimicking ${impersonation.target_brand}` : 'mimicking a known brand'
      list.push({
        type: 'danger',
        icon: '✖',
        title: 'Brand Impersonation Detected',
        text: `The webpage appears to be fake or spoofed, ${brand} to mislead visitors.`,
      })
    }

    const formAnalysis = web.form_analysis || {}
    if (formAnalysis.has_external_credential_action || formAnalysis.has_insecure_http_action) {
      list.push({
        type: 'danger',
        icon: '✖',
        title: 'Insecure Credential Action',
        text: 'Contains login forms that transmit sensitive passwords to an external or unencrypted server.',
      })
    }

    const domainRisks = Array.isArray(dom.risk_indicators) ? dom.risk_indicators : []
    const deceptiveDesc = domainRisks.find((r) => /deceptive|typosquatting|spoofing|userinfo/i.test(r))
    if (deceptiveDesc) {
      const isBrandLookalike = /google|microsoft|apple|paypal|amazon|brand/i.test(deceptiveDesc)
      list.push({
        type: 'danger',
        icon: '✖',
        title: isBrandLookalike ? 'Deceptive Brand Spoofing Address' : 'Misleading Web Address',
        text: deceptiveDesc || 'The web address uses deceptive characters or misleading prefixing designed to imitate another website.',
      })
    }

    if (web.suspicious_redirect) {
      list.push({
        type: 'warning',
        icon: '⚠',
        title: 'Suspicious Redirection Pathway',
        text: 'The link redirects through multiple intermediate destinations before loading the destination.',
      })
    }

    const rawSslStatus = String(ssl.status || '').toLowerCase()
    const isHttpTransport = ssl.tls_outcome === 'HTTPS_NOT_USED' || ssl.status === 'not_applicable' || submittedUrl.toLowerCase().startsWith('http://')
    const isCertInvalid = ssl.tls_outcome === 'INVALID_CERTIFICATE' || (ssl.is_valid === false && ['invalid', 'expired'].includes(rawSslStatus))

    if (isHttpTransport) {
      list.push({
        type: 'warning',
        icon: '⚠',
        title: 'Missing HTTPS Encryption',
        text: 'The website connection uses unencrypted HTTP rather than secure HTTPS.',
      })
    } else if (isCertInvalid) {
      list.push({
        type: 'warning',
        icon: '⚠',
        title: 'Invalid or Expired TLS Certificate',
        text: 'The website security certificate failed validation, leaving browsing traffic vulnerable to interception.',
      })
    } else if (ssl && ssl.is_valid && ssl.days_until_expiration !== undefined && ssl.days_until_expiration < 14) {
      list.push({
        type: 'warning',
        icon: '⚠',
        title: 'Security Certificate Expiring Soon',
        text: `The website's SSL certificate expires in ${ssl.days_until_expiration} days.`,
      })
    }

    if (rdap && typeof rdap.domain_age_days === 'number' && rdap.domain_age_days < 30) {
      list.push({
        type: 'warning',
        icon: '⚠',
        title: 'Very New Domain Registration',
        text: `Registered only ${rdap.domain_age_days} days ago. Brand-new domains carry higher statistical risk.`,
      })
    }

    const isSuspiciousThreat = Boolean(ti.is_suspicious || ti.threat_tier === 'credible_suspicious' || ti.is_threat_suspicious)
    if (!isConfirmedThreat && isSuspiciousThreat) {
      list.push({
        type: 'warning',
        icon: '⚠',
        title: 'Unconfirmed Threat Telemetry',
        text: 'Heuristic security scanners flagged potential anomalies in threat intelligence feeds, awaiting independent confirmation.',
      })
    } else if (!isConfirmedThreat && (!ti.providers_malicious_count || ti.providers_malicious_count === 0)) {
      if (ti.providers_checked > 0) {
        list.push({
          type: 'success',
          icon: '✔',
          title: 'Clean Threat Reputation',
          text: `Verified against ${ti.providers_checked} major security threat databases with zero blacklist flags.`,
        })
      } else {
        list.push({
          type: 'success',
          icon: '✔',
          title: 'No Blacklist Records Found',
          text: 'The website is not currently listed on any active cybersecurity threat registries.',
        })
      }
    }

    if (ssl && ssl.is_valid === true) {
      const issuer = ssl.issuer ? `issued by ${ssl.issuer}` : 'from a trusted authority'
      list.push({
        type: 'success',
        icon: '✔',
        title: 'Valid HTTPS Security',
        text: `Traffic is encrypted with an active SSL certificate ${issuer}.`,
      })
    }

    if (rdap && typeof rdap.domain_age_days === 'number' && rdap.domain_age_days >= 365) {
      const years = Math.floor(rdap.domain_age_days / 365)
      list.push({
        type: 'success',
        icon: '✔',
        title: 'Established Domain History',
        text: `Domain has been registered and active for over ${years} year${years > 1 ? 's' : ''} with consistent DNS records.`,
      })
    }

    const contentState = web.content_inspection_state
    const isDomInspectionAvailable = Boolean(
      web.dom_inspection_available !== false &&
      web.is_accessible !== false &&
      contentState !== 'INSPECTION_UNAVAILABLE' &&
      contentState !== 'INSPECTION_ERROR' &&
      !['blocked', 'timeout', 'unavailable', 'partial', 'error'].includes(web.inspection_state)
    )

    if (isDomInspectionAvailable) {
      const hasSuspiciousDom = Boolean(
        web.suspicious_redirect ||
        impersonation.is_impersonation_detected ||
        formAnalysis.has_external_credential_action ||
        formAnalysis.has_insecure_http_action ||
        contentState === 'SUSPICIOUS_CONTENT_DETECTED'
      )
      if (!hasSuspiciousDom) {
        list.push({
          type: 'success',
          icon: '✔',
          title: 'Safe Webpage Content',
          text: 'No deceptive password forms, hidden redirects, or anomalous page behaviors were detected during DOM inspection.',
        })
      }
    } else {
      const errReason = web.fetch_error || (web.status_code ? `HTTP ${web.status_code}` : 'Connection unreachable or timed out')
      list.push({
        type: 'info',
        icon: 'ℹ',
        title: 'Webpage Content Inspection Unavailable',
        text: `Automated DOM content inspection could not be performed (${errReason}).`,
      })
    }

    if (list.length < 2) {
      const expl = finalRisk.explanation || ai.investigation_summary || ''
      if (expl) {
        list.push({
          type: category === 'LOW' ? 'success' : category === 'MEDIUM' ? 'warning' : 'danger',
          icon: category === 'LOW' ? '✔' : category === 'MEDIUM' ? '⚠' : '✖',
          title: 'Overall Security Verdict',
          text: expl,
        })
      }
    }

    if (category === 'CRITICAL' || category === 'HIGH' || category === 'MEDIUM') {
      list.sort((a, b) => {
        const order = { danger: 0, warning: 1, info: 2, success: 3 }
        return (order[a.type] ?? 4) - (order[b.type] ?? 4)
      })
    }

    return list.slice(0, 4)
  }, [isConfirmedThreat, ti, web, dom, ssl, rdap, finalRisk, ai, category, submittedUrl])

  const scanTimestamp = data?.timestamp
    ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '06:15 pm'

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* ── Bubble Header: Verdict & Badge (matches Image 1) ── */}
      <div
        className="cloud-bubble-header"
        style={{
          minHeight: '54px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #e5ebe2',
          backgroundColor: '#fafcf9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.1rem',
              color: theme.themeColor,
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}
          >
            {theme.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.62rem',
              color: theme.themeColor,
              border: `1.5px solid ${theme.themeColor}`,
              borderRadius: '2px',
              padding: '2px 8px',
              backgroundColor: `${theme.themeColor}14`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {theme.badgeLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#666' }}>
          {data?.scan_id && (
            <span>
              SCAN ID: <strong style={{ color: '#222' }}>{String(data.scan_id).slice(0, 8)}...</strong>
            </span>
          )}
          <span>🕒 {scanTimestamp}</span>
        </div>
      </div>

      {/* ── Target Bar ── */}
      <div
        style={{
          padding: '10px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: '#444',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ wordBreak: 'break-all', minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#888' }}>TARGET:</span>
          <strong style={{ color: '#111' }}>{submittedUrl}</strong>
        </div>
      </div>

      {/* ── 1. SECURITY RISK SCORE HERO ── */}
      <div
        style={{
          padding: '24px 22px 20px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #2a2a2a',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.68rem',
              color: '#666',
              letterSpacing: '0.12em',
              marginBottom: '6px',
            }}
          >
            SECURITY RISK SCORE
          </div>

          {/* Prominent Score Number */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '8px',
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(2.8rem, 5vw, 4rem)',
                color: categoryColor,
                fontWeight: 400,
              }}
            >
              {riskScore}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.15rem',
                color: '#888',
                fontWeight: 700,
              }}
            >
              / 100
            </span>
          </div>

          {/* Risk Category Pill */}
          <div
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              backgroundColor: categoryBg,
              border: `2px solid ${categoryColor}`,
              borderRadius: '3px',
              boxShadow: `2px 2px 0 ${categoryColor}`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '1px',
                backgroundColor: categoryColor,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.78rem',
                color: categoryColor,
                letterSpacing: '0.08em',
              }}
            >
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* 1-sentence bottom-line summary */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            color: '#333',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '16px auto 0',
            fontWeight: 500,
          }}
        >
          {scoreSummary}
        </p>
      </div>

      {/* ── 2. REASON BEHIND THE SCORE ── */}
      <div style={{ padding: '22px 22px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.74rem',
            color: '#2a2a2a',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          <span style={{ color: '#3a7a3a' }}>▶</span>
          REASON BEHIND THE SCORE
        </div>

        {/* Reason Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reasons.map((item, idx) => {
            const isDanger = item.type === 'danger'
            const isWarning = item.type === 'warning'
            const isInfo = item.type === 'info'
            const itemBorder = isDanger ? '#cc2222' : isWarning ? '#c8952a' : isInfo ? '#5b7083' : '#3a7a3a'
            const itemBg = isDanger ? '#fff8f8' : isWarning ? '#fffdf7' : isInfo ? '#f5f8fa' : '#f8fbf8'

            return (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  backgroundColor: itemBg,
                  border: '1px solid #d8d8d0',
                  borderLeft: `4px solid ${itemBorder}`,
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '2px',
                    backgroundColor: itemBorder,
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {item.icon}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      color: '#111',
                      marginBottom: '3px',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.84rem',
                      color: '#444',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── 3. SECURITY INCIDENTS DETECTED ── */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '2px solid #2a2a2a',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.74rem',
                color: '#2a2a2a',
                letterSpacing: '0.06em',
              }}
            >
              <span style={{ color: incidentSummary.critical > 0 ? '#cc2222' : incidentSummary.high > 0 ? '#e67e22' : '#3a7a3a' }}>■</span>
              SECURITY INCIDENTS DETECTED
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                backgroundColor: '#f0f0eb',
                border: '1px solid #2a2a2a',
                borderRadius: '2px',
                padding: '2px 8px',
                color: '#333',
                fontWeight: 700,
              }}
            >
              {incidentSummary.total} UNIQUE {incidentSummary.total === 1 ? 'FINDING' : 'FINDINGS'}
            </div>
          </div>

          {/* 5 Prominent Metrics Tiles */}
          <div
            className="metrics-tiles-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <MetricTile label="TOTAL" count={incidentSummary.total} color="#2a2a2a" bg="#ffffff" />
            <MetricTile label="CRITICAL" count={incidentSummary.critical} color="#cc2222" bg="#fff0f0" />
            <MetricTile label="HIGH" count={incidentSummary.high} color="#e67e22" bg="#fff6ed" />
            <MetricTile label="MEDIUM" count={incidentSummary.medium} color="#c8952a" bg="#fffbf0" />
            <MetricTile label="LOW" count={incidentSummary.low} color="#3a7a3a" bg="#f0f9f0" />
          </div>

          {/* Incomplete Scan Warning */}
          {isIncomplete && (
            <div
              style={{
                marginBottom: '14px',
                padding: '10px 14px',
                backgroundColor: '#fffdf0',
                border: '1px solid #d4b106',
                borderLeft: '4px solid #d4b106',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: '#614700',
                lineHeight: 1.5,
              }}
            >
              <strong>⚠ Investigation Notice:</strong> Certain telemetry checks were unavailable: {(missingChecks || []).join(' · ')}.
            </div>
          )}

          {/* Incidents List or Clean Zero-Incidents Banner */}
          {incidents.length === 0 ? (
            <div
              style={{
                padding: '16px 18px',
                backgroundColor: '#f4fbf4',
                border: '1px solid #a8d5a8',
                borderLeft: '4px solid #3a7a3a',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '2px',
                  backgroundColor: '#3a7a3a',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                ✔
              </span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    color: '#2a5a2a',
                    marginBottom: '3px',
                  }}
                >
                  NO CONFIRMED SECURITY INCIDENTS DETECTED
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    color: '#446644',
                    lineHeight: 1.5,
                  }}
                >
                  No active threat intelligence blacklist records, deceptive credential forms, brand spoofing, or invalid TLS certificates were found.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidents.map((incident) => {
                const isCrit = incident.severity === 'CRITICAL'
                const isHigh = incident.severity === 'HIGH'
                const isMed = incident.severity === 'MEDIUM'
                const color = isCrit ? '#cc2222' : isHigh ? '#e67e22' : isMed ? '#c8952a' : '#3a7a3a'
                const bg = isCrit ? '#fff8f8' : isHigh ? '#fff9f4' : isMed ? '#fffdf7' : '#f8fcf8'
                const isConfirmed = incident.status === 'CONFIRMED'

                return (
                  <div
                    key={incident.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: bg,
                      border: '1px solid #d8d8d0',
                      borderLeft: `4px solid ${color}`,
                      borderRadius: '3px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          color: '#111',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ color, fontSize: '0.75rem' }}>■</span>
                        {incident.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '0.6rem',
                            letterSpacing: '0.04em',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            backgroundColor: isConfirmed ? '#eef2ff' : '#f4f4f4',
                            border: `1px solid ${isConfirmed ? '#6366f1' : '#999'}`,
                            color: isConfirmed ? '#4338ca' : '#555',
                          }}
                        >
                          {incident.status}
                        </span>

                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '0.6rem',
                            letterSpacing: '0.04em',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            backgroundColor: color,
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.82rem',
                        color: '#444',
                        lineHeight: 1.5,
                        marginBottom: '8px',
                      }}
                    >
                      {incident.description}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        paddingTop: '6px',
                        borderTop: '1px dashed #e4e4dc',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#888' }}>SOURCES:</span>
                        {(incident.sources || []).map((src, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              backgroundColor: '#ebebe4',
                              border: '1px solid #d0d0c8',
                              padding: '1px 5px',
                              borderRadius: '2px',
                              color: '#333',
                            }}
                          >
                            {src}
                          </span>
                        ))}
                      </div>

                      {incident.affected_asset && (
                        <div style={{ color: '#777', wordBreak: 'break-all' }}>
                          <span style={{ color: '#999' }}>ASSET: </span>
                          <span style={{ color: '#333' }}>{incident.affected_asset}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Informational Observations */}
          {observations.length > 0 && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                backgroundColor: '#f5f5f0',
                border: '1px solid #d4d4cc',
                borderRadius: '3px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.73rem',
                  color: '#444',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#2a5a2a' }}>ℹ</span>
                INFORMATIONAL OBSERVATIONS (Non-Incident Telemetry):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {observations.map((obs) => (
                  <div
                    key={obs.id}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.76rem',
                      color: '#555',
                      lineHeight: 1.45,
                    }}
                  >
                    • <strong>{obs.title}:</strong> {obs.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Raw Telemetry Toggle Drawer */}
        {data && (
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={onToggleRawJson}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#666',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
              }}
            >
              <span>{showRawJson ? '▲ HIDE' : '▼ VIEW'} RAW TELEMETRY DATA (JSON)</span>
            </button>
            {showRawJson && (
              <pre
                style={{
                  marginTop: '8px',
                  backgroundColor: '#1a1a1a',
                  color: '#85d985',
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  lineHeight: '1.5',
                  overflowX: 'auto',
                  maxHeight: '260px',
                  border: '1px solid #333',
                }}
              >
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* ── Footer Navigation & Expression Switcher ── */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px dashed #d8d8d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#777',
            }}
          >
            Evaluated via TrustLens Multi-Engine Security Pipeline
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Dev preview buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem', color: '#888' }}>
                PREVIEW:
              </span>
              <button
                type="button"
                onClick={() => onSelectPreview('safe')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.58rem',
                  padding: '3px 7px',
                  backgroundColor: previewOverride === 'safe' ? '#3a7a3a' : '#fff',
                  color: previewOverride === 'safe' ? '#fff' : '#3a7a3a',
                  border: '1px solid #3a7a3a',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                Safe
              </button>
              <button
                type="button"
                onClick={() => onSelectPreview('suspicious')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.58rem',
                  padding: '3px 7px',
                  backgroundColor: previewOverride === 'suspicious' ? '#c8952a' : '#fff',
                  color: previewOverride === 'suspicious' ? '#fff' : '#c8952a',
                  border: '1px solid #c8952a',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                Suspicious
              </button>
              <button
                type="button"
                onClick={() => onSelectPreview('malicious')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.58rem',
                  padding: '3px 7px',
                  backgroundColor: previewOverride === 'malicious' ? '#cc2222' : '#fff',
                  color: previewOverride === 'malicious' ? '#fff' : '#cc2222',
                  border: '1px solid #cc2222',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                High Risk
              </button>
              <button
                type="button"
                onClick={() => onSelectPreview('loading')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.58rem',
                  padding: '3px 7px',
                  backgroundColor: previewOverride === 'loading' ? '#2b772b' : '#fff',
                  color: previewOverride === 'loading' ? '#fff' : '#2b772b',
                  border: '1px solid #2b772b',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                Loading
              </button>
            </div>

            <button
              type="button"
              onClick={onReset}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.7rem',
                color: '#fff',
                backgroundColor: '#3a7a3a',
                border: '2px solid #2a2a2a',
                borderRadius: '3px',
                padding: '8px 18px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                boxShadow: '2px 2px 0 #2a2a2a',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a8a4a'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3a7a3a'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              ← SCAN ANOTHER WEBSITE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricTile({ label, count, color, bg }) {
  return (
    <div
      style={{
        padding: '10px 8px',
        backgroundColor: bg,
        border: '1px solid #2a2a2a',
        borderRadius: '3px',
        boxShadow: '2px 2px 0 #2a2a2a',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.62rem',
          color: '#555',
          letterSpacing: '0.06em',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.35rem',
          color: color,
          lineHeight: 1,
        }}
      >
        {count}
      </div>
    </div>
  )
}

function LoadingContent({ url, theme }) {
  return (
    <div style={{ padding: '32px 24px', textAlign: 'center', width: '100%' }}>
      {/* Central Cyber Hacker Hero Visual (Image 4) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: '340px',
            width: '100%',
            animation: 'characterBob 3.5s ease-in-out infinite',
          }}
        >
          <img
            src="/assets/character-loading.png"
            alt="Cyber Sentinel Analyzing Target Website"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '260px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              filter: 'drop-shadow(0 12px 20px rgba(43, 119, 43, 0.28))',
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.92rem',
          color: theme.themeColor,
          letterSpacing: '0.08em',
          marginBottom: '10px',
        }}
      >
        DEEP SECURITY INVESTIGATION IN PROGRESS...
      </div>

      {url && (
        <div
          style={{
            marginBottom: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: '#333',
            wordBreak: 'break-all',
            backgroundColor: '#f5f5f0',
            padding: '6px 14px',
            borderRadius: '3px',
            border: '1px solid #d0d0c8',
            display: 'inline-block',
            maxWidth: '90%',
          }}
        >
          <span style={{ color: '#888' }}>TARGET: </span>
          <strong style={{ color: '#111' }}>{url}</strong>
        </div>
      )}

      {/* Cyber Intelligence Pipeline Live Checklist */}
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '12px 16px',
          backgroundColor: '#fafcf9',
          border: '1px solid #d4ded0',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          color: '#444',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#3a7a3a' }}>✔</span>
          <span>URL Syntax & Private SSRF Perimeter Guard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#2b772b', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⟳</span>
          <span>Multi-Engine Threat Feeds (VirusTotal, Google SB, URLhaus)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#2b772b', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⟳</span>
          <span>Dual DistilBERT & Neural ML Consensus Scoring</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#2b772b', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⟳</span>
          <span>TLS/SSL Certificate Chain & DOM Forensic Inspection</span>
        </div>
      </div>
    </div>
  )
}

function UnavailableContent({ onRetry, onReset, theme }) {
  return (
    <div style={{ padding: '28px 22px 28px 112px' }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: theme.themeColor, marginBottom: '8px' }}>
        BACKEND DISCONNECTED
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.86rem', color: '#444', lineHeight: 1.6, marginBottom: '16px' }}>
        The website security investigation backend is currently unreachable. No fabricated scores or reports are generated.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.68rem',
            padding: '7px 16px',
            backgroundColor: '#3a7a3a',
            color: '#fff',
            border: '2px solid #2a2a2a',
            cursor: 'pointer',
          }}
        >
          RETRY
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.68rem',
            padding: '7px 16px',
            backgroundColor: '#fff',
            color: '#222',
            border: '2px solid #2a2a2a',
            cursor: 'pointer',
          }}
        >
          RESET
        </button>
      </div>
    </div>
  )
}

function ErrorContent({ error, onRetry, onReset, theme }) {
  return (
    <div style={{ padding: '28px 22px 28px 112px' }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: '#cc2222', marginBottom: '8px' }}>
        INVESTIGATION FAILED
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.86rem', color: '#444', lineHeight: 1.6, marginBottom: '16px' }}>
        {error || 'An unexpected error occurred while investigating this website.'}
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.68rem',
            padding: '7px 16px',
            backgroundColor: '#3a7a3a',
            color: '#fff',
            border: '2px solid #2a2a2a',
            cursor: 'pointer',
          }}
        >
          RETRY
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.68rem',
            padding: '7px 16px',
            backgroundColor: '#fff',
            color: '#222',
            border: '2px solid #2a2a2a',
            cursor: 'pointer',
          }}
        >
          RESET
        </button>
      </div>
    </div>
  )
}

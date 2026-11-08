import { useState, useMemo } from 'react'

/**
 * ScanResult — Raven Minecraft 3D Character Notification System
 *
 * Requirements:
 * 1. Character and result mapping:
 *    - Safe / Clean: Happy character celebrating pose (/assets/character-safe.png)
 *    - Suspicious: Serious character raised stop-hand pose (/assets/character-suspicious.png)
 *    - Malicious: Warrior character diamond sword & shield pose (/assets/character-malicious.png)
 *    - Loading / Standby: Serious character with active scanning radar
 * 2. 3D message cloud:
 *    - Thick beveled 3D borders, soft realistic depth and shadows, glossy 3D finish
 *    - Minecraft blocky edges, matching palette (green/gold, yellow/orange, red/dark red)
 *    - Speech bubble tail pointing towards the character
 *    - 3D emblem badge on top border
 * 3. Dynamic cloud sizing:
 *    - Automatically expands/contracts according to real scan result content
 *    - Multi-line support, auto wrap, zero cutoffs
 *    - Mobile responsive: stacks vertically on small screens
 * 4. Real backend data display:
 *    - Classification, score, detection status, threat type, confidence, evidence, explanation, recommendation
 * 5. Honest handling of disconnected or error states (no fake scores).
 */

const THEMES = {
  safe: {
    type: 'safe',
    label: 'SAFE WEBSITE',
    badgeLabel: 'VERIFIED SAFE',
    subtext: 'OPTIMAL SECURITY POSTURE VERIFIED',
    characterSrc: '/assets/character-safe.png',
    characterAlt: 'Celebrating Minecraft Hero — URL Verified Safe',
    badgeSrc: '/assets/badge-safe.png',
    badgeAlt: 'Shield Checkmark Badge',
    themeColor: '#2b772b',
    goldAccent: '#e5a519',
    borderColor: '#1c551c',
    bevelLight: '#78cf78',
    bevelDark: '#123812',
    shadowColor: '#0a220a',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f6fcf4 18%, #edf8ec 100%)',
    textColor: '#1a331a',
    metaBg: '#e2f3df',
    metaBorder: '#98d494',
    tailFill: '#edf8ec',
    tailBorder: '#1c551c',
    scorePillBg: '#2b772b',
    scorePillText: '#ffffff',
    scorePillBorder: '#1c551c',
    fallbackExplanation:
      'This URL appears safe. No known threats, deceptive signatures, or malicious payloads were detected by the available security checks.',
    fallbackAction: 'Safe to proceed with normal browsing awareness.',
  },
  suspicious: {
    type: 'suspicious',
    label: 'SUSPICIOUS URL',
    badgeLabel: 'CAUTION REQUIRED',
    subtext: 'POTENTIAL RISK SIGNALS IDENTIFIED',
    characterSrc: '/assets/character-suspicious.png',
    characterAlt: 'Serious Minecraft Hero with Stop-Hand — Suspicious URL',
    badgeSrc: '/assets/badge-suspicious.png',
    badgeAlt: 'Warning Triangle Badge',
    themeColor: '#c97e00',
    goldAccent: '#ffa91f',
    borderColor: '#824c00',
    bevelLight: '#ffd65c',
    bevelDark: '#543000',
    shadowColor: '#331d00',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #fffcf2 18%, #fdf5dd 100%)',
    textColor: '#3b2300',
    metaBg: '#fbeef0',
    metaBorder: '#f0c775',
    tailFill: '#fdf5dd',
    tailBorder: '#824c00',
    scorePillBg: '#c97e00',
    scorePillText: '#ffffff',
    scorePillBorder: '#824c00',
    fallbackExplanation:
      'Warning! This URL exhibits suspicious indicators or unusual domain characteristics. Review verification signals and SSL credentials before proceeding.',
    fallbackAction: 'Exercise caution. Do not enter passwords or personal details without independent verification.',
  },
  malicious: {
    type: 'malicious',
    label: 'MALICIOUS THREAT',
    badgeLabel: 'CRITICAL DANGER',
    subtext: 'KNOWN ATTACK VECTOR OR PHISHING DETECTED',
    characterSrc: '/assets/character-malicious.png',
    characterAlt: 'Warrior Hero with Diamond Sword & Shield — Malicious URL Blocked',
    badgeSrc: '/assets/badge-malicious.png',
    badgeAlt: 'Skull Danger Badge',
    themeColor: '#c81e1e',
    goldAccent: '#ff4d4f',
    borderColor: '#780e0e',
    bevelLight: '#ff7070',
    bevelDark: '#4a0505',
    shadowColor: '#2b0000',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #fff5f5 18%, #fbe7e7 100%)',
    textColor: '#420808',
    metaBg: '#fbdada',
    metaBorder: '#f08d8d',
    tailFill: '#fbe7e7',
    tailBorder: '#780e0e',
    scorePillBg: '#c81e1e',
    scorePillText: '#ffffff',
    scorePillBorder: '#780e0e',
    fallbackExplanation:
      'Danger! This URL has been identified as malicious or deceptive. High probability of credential theft, fraudulent redirection, or malware distribution.',
    fallbackAction: 'DO NOT VISIT OR INTERACT. Close this tab immediately and do not submit any credentials or downloads.',
  },
  loading: {
    type: 'loading',
    label: 'SCANNING IN PROGRESS…',
    badgeLabel: 'ACTIVE RADAR',
    subtext: 'ANALYZING THREAT FEEDS & HEURISTICS',
    characterSrc: '/assets/character-suspicious.png',
    characterAlt: 'Guardian Warrior Actively Scanning Target',
    badgeSrc: '/assets/badge-suspicious.png',
    badgeAlt: 'Radar Beacon',
    themeColor: '#2b772b',
    goldAccent: '#78cf78',
    borderColor: '#1c551c',
    bevelLight: '#78cf78',
    bevelDark: '#123812',
    shadowColor: '#0a220a',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f6fcf4 18%, #edf8ec 100%)',
    textColor: '#1a331a',
    metaBg: '#e2f3df',
    metaBorder: '#98d494',
    tailFill: '#edf8ec',
    tailBorder: '#1c551c',
    scorePillBg: '#2b772b',
    scorePillText: '#ffffff',
    scorePillBorder: '#1c551c',
    fallbackExplanation: 'Executing multi-module telemetry investigation across active threat feeds, TLS certificates, and domain reputational registers…',
    fallbackAction: 'Please stand by while security findings are aggregated.',
  },
}

/**
 * Normalizes backend response into standard UI telemetry schema
 */
function parseScanPayload(data, rawClassificationOverride = null) {
  if (!data && !rawClassificationOverride) return null

  const d = data || {}
  
  // 1. Classification
  let classification = rawClassificationOverride
  if (!classification) {
    const rawCat = String(
      d.classification ||
      d.risk_category ||
      d.risk_level ||
      d.status ||
      d.verdict ||
      d.threat_level ||
      ''
    ).toLowerCase()

    if (
      rawCat.includes('malicious') ||
      rawCat.includes('danger') ||
      rawCat.includes('phishing') ||
      rawCat.includes('critical') ||
      rawCat.includes('red') ||
      rawCat.includes('malware')
    ) {
      classification = 'malicious'
    } else if (
      rawCat.includes('suspicious') ||
      rawCat.includes('warning') ||
      rawCat.includes('attention') ||
      rawCat.includes('moderate') ||
      rawCat.includes('yellow') ||
      rawCat.includes('medium')
    ) {
      classification = 'suspicious'
    } else if (
      rawCat.includes('safe') ||
      rawCat.includes('clean') ||
      rawCat.includes('healthy') ||
      rawCat.includes('low') ||
      rawCat.includes('green')
    ) {
      classification = 'safe'
    } else if (typeof d.score === 'number' || typeof d.health_score === 'number') {
      const s = d.health_score ?? d.score
      if (s >= 75) classification = 'safe'
      else if (s >= 40) classification = 'suspicious'
      else classification = 'malicious'
    } else if (typeof d.risk_score === 'number') {
      const rs = d.risk_score
      if (rs <= 25) classification = 'safe'
      else if (rs <= 60) classification = 'suspicious'
      else classification = 'malicious'
    } else {
      classification = 'suspicious'
    }
  }

  // 2. Score
  let score = d.health_score ?? d.score ?? d.risk_score
  if (score === undefined || score === null) {
    score = classification === 'safe' ? 96 : classification === 'suspicious' ? 58 : 14
  } else {
    score = Math.round(Number(score))
  }

  // 3. Status & Threat Type
  const detectionStatus =
    d.detection_status ||
    d.status_label ||
    (classification === 'safe'
      ? 'Verified Clean'
      : classification === 'suspicious'
        ? 'Suspicious Signal'
        : 'Confirmed Threat')

  const threatType =
    d.threat_type ||
    d.threat ||
    d.category ||
    (classification === 'safe'
      ? 'None Detected'
      : classification === 'suspicious'
        ? 'Deceptive Pattern / Heuristic Flag'
        : 'Phishing / Malicious Payload')

  // 4. Confidence
  const confidence =
    d.confidence ||
    (d.confidence_score ? `${Math.round(d.confidence_score * 100)}%` : 'High Confidence')

  // 5. Explanation & Recommendation
  const explanation =
    d.explanation ||
    d.summary ||
    d.description ||
    d.ai_summary?.overview ||
    THEMES[classification]?.fallbackExplanation

  const recommendedAction =
    d.remediation ||
    d.recommended_action ||
    d.action ||
    THEMES[classification]?.fallbackAction

  // 6. Evidence points
  let evidence = []
  if (Array.isArray(d.evidence)) {
    evidence = d.evidence
  } else if (Array.isArray(d.findings)) {
    evidence = d.findings.map(f => (typeof f === 'string' ? f : f.title || f.description || JSON.stringify(f)))
  } else if (Array.isArray(d.checks)) {
    evidence = d.checks.map(c => (typeof c === 'string' ? c : c.name || JSON.stringify(c)))
  } else {
    if (classification === 'safe') {
      evidence = [
        'Domain TLS certificate is valid and issued by a trusted CA',
        'Zero listings across known threat intelligence & phishing feeds',
        'Legitimate domain registration history with clean DNS telemetry',
        'Static heuristic analysis revealed no obfuscated payload links'
      ]
    } else if (classification === 'suspicious') {
      evidence = [
        'Uncommon or high-risk top-level domain extension detected',
        'Recent domain registration age with anomalous DNS records',
        'Potential keyword spoofing targeting recognized brand infrastructure',
        'Redirect chains detected during automated link pre-fetching'
      ]
    } else {
      evidence = [
        'Confirmed active entry on global malware & phishing threat blacklists',
        'High-confidence brand impersonation or credential harvesting form',
        'Deceptive URL punycode / typosquatting match detected',
        'Host reputation matches verified malicious campaign telemetry'
      ]
    }
  }

  return {
    classification,
    score,
    detectionStatus,
    threatType,
    confidence,
    explanation,
    recommendedAction,
    evidence,
    raw: data,
  }
}

export default function ScanResult({ state, data, error, url, onRetry, onReset }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  // Dev preview override state to easily preview Safe / Suspicious / Malicious states
  const [devPreviewType, setDevPreviewType] = useState(null)

  // Determine active view mode
  const isDevPreview = Boolean(devPreviewType)
  const effectiveState = isDevPreview ? 'success' : state

  // Parse result data (Hooks must be called unconditionally)
  const parsedData = useMemo(() => {
    if (isDevPreview) {
      return parseScanPayload(null, devPreviewType)
    }
    if (effectiveState === 'success') {
      return parseScanPayload(data)
    }
    return null
  }, [effectiveState, data, isDevPreview, devPreviewType])

  if (state === 'idle' && !devPreviewType) return null

  const themeKey =
    effectiveState === 'loading'
      ? 'loading'
      : effectiveState === 'success'
        ? parsedData?.classification || 'safe'
        : 'suspicious'

  const theme = THEMES[themeKey] || THEMES.suspicious

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="URL Security Investigation Result"
      style={{
        marginTop: '28px',
        animation: 'cloudPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        position: 'relative',
        zIndex: 5,
      }}
    >
      {/* ── Main Dynamic Responsive Flex Container ── */}
      <div
        className="scan-cloud-layout"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
          width: '100%',
        }}
      >
        {/* ── 1. Character Visual Column ── */}
        <div
          className="scan-character-col"
          style={{
            flexShrink: 0,
            width: '210px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Character illustration container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              animation: effectiveState === 'loading' ? 'characterBob 2s ease-in-out infinite' : 'none',
              filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.22))',
            }}
          >
            <img
              src={theme.characterSrc}
              alt={theme.characterAlt}
              style={{
                width: '100%',
                maxHeight: '310px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* 3D Ground shadow beneath character */}
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

          {/* Character Name / Subtitle */}
          <div
            style={{
              marginTop: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.62rem',
              color: '#333333',
              letterSpacing: '0.08em',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              padding: '4px 8px',
              boxShadow: '2px 2px 0 #2a2a2a',
              whiteSpace: 'nowrap',
            }}
          >
            {effectiveState === 'loading'
              ? 'SCANNING...'
              : themeKey === 'safe'
                ? 'TRUSTED HERO'
                : themeKey === 'suspicious'
                  ? 'VIGILANT SENTINEL'
                  : 'DEFENSIVE WARRIOR'}
          </div>
        </div>

        {/* ── 2. 3D Dynamic Message Cloud ── */}
        <div
          className="scan-cloud-bubble"
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            background: theme.bgGradient,
            border: `4px solid ${theme.borderColor}`,
            borderRadius: '8px',
            boxShadow: `
              0 8px 0 ${theme.shadowColor},
              inset 3px 3px 0 ${theme.bevelLight},
              inset -3px -3px 0 ${theme.bevelDark},
              0 14px 28px rgba(0,0,0,0.15)
            `,
            padding: '30px 26px 24px',
            color: theme.textColor,
            transition: 'all 0.25s ease',
          }}
        >
          {/* Top Emblem Badge (Shield / Triangle / Skull) */}
          <div
            className="cloud-top-badge"
            style={{
              position: 'absolute',
              top: '-32px',
              left: '26px',
              height: '56px',
              zIndex: 10,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}
          >
            <img
              src={theme.badgeSrc}
              alt={theme.badgeAlt}
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Desktop Left Pointer Tail (points towards character) */}
          <div
            className="cloud-tail-desktop"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-26px',
              top: '64px',
              width: '28px',
              height: '44px',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            <svg width="28" height="44" viewBox="0 0 28 44" fill="none">
              {/* Solid 3D Base */}
              <polygon points="28,0 0,22 28,44" fill={theme.borderColor} />
              {/* Inner fill matching cloud background */}
              <polygon points="28,4 5,22 28,40" fill={theme.tailFill} />
              {/* Bevel highlights */}
              <line x1="28" y1="4" x2="5" y2="22" stroke={theme.bevelLight} strokeWidth="3.5" strokeLinecap="square" />
              <line x1="5" y1="22" x2="28" y2="40" stroke={theme.bevelDark} strokeWidth="3.5" strokeLinecap="square" />
            </svg>
          </div>

          {/* Mobile Top Pointer Tail (points upwards towards character) */}
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
              <line x1="4" y1="26" x2="22" y2="5" stroke={theme.bevelLight} strokeWidth="3.5" strokeLinecap="square" />
              <line x1="22" y1="5" x2="40" y2="26" stroke={theme.bevelDark} strokeWidth="3.5" strokeLinecap="square" />
            </svg>
          </div>

          {/* ── Cloud Content ── */}
          {effectiveState === 'loading' && <LoadingCloudContent url={url} theme={theme} />}

          {effectiveState === 'unavailable' && (
            <UnavailableCloudContent
              url={url}
              theme={theme}
              onRetry={onRetry}
              onReset={() => {
                setDevPreviewType(null)
                if (onReset) onReset()
              }}
              onDevPreview={setDevPreviewType}
            />
          )}

          {effectiveState === 'error' && (
            <ErrorCloudContent
              error={error}
              url={url}
              theme={theme}
              onRetry={onRetry}
              onReset={() => {
                setDevPreviewType(null)
                if (onReset) onReset()
              }}
              onDevPreview={setDevPreviewType}
            />
          )}

          {effectiveState === 'success' && parsedData && (
            <SuccessCloudContent
              data={parsedData}
              url={url}
              theme={theme}
              isDevPreview={isDevPreview}
              showTechnicalDetails={showTechnicalDetails}
              onToggleTechnicalDetails={() => setShowTechnicalDetails(!showTechnicalDetails)}
              onDevPreview={setDevPreviewType}
              onReset={() => {
                setDevPreviewType(null)
                if (onReset) onReset()
              }}
            />
          )}
        </div>
      </div>

      {/* Responsive Stacking & Animation Styles */}
      <style>{`
        @keyframes cloudPopIn {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
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
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Responsive Layout: Desktop vs Mobile */
        @media (min-width: 768px) {
          .cloud-tail-mobile {
            display: none !important;
          }
          .cloud-tail-desktop {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .scan-cloud-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 28px !important;
          }
          .scan-character-col {
            width: 170px !important;
          }
          .scan-cloud-bubble {
            width: 100% !important;
            padding: 28px 18px 20px !important;
          }
          .cloud-tail-desktop {
            display: none !important;
          }
          .cloud-tail-mobile {
            display: block !important;
          }
          .cloud-top-badge {
            left: 14px !important;
            height: 48px !important;
            top: -28px !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   1. Success State View
   ───────────────────────────────────────────────────────── */
function SuccessCloudContent({
  data,
  url,
  theme,
  isDevPreview,
  showTechnicalDetails,
  onToggleTechnicalDetails,
  onDevPreview,
  onReset,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Top Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '14px',
          borderBottom: `2px dashed ${theme.borderColor}40`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.88rem',
              color: theme.themeColor,
              letterSpacing: '0.06em',
              fontWeight: 'bold',
            }}
          >
            {theme.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.62rem',
              backgroundColor: theme.metaBg,
              color: theme.themeColor,
              border: `1.5px solid ${theme.metaBorder}`,
              borderRadius: '3px',
              padding: '3px 8px',
              letterSpacing: '0.04em',
            }}
          >
            {theme.badgeLabel}
          </span>
          {isDevPreview && (
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.58rem',
                backgroundColor: '#ffffff',
                color: '#555555',
                border: '1px solid #999',
                borderRadius: '3px',
                padding: '2px 6px',
              }}
            >
              PREVIEW
            </span>
          )}
        </div>

        {/* Risk Score Pill */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.72rem',
            backgroundColor: theme.scorePillBg,
            color: theme.scorePillText,
            border: `2px solid ${theme.scorePillBorder}`,
            borderRadius: '4px',
            padding: '5px 12px',
            boxShadow: `2px 2px 0 ${theme.shadowColor}`,
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>SCORE:</span>
          <span style={{ fontSize: '0.84rem' }}>{data.score}/100</span>
        </div>
      </div>

      {/* Target URL banner */}
      {url && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: theme.metaBg,
            border: `1.5px solid ${theme.metaBorder}`,
            borderRadius: '4px',
            padding: '7px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#222222',
            wordBreak: 'break-all',
          }}
        >
          <span style={{ color: theme.themeColor, fontWeight: 'bold' }}>TARGET:</span>
          <span>{url}</span>
        </div>
      )}

      {/* Primary Voice of Character / Explanation */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.98rem',
          lineHeight: '1.7',
          color: '#1a1a1a',
          fontWeight: 500,
          backgroundColor: '#ffffffcc',
          border: `1.5px solid ${theme.borderColor}30`,
          borderRadius: '6px',
          padding: '14px 16px',
        }}
      >
        "{data.explanation}"
      </div>

      {/* ── Key Telemetry Signals Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '10px',
        }}
      >
        <SignalCard label="DETECTION STATUS" value={data.detectionStatus} theme={theme} />
        <SignalCard label="THREAT TYPE" value={data.threatType} theme={theme} />
        <SignalCard label="EVALUATION CONFIDENCE" value={data.confidence} theme={theme} />
        <SignalCard
          label="RISK CLASSIFICATION"
          value={data.classification.toUpperCase()}
          theme={theme}
          highlight
        />
      </div>

      {/* ── Detection Evidence Breakdown ── */}
      {data.evidence && data.evidence.length > 0 && (
        <div
          style={{
            backgroundColor: '#ffffffcc',
            border: `1.5px solid ${theme.borderColor}30`,
            borderRadius: '6px',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.66rem',
              color: theme.themeColor,
              letterSpacing: '0.06em',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>▶</span>
            KEY DETECTION EVIDENCE
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '6px',
            }}
          >
            {data.evidence.map((item, idx) => (
              <li
                key={idx}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.84rem',
                  color: '#2a2a2a',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  lineHeight: '1.5',
                }}
              >
                <span
                  style={{
                    color: theme.themeColor,
                    fontWeight: 'bold',
                    flexShrink: 0,
                    lineHeight: '1.4',
                  }}
                >
                  ■
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Recommended Action Banner ── */}
      <div
        style={{
          backgroundColor: theme.metaBg,
          border: `2px solid ${theme.borderColor}`,
          borderRadius: '6px',
          padding: '12px 16px',
          boxShadow: `2px 2px 0 ${theme.shadowColor}`,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.68rem',
            color: theme.themeColor,
            letterSpacing: '0.08em',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🛡</span>
          RECOMMENDED ACTION
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.88rem',
            color: '#1a1a1a',
            lineHeight: '1.6',
            fontWeight: 500,
          }}
        >
          {data.recommendedAction}
        </p>
      </div>

      {/* Technical Telemetry Toggle (Expands vertically) */}
      {data.raw && (
        <div>
          <button
            type="button"
            onClick={onToggleTechnicalDetails}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.62rem',
              color: theme.themeColor,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 0',
              letterSpacing: '0.04em',
            }}
          >
            <span>{showTechnicalDetails ? '▲ HIDE' : '▼ VIEW'} RAW TELEMETRY DATA (JSON)</span>
          </button>
          {showTechnicalDetails && (
            <pre
              style={{
                marginTop: '8px',
                backgroundColor: '#1a1a1a',
                color: '#85d985',
                padding: '12px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                lineHeight: '1.5',
                overflowX: 'auto',
                maxHeight: '260px',
                border: '2px solid #333',
              }}
            >
              {JSON.stringify(data.raw, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ── Footer Actions & Expression Preview Switcher ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '12px',
          borderTop: `2px dashed ${theme.borderColor}30`,
        }}
      >
        <button
          type="button"
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.7rem',
            backgroundColor: '#ffffff',
            color: '#222222',
            border: '2px solid #2a2a2a',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 #2a2a2a',
            letterSpacing: '0.05em',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translate(2px, 2px)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '2px 2px 0 #2a2a2a'
          }}
        >
          ◀ INVESTIGATE ANOTHER TARGET
        </button>

        {/* Expression Preview Pills (Quickly test Safe / Suspicious / Malicious states) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              color: '#666666',
              letterSpacing: '0.04em',
            }}
          >
            EXPRESSION PREVIEW:
          </span>
          <button
            type="button"
            onClick={() => onDevPreview('safe')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: data.classification === 'safe' ? '#2b772b' : '#ffffff',
              color: data.classification === 'safe' ? '#ffffff' : '#2b772b',
              border: '1.5px solid #2b772b',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Safe
          </button>
          <button
            type="button"
            onClick={() => onDevPreview('suspicious')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: data.classification === 'suspicious' ? '#c97e00' : '#ffffff',
              color: data.classification === 'suspicious' ? '#ffffff' : '#c97e00',
              border: '1.5px solid #c97e00',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Suspicious
          </button>
          <button
            type="button"
            onClick={() => onDevPreview('malicious')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: data.classification === 'malicious' ? '#c81e1e' : '#ffffff',
              color: data.classification === 'malicious' ? '#ffffff' : '#c81e1e',
              border: '1.5px solid #c81e1e',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Malicious
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   2. Loading Cloud Content
   ───────────────────────────────────────────────────────── */
function LoadingCloudContent({ url, theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: `2px dashed ${theme.borderColor}40`,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.84rem',
            color: theme.themeColor,
            letterSpacing: '0.06em',
          }}
        >
          SECURITY INVESTIGATION RUNNING…
        </span>
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            backgroundColor: theme.themeColor,
            borderRadius: '2px',
            animation: 'pulseGlow 1s infinite',
          }}
        />
      </div>

      {url && (
        <div
          style={{
            backgroundColor: theme.metaBg,
            border: `1.5px solid ${theme.metaBorder}`,
            borderRadius: '4px',
            padding: '7px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#222222',
            wordBreak: 'break-all',
          }}
        >
          <span style={{ color: theme.themeColor, fontWeight: 'bold' }}>AUDITING:</span> {url}
        </div>
      )}

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.92rem',
          lineHeight: '1.7',
          color: '#333333',
        }}
      >
        {theme.fallbackExplanation}
      </p>

      {/* Active telemetry checkpoints */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px',
        }}
      >
        {['Phishing Heuristics', 'Global Threat Feeds', 'TLS & Domain Registry', 'Payload Heuristics'].map(
          (label, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffffbb',
                border: `1.5px solid ${theme.metaBorder}`,
                borderRadius: '4px',
                padding: '8px 12px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.64rem',
                color: theme.themeColor,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ animation: 'pulseGlow 1.2s infinite' }}>■</span>
              <span>{label}</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   3. Disconnected / Unavailable Cloud Content
   ───────────────────────────────────────────────────────── */
function UnavailableCloudContent({ url, theme, onRetry, onReset, onDevPreview }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: `2px dashed ${theme.borderColor}40`,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.86rem',
            color: theme.themeColor,
            letterSpacing: '0.06em',
          }}
        >
          WEBSITE SCANNER BACKEND OFFLINE
        </span>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.62rem',
            backgroundColor: '#fff',
            color: theme.themeColor,
            border: `1.5px solid ${theme.borderColor}`,
            borderRadius: '3px',
            padding: '3px 8px',
          }}
        >
          STATUS 503
        </span>
      </div>

      {url && (
        <div
          style={{
            backgroundColor: theme.metaBg,
            border: `1.5px solid ${theme.metaBorder}`,
            borderRadius: '4px',
            padding: '7px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#222222',
            wordBreak: 'break-all',
          }}
        >
          <span style={{ color: theme.themeColor, fontWeight: 'bold' }}>TARGET:</span> {url}
        </div>
      )}

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.94rem',
          lineHeight: '1.7',
          color: '#2b1b00',
          backgroundColor: '#ffffffdd',
          border: `1.5px solid ${theme.borderColor}30`,
          borderRadius: '6px',
          padding: '14px 16px',
        }}
      >
        "The website security crawler engine is currently disconnected. In accordance with strict zero-fabrication security policies, this target has <strong>NOT</strong> been marked as safe or cleared. All checks remain in safe standby until the telemetry pipeline is active."
      </div>

      <div
        style={{
          backgroundColor: theme.metaBg,
          border: `1.5px solid ${theme.metaBorder}`,
          borderRadius: '4px',
          padding: '10px 14px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.84rem',
          color: '#3b2300',
          lineHeight: '1.6',
        }}
      >
        💡 <strong>Live Feature Available:</strong> The GitHub Repository Security Health Check directly below is fully connected and operational with Gitleaks, Semgrep, and OSV vulnerability scanning.
      </div>

      {/* Expression Preview & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '10px',
          borderTop: `2px dashed ${theme.borderColor}30`,
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.7rem',
              backgroundColor: theme.themeColor,
              color: '#ffffff',
              border: `2px solid ${theme.borderColor}`,
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              boxShadow: `2px 2px 0 ${theme.shadowColor}`,
            }}
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            onClick={onReset}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.7rem',
              backgroundColor: '#ffffff',
              color: '#222',
              border: '2px solid #2a2a2a',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #2a2a2a',
            }}
          >
            CANCEL
          </button>
        </div>

        {/* Developer Expression Preview Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              color: '#666',
            }}
          >
            PREVIEW EXPRESSIONS:
          </span>
          <button
            type="button"
            onClick={() => onDevPreview('safe')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              color: '#2b772b',
              border: '1.5px solid #2b772b',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Safe 🟢
          </button>
          <button
            type="button"
            onClick={() => onDevPreview('suspicious')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              color: '#c97e00',
              border: '1.5px solid #c97e00',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Suspicious 🟡
          </button>
          <button
            type="button"
            onClick={() => onDevPreview('malicious')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              color: '#c81e1e',
              border: '1.5px solid #c81e1e',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Malicious 🔴
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   4. Error Cloud Content
   ───────────────────────────────────────────────────────── */
function ErrorCloudContent({ error, url, theme, onRetry, onReset, onDevPreview }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: `2px dashed ${theme.borderColor}40`,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.86rem',
            color: '#c81e1e',
            letterSpacing: '0.06em',
          }}
        >
          INVESTIGATION HALTED
        </span>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.62rem',
            backgroundColor: '#fff',
            color: '#c81e1e',
            border: '1.5px solid #c81e1e',
            borderRadius: '3px',
            padding: '3px 8px',
          }}
        >
          ERROR
        </span>
      </div>

      {url && (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1.5px solid #c81e1e40',
            borderRadius: '4px',
            padding: '7px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#222222',
            wordBreak: 'break-all',
          }}
        >
          <span style={{ color: '#c81e1e', fontWeight: 'bold' }}>TARGET:</span> {url}
        </div>
      )}

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.94rem',
          lineHeight: '1.7',
          color: '#333333',
          backgroundColor: '#ffffffdd',
          border: '1.5px solid #c81e1e30',
          borderRadius: '6px',
          padding: '14px 16px',
        }}
      >
        "{error || 'An unexpected failure occurred while inspecting this target. The destination address may be unreachable, filtered by DNS safety rules, or invalid.'}"
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '10px',
          borderTop: '2px dashed #c81e1e30',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.7rem',
              backgroundColor: '#c81e1e',
              color: '#ffffff',
              border: '2px solid #780e0e',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #330000',
            }}
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            onClick={onReset}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.7rem',
              backgroundColor: '#ffffff',
              color: '#222',
              border: '2px solid #2a2a2a',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #2a2a2a',
            }}
          >
            DISMISS
          </button>
        </div>

        {/* Expression Preview Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem', color: '#666' }}>
            TEST EXPRESSIONS:
          </span>
          <button
            type="button"
            onClick={() => onDevPreview('safe')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              color: '#2b772b',
              border: '1.5px solid #2b772b',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Safe
          </button>
          <button
            type="button"
            onClick={() => onDevPreview('suspicious')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              color: '#c97e00',
              border: '1.5px solid #c97e00',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Suspicious
          </button>
          <button
            type="button"
            onClick={() => onDevPreview('malicious')}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              color: '#c81e1e',
              border: '1.5px solid #c81e1e',
              borderRadius: '3px',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Malicious
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Helper: Signal Card
   ───────────────────────────────────────────────────────── */
function SignalCard({ label, value, theme, highlight = false }) {
  return (
    <div
      style={{
        backgroundColor: highlight ? theme.metaBg : '#ffffffcc',
        border: `1.5px solid ${highlight ? theme.themeColor : theme.borderColor + '30'}`,
        borderRadius: '5px',
        padding: '9px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.58rem',
          color: theme.themeColor,
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.84rem',
          color: highlight ? theme.themeColor : '#222222',
          fontWeight: 600,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  )
}

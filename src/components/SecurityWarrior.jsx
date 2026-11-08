import { useMemo } from 'react'

/**
 * SecurityWarrior — TRUSTLENS Reusable Three-State Warrior Reaction Component
 *
 * Status Mapping:
 * - green: warrior-happy.png (healthy, confident, cheerful)
 * - yellow: warrior-thinking.png (warning, uncertain, thinking with STOP hand)
 * - red: warrior-defensive.png (critical risk, defensive shield & diamond sword)
 * - idle: warrior-thinking.png (neutral standing posture)
 * - loading: warrior-thinking.png with scanning pulse effect
 * - unavailable: warrior-thinking.png with offline badge
 */

const STATUS_CONFIG = {
  green: {
    src: '/assets/warrior-happy.png',
    alt: 'Happy Warrior — All Security Checks Clear',
    label: 'HEALTHY & SECURE',
    themeColor: '#3a7a3a',
    glowColor: 'rgba(58, 122, 58, 0.22)',
    indicatorIcon: '✔',
    subtext: 'Optimal security posture verified',
  },
  yellow: {
    src: '/assets/warrior-thinking.png',
    alt: 'Thinking Warrior — Security Warnings Identified',
    label: 'ATTENTION NEEDED',
    themeColor: '#c8952a',
    glowColor: 'rgba(200, 149, 42, 0.22)',
    indicatorIcon: '✋',
    subtext: 'Inconclusive signals or moderate findings',
  },
  red: {
    src: '/assets/warrior-defensive.png',
    alt: 'Defensive Warrior — Critical Security Vulnerability Detected',
    label: 'CRITICAL THREAT',
    themeColor: '#cc2222',
    glowColor: 'rgba(204, 34, 34, 0.25)',
    indicatorIcon: '⚔',
    subtext: 'High-severity exposure or confirmed leaks',
  },
  idle: {
    src: '/assets/warrior-thinking.png',
    alt: 'Guardian Warrior — Awaiting Target',
    label: 'STANDBY',
    themeColor: '#555555',
    glowColor: 'rgba(0, 0, 0, 0.08)',
    indicatorIcon: '🛡',
    subtext: 'Awaiting inspection target',
  },
  loading: {
    src: '/assets/warrior-thinking.png',
    alt: 'Guardian Warrior — Actively Scanning Target',
    label: 'SCANNING TARGET...',
    themeColor: '#3a7a3a',
    glowColor: 'rgba(58, 122, 58, 0.3)',
    indicatorIcon: '⟳',
    subtext: 'Executing security telemetry engines',
  },
  unavailable: {
    src: '/assets/warrior-thinking.png',
    alt: 'Thinking Warrior — Security Service Offline',
    label: 'SERVICE OFFLINE',
    themeColor: '#8B6914',
    glowColor: 'rgba(139, 105, 20, 0.2)',
    indicatorIcon: '⚠',
    subtext: 'Security engine backend is disconnected',
  },
}

export default function SecurityWarrior({
  status = 'idle',
  size = 'md', // sm (160px) | md (240px) | lg (320px) | card (210px)
  showBadge = true,
  customLabel = null,
  style = {},
  className = '',
}) {
  const normalizedStatus = useMemo(() => {
    const s = String(status).toLowerCase()
    if (s === 'healthy' || s === 'safe' || s === 'green') return 'green'
    if (s === 'warning' || s === 'needs_attention' || s === 'yellow') return 'yellow'
    if (s === 'critical' || s === 'critical_risk' || s === 'high_risk' || s === 'red') return 'red'
    if (s === 'loading' || s === 'scanning') return 'loading'
    if (s === 'unavailable' || s === 'offline') return 'unavailable'
    return 'idle'
  }, [status])

  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.idle

  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          width: '150px',
          height: '150px',
          badgeFont: '0.58rem',
        }
      case 'lg':
        return {
          width: 'clamp(240px, 28vw, 320px)',
          height: 'clamp(240px, 28vw, 320px)',
          badgeFont: '0.7rem',
        }
      case 'card':
        return {
          width: 'clamp(170px, 20vw, 220px)',
          height: 'clamp(170px, 20vw, 220px)',
          badgeFont: '0.62rem',
        }
      case 'md':
      default:
        return {
          width: 'clamp(190px, 24vw, 250px)',
          height: 'clamp(190px, 24vw, 250px)',
          badgeFont: '0.65rem',
        }
    }
  }, [size])

  const isLoading = normalizedStatus === 'loading'

  return (
    <div
      className={`security-warrior-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        maxWidth: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* ── Background Aura / Pedestal ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizeStyles.width,
          height: sizeStyles.height,
          maxWidth: '100%',
        }}
      >
        {/* Subtle geometric ground shadow / pedestal */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            width: '68%',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.14)',
            filter: 'blur(3px)',
            transform: 'scaleY(0.4)',
            zIndex: 0,
          }}
        />

        {/* Ambient status aura ring */}
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            borderRadius: '50%',
            backgroundColor: config.glowColor,
            filter: 'blur(16px)',
            opacity: normalizedStatus === 'idle' ? 0.35 : 0.8,
            transition: 'background-color 0.4s ease, opacity 0.4s ease',
            zIndex: 0,
            animation: isLoading ? 'warriorScanPulse 1.8s ease-in-out infinite' : 'none',
          }}
        />

        {/* Scanning radar sweep for loading state */}
        {isLoading && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-6px',
              border: `2px dashed ${config.themeColor}`,
              borderRadius: '50%',
              opacity: 0.6,
              animation: 'warriorRadarSpin 6s linear infinite',
              zIndex: 1,
            }}
          />
        )}

        {/* ── Character Image ── */}
        <img
          key={config.src}
          src={config.src}
          alt={config.alt}
          loading="eager"
          decoding="async"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'auto',
            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.18))',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease',
            animation: isLoading ? 'warriorBreathing 2.4s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* ── Status Badge (Zero Overflow / Auto Wrap) ── */}
      {showBadge && (
        <div
          style={{
            marginTop: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '5px 10px',
            maxWidth: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            border: `2px solid ${config.themeColor}`,
            borderRadius: '3px',
            boxShadow: `2px 2px 0 ${config.themeColor}`,
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            zIndex: 3,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '13px',
              height: '13px',
              borderRadius: '2px',
              backgroundColor: config.themeColor,
              color: '#ffffff',
              fontSize: '0.58rem',
              fontWeight: 800,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {config.indicatorIcon}
          </span>

          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: sizeStyles.badgeFont,
              color: config.themeColor,
              letterSpacing: '0.04em',
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: 1.25,
            }}
          >
            {customLabel || config.label}
          </span>
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes warriorScanPulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }
        @keyframes warriorRadarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes warriorBreathing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

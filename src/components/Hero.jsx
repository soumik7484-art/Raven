import CyberHeroAnimation from './CyberHeroAnimation'

/**
 * Hero — HackMatrix
 *
 * Split layout:
 *   Left  — headline, description, CTAs, trust badges
 *   Right — animated Minecraft-inspired floating island scene
 *
 * The island floats, clouds drift, threat arrows approach and bounce off the
 * central pixel shield, then fade. All animation is CSS-driven (keyframes),
 * so it's zero-JS-runtime and GPU-composited.
 *
 * No opacity:0 initial states on text content — always readable.
 */
export default function Hero() {

  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-off-white)',
        borderBottom: '1px solid var(--color-border-light)',
      }}
    >
      {/* ── 1. Video background (bottom layer) ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <source src="/tutu.mp4" type="video/mp4" />
        <source src="/home_video1.mp4" type="video/mp4" />
        <source src="/homevideo1.mp4" type="video/mp4" />
        <source src="/homevideo.mp4" type="video/mp4" />
      </video>

      {/* ── 2. Subtle translucent white overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(250, 250, 247, 0.72)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <div
        id="hero-grid"
        className="section-container"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(2rem, 4vw, 5rem)',
          alignItems: 'center',
          paddingTop:    'clamp(4rem, 8vw, 6rem)',
          paddingBottom: 'clamp(4rem, 8vw, 6rem)',
        }}
      >
        {/* ── LEFT: Text content ── */}
        <div id="hero-text-col">
          {/* Category badge */}
          <div
            className="hero-badge-wrap"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-pale-green)',
              border: '1px solid var(--color-pale-green-dark)',
              borderRadius: '6px',
              padding: '5px 12px',
              marginBottom: '1.75rem',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '1px',
              backgroundColor: 'var(--color-forest)', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1rem',
              color: 'var(--color-forest-dark)',
              letterSpacing: '0.04em',
            }}>
              DIGITAL SECURITY INVESTIGATION
            </span>
          </div>

          {/* Main heading */}
          <h1
            id="hero-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.06,
              color: 'var(--color-charcoal)',
              marginBottom: '1.25rem',
            }}
          >
            Explore the Web.
            <br />
            <span style={{ color: 'var(--color-forest)' }}>Stay Protected.</span>
          </h1>

          {/* Description */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
            lineHeight: 1.75,
            color: 'var(--color-muted)',
            maxWidth: '480px',
            marginBottom: '2rem',
          }}>
            Investigate suspicious websites with intelligent phishing detection,
            threat intelligence, certificate validation, and website security
            assessment — all in one place.
          </p>

          {/* CTAs */}
          <div className="hero-cta-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '2rem' }}>
            <HeroPrimaryBtn />
            <HeroSecondaryBtn />
          </div>

          {/* Trust row */}
          <TrustRow />
        </div>

        {/* ── RIGHT: 3D Cybersecurity Animation ── */}
        <div
          id="hero-island-col"
          aria-hidden="true"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CyberHeroAnimation />
        </div>
      </div>

      {/* Responsive: stack cleanly on mobile & tablet while preserving animation */}
      <style>{`
        @media (max-width: 900px) {
          #hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            padding-top: clamp(2.5rem, 6vw, 4rem) !important;
            padding-bottom: clamp(2.5rem, 6vw, 4rem) !important;
          }
          #hero-text-col {
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          #hero-text-col p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-cta-group {
            justify-content: center !important;
          }
          .hero-trust-badges {
            justify-content: center !important;
          }
          #hero-island-col {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }
          #hero-island {
            display: block !important;
            width: 100% !important;
            max-width: min(100%, 460px) !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </section>
  )
}

/* ─────────────────────────────────────────────
   CTA Buttons
   ───────────────────────────────────────────── */
function HeroPrimaryBtn() {
  return (
    <a
      href="#scanner"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--color-forest)',
        color: '#fff',
        fontFamily: 'var(--font-display)',
        fontSize: '0.9375rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        padding: '13px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        border: '2px solid var(--color-forest-dark)',
        boxShadow: '0 4px 0 var(--color-forest-dark)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(2px)'
        e.currentTarget.style.boxShadow = '0 2px 0 var(--color-forest-dark)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 0 var(--color-forest-dark)'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L2 4V8.5C2 11.5 4.5 14 8 15C11.5 14 14 11.5 14 8.5V4L8 1.5Z"
          fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M5.5 8L7 9.5L11 6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Investigate a Website
    </a>
  )
}

function HeroSecondaryBtn() {
  return (
    <a
      href="#how-it-works"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'transparent',
        color: 'var(--color-charcoal-soft)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.9375rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        padding: '13px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        border: '2px solid var(--color-border-strong)',
        boxShadow: '0 4px 0 var(--color-border-strong)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(2px)'
        e.currentTarget.style.boxShadow = '0 2px 0 var(--color-border-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 0 var(--color-border-strong)'
      }}
    >
      How It Works
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

/* ─────────────────────────────────────────────
   Trust badges row
   ───────────────────────────────────────────── */
function TrustRow() {
  const badges = [
    'Phishing Detection',
    'Threat Intelligence',
    'TLS Validation',
    'Risk Scoring',
  ]
  return (
    <div className="hero-trust-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {badges.map((b) => (
        <span
          key={b}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--color-forest-dark)',
            backgroundColor: 'var(--color-pale-green)',
            border: '1px solid var(--color-pale-green-dark)',
            borderRadius: '4px',
            padding: '3px 9px',
            letterSpacing: '0.03em',
          }}
        >
          {b}
        </span>
      ))}
    </div>
  )
}

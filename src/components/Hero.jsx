import { useState, useEffect } from 'react'

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
  const [arrowCycle, setArrowCycle] = useState(0)

  // Cycle arrows every 4 seconds
  useEffect(() => {
    const id = setInterval(() => setArrowCycle((c) => (c + 1) % 4), 4000)
    return () => clearInterval(id)
  }, [])

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
        <source src="/homevideo.mp4" type="video/mp4" />
        <source src="/Home Video.mp4" type="video/mp4" />
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

        {/* ── RIGHT: Animated island ── */}
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
          <IslandScene arrowCycle={arrowCycle} />
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

/* ─────────────────────────────────────────────
   Minecraft-inspired animated island scene
   ───────────────────────────────────────────── */
function IslandScene({ arrowCycle }) {
  const arrowTypes = [
    { color: '#C0392B', label: 'Phishing',    dy: -20 },
    { color: '#884EA0', label: 'Malware',     dy: 10  },
    { color: '#E67E22', label: 'Redirect',    dy: 30  },
    { color: '#1A5E39', label: 'Susp. Link',  dy: -5  },
  ]
  const activeArrow = arrowTypes[arrowCycle % arrowTypes.length]

  return (
    <div
      id="hero-island"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        aspectRatio: '1 / 0.88',
      }}
    >
      {/* Island SVG — gently floating */}
      <div style={{ animation: 'float 5s ease-in-out infinite', willChange: 'transform' }}>
        <svg
          viewBox="0 0 480 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          role="img"
          aria-label="Floating island with a shield protecting it from cyber threats"
        >
          {/* ── Clouds (drifting) ── */}
          <Cloud x={30}  y={40}  w={80}  style={{ animation: 'cloud-drift 8s ease-in-out infinite alternate' }} />
          <Cloud x={340} y={20}  w={100} style={{ animation: 'cloud-drift 11s ease-in-out infinite alternate-reverse' }} />
          <Cloud x={130} y={15}  w={60}  style={{ animation: 'cloud-drift 9s ease-in-out infinite alternate' }} />

          {/* ── Floating debris blocks ── */}
          <FloatBlock x={390} y={130} size={16} color="#C8BFB0"
            style={{ animation: 'float-slow 6s ease-in-out infinite' }} />
          <FloatBlock x={60}  y={160} size={12} color="#A5BD91"
            style={{ animation: 'float-slow 7s ease-in-out infinite 1.5s' }} />
          <FloatBlock x={420} y={220} size={10} color="#E8B84B"
            style={{ animation: 'float-slow 5s ease-in-out infinite 0.8s' }} />

          {/* ── Island base — stone layers ── */}
          {/* Bottom stone layer (darkest) */}
          <BlockRow y={310} x={100} count={14} w={20} h={14} color="#A89F92" shade="#8A8278" />
          {/* Mid stone layer */}
          <BlockRow y={296} x={90}  count={15} w={20} h={14} color="#B8B0A4" shade="#9A9088" />
          {/* Top stone layer */}
          <BlockRow y={282} x={84}  count={16} w={20} h={14} color="#C8C0B4" shade="#AAA098" />
          {/* Dirt layer */}
          <BlockRow y={268} x={82}  count={16} w={20} h={14} color="#8B5E3C" shade="#6B4428" />
          {/* Grass layer (top) */}
          <BlockRow y={254} x={80}  count={17} w={20} h={14} color="#527A50" shade="#3F6040" />

          {/* ── Structures on island ── */}
          {/* Small house left */}
          <House x={104} y={208} />
          {/* Trees */}
          <Tree x={152} y={220} />
          <Tree x={308} y={218} />
          <Tree x={330} y={228} h={18} />
          {/* Stone path */}
          <BlockRow y={254} x={180} count={6} w={20} h={14} color="#C8BFB0" shade="#A8A098" />

          {/* ── Developer character ── */}
          <Developer x={220} y={210} />

          {/* ── Central shield ── */}
          <PixelShield x={240} y={100} />

          {/* ── Guardian character ── */}
          <Guardian x={300} y={216} />

          {/* ── Threat arrow ── */}
          <ThreatArrow
            key={arrowCycle}
            color={activeArrow.color}
            label={activeArrow.label}
            dy={activeArrow.dy}
          />

          {/* ── Sparkle particles ── */}
          <Sparkle x={260} y={110} delay={0}   />
          <Sparkle x={210} y={125} delay={0.6} />
          <Sparkle x={280} y={130} delay={1.2} />
        </svg>
      </div>

      {/* Floating label cards */}
      <FloatingCard
        label="Shield Active"
        color="var(--color-forest)"
        style={{ position: 'absolute', top: '6%', right: '4%' }}
      />
      <FloatingCard
        label={`⚠ ${activeArrow.label}`}
        color={activeArrow.color}
        style={{ position: 'absolute', top: '30%', left: '0%' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   SVG sub-components
   ───────────────────────────────────────────── */

function Cloud({ x, y, w, style }) {
  const h = Math.round(w * 0.38)
  return (
    <g style={style}>
      <rect x={x}               y={y + h * 0.4} width={w}         height={h * 0.6} rx="3" fill="white" opacity="0.88" />
      <rect x={x + w * 0.15}    y={y}           width={w * 0.5}   height={h * 0.7} rx="4" fill="white" opacity="0.88" />
      <rect x={x + w * 0.5}     y={y + h * 0.2} width={w * 0.35}  height={h * 0.5} rx="3" fill="white" opacity="0.88" />
    </g>
  )
}

function FloatBlock({ x, y, size, color, style }) {
  return (
    <g style={style}>
      <rect x={x} y={y} width={size} height={size} fill={color} />
      <rect x={x} y={y} width={size} height={4}    fill="rgba(255,255,255,0.3)" />
      <rect x={x} y={y} width={4}    height={size} fill="rgba(255,255,255,0.2)" />
      <rect x={x + size - 2} y={y}   width={2}     height={size} fill="rgba(0,0,0,0.15)" />
      <rect x={x} y={y + size - 2}   width={size}  height={2}    fill="rgba(0,0,0,0.18)" />
    </g>
  )
}

function BlockRow({ y, x, count, w, h, color, shade }) {
  const blocks = []
  for (let i = 0; i < count; i++) {
    const bx = x + i * w
    blocks.push(
      <g key={i}>
        <rect x={bx} y={y} width={w} height={h} fill={color} />
        <rect x={bx} y={y} width={w} height={3}   fill="rgba(255,255,255,0.22)" />
        <rect x={bx} y={y} width={1} height={h}   fill="rgba(255,255,255,0.12)" />
        <rect x={bx + w - 1} y={y} width={1} height={h} fill="rgba(0,0,0,0.18)" />
        <rect x={bx} y={y + h - 2}  width={w} height={2} fill={shade} />
      </g>
    )
  }
  return <g>{blocks}</g>
}

function House({ x, y }) {
  return (
    <g>
      {/* Walls */}
      <rect x={x}      y={y + 20} width={36} height={28} fill="#C8A87A" />
      <rect x={x}      y={y + 20} width={36} height={4}  fill="rgba(255,255,255,0.2)" />
      {/* Roof */}
      <polygon points={`${x},${y + 20} ${x + 18},${y} ${x + 36},${y + 20}`} fill="#8B4513" />
      <polygon points={`${x},${y + 20} ${x + 18},${y} ${x + 36},${y + 20}`}
        fill="rgba(255,255,255,0.1)" />
      {/* Door */}
      <rect x={x + 13} y={y + 34} width={10} height={14} rx="1" fill="#5C3317" />
      <rect x={x + 15} y={y + 36} width={2}  height={3}  fill="rgba(255,200,100,0.6)" />
      {/* Window */}
      <rect x={x + 4}  y={y + 25} width={10} height={8} fill="#A8D8F0" />
      <rect x={x + 22} y={y + 25} width={10} height={8} fill="#A8D8F0" />
      {/* Window cross */}
      <line x1={x + 9}  y1={y + 25} x2={x + 9}  y2={y + 33} stroke="#5C3317" strokeWidth="1" />
      <line x1={x + 4}  y1={y + 29} x2={x + 14} y2={y + 29} stroke="#5C3317" strokeWidth="1" />
    </g>
  )
}

function Tree({ x, y, h = 22 }) {
  return (
    <g>
      {/* Trunk */}
      <rect x={x + 4} y={y + h} width={6} height={10} fill="#6B3A1F" />
      {/* Canopy layers */}
      <rect x={x}     y={y + 10} width={14} height={h - 8}  fill="#3A7A38" />
      <rect x={x + 2} y={y + 4}  width={10} height={h - 12} fill="#4A8A48" />
      <rect x={x + 4} y={y}      width={6}  height={8}       fill="#5A9A58" />
      {/* Highlights */}
      <rect x={x}     y={y + 10} width={14} height={2} fill="rgba(255,255,255,0.12)" />
    </g>
  )
}

function Developer({ x, y }) {
  // Simple 8-bit style developer character
  return (
    <g>
      {/* Head */}
      <rect x={x}     y={y}      width={14} height={14} fill="#F5CBA7" />
      <rect x={x + 2} y={y + 2}  width={4}  height={4}  fill="#2C2416" />
      <rect x={x + 8} y={y + 2}  width={4}  height={4}  fill="#2C2416" />
      {/* Hair */}
      <rect x={x}     y={y}      width={14} height={4}  fill="#5C3317" />
      {/* Body */}
      <rect x={x - 2} y={y + 14} width={18} height={14} fill="#1A6B3A" />
      {/* Arms */}
      <rect x={x - 6} y={y + 14} width={4}  height={10} fill="#F5CBA7" />
      <rect x={x + 16} y={y + 14} width={4}  height={10} fill="#F5CBA7" />
      {/* Laptop */}
      <rect x={x + 16} y={y + 20} width={18} height={12} rx="1" fill="#2C2416" />
      <rect x={x + 17} y={y + 21} width={16} height={9}  fill="#1A8A5A" />
      <rect x={x + 17} y={y + 21} width={16} height={2}  fill="rgba(255,255,255,0.1)" />
      {/* Legs */}
      <rect x={x}      y={y + 28} width={6} height={8} fill="#2C3E50" />
      <rect x={x + 8}  y={y + 28} width={6} height={8} fill="#2C3E50" />
    </g>
  )
}

function Guardian({ x, y }) {
  return (
    <g>
      {/* Helmet */}
      <rect x={x}     y={y}      width={16} height={16} fill="#7F8C8D" />
      <rect x={x}     y={y}      width={16} height={5}  fill="#95A5A6" />
      <rect x={x + 4} y={y + 6}  width={8}  height={5}  fill="#1A6B3A" />
      {/* Body — armor */}
      <rect x={x - 3} y={y + 16} width={22} height={16} fill="#85929E" />
      <rect x={x - 3} y={y + 16} width={22} height={3}  fill="rgba(255,255,255,0.18)" />
      {/* Shield arm */}
      <rect x={x - 10} y={y + 16} width={8} height={14} fill="#7F8C8D" />
      <rect x={x - 14} y={y + 14} width={10} height={16} rx="1" fill="#527A50" />
      <rect x={x - 12} y={y + 16} width={6}  height={2}  fill="rgba(255,255,255,0.3)" />
      {/* Sword arm */}
      <rect x={x + 19} y={y + 16} width={4}  height={10} fill="#7F8C8D" />
      <rect x={x + 20} y={y + 6}  width={2}  height={16} fill="#BDC3C7" />
      {/* Legs */}
      <rect x={x}      y={y + 32} width={7} height={10} fill="#7F8C8D" />
      <rect x={x + 9}  y={y + 32} width={7} height={10} fill="#7F8C8D" />
    </g>
  )
}

function PixelShield({ x, y }) {
  // Shield pulses gold when an arrow hits
  return (
    <g
      style={{
        animation: 'shield-pulse 4s ease-in-out infinite',
        transformOrigin: `${x + 30}px ${y + 32}px`,
      }}
    >
      {/* Shield base — pixel art */}
      {/* Column 1 */}
      <Px x={x + 10} y={y + 4}  c="#527A50" />
      <Px x={x + 10} y={y + 10} c="#527A50" />
      <Px x={x + 10} y={y + 16} c="#3F6040" />
      <Px x={x + 10} y={y + 22} c="#3F6040" />
      <Px x={x + 10} y={y + 28} c="#3F6040" />
      {/* Column 2 */}
      <Px x={x + 16} y={y}      c="#5A8A58" />
      <Px x={x + 16} y={y + 6}  c="#E8B84B" />
      <Px x={x + 16} y={y + 12} c="#527A50" />
      <Px x={x + 16} y={y + 18} c="#527A50" />
      <Px x={x + 16} y={y + 24} c="#3F6040" />
      <Px x={x + 16} y={y + 30} c="#3F6040" />
      <Px x={x + 16} y={y + 36} c="#527A50" />
      {/* Column 3 (centre) */}
      <Px x={x + 22} y={y}      c="#5A8A58" />
      <Px x={x + 22} y={y + 6}  c="#E8B84B" />
      <Px x={x + 22} y={y + 12} c="#E8B84B" />
      <Px x={x + 22} y={y + 18} c="#E8B84B" />
      <Px x={x + 22} y={y + 24} c="#527A50" />
      <Px x={x + 22} y={y + 30} c="#3F6040" />
      <Px x={x + 22} y={y + 36} c="#527A50" />
      <Px x={x + 22} y={y + 42} c="#3F6040" />
      {/* Column 4 */}
      <Px x={x + 28} y={y}      c="#5A8A58" />
      <Px x={x + 28} y={y + 6}  c="#E8B84B" />
      <Px x={x + 28} y={y + 12} c="#527A50" />
      <Px x={x + 28} y={y + 18} c="#527A50" />
      <Px x={x + 28} y={y + 24} c="#3F6040" />
      <Px x={x + 28} y={y + 30} c="#3F6040" />
      <Px x={x + 28} y={y + 36} c="#527A50" />
      {/* Column 5 */}
      <Px x={x + 34} y={y + 4}  c="#527A50" />
      <Px x={x + 34} y={y + 10} c="#527A50" />
      <Px x={x + 34} y={y + 16} c="#3F6040" />
      <Px x={x + 34} y={y + 22} c="#3F6040" />
      <Px x={x + 34} y={y + 28} c="#3F6040" />
      {/* Highlight row */}
      <Px x={x + 16} y={y}      c="rgba(255,255,255,0.4)" />
      <Px x={x + 22} y={y}      c="rgba(255,255,255,0.4)" />
      <Px x={x + 28} y={y}      c="rgba(255,255,255,0.4)" />
    </g>
  )
}

// Single pixel helper
function Px({ x, y, c }) {
  return <rect x={x} y={y} width={6} height={6} fill={c} />
}

function ThreatArrow({ color, label, dy }) {
  return (
    <g
      key={label}
      style={{
        animation: 'arrow-fly 3.8s ease-in-out forwards',
        transformOrigin: '380px 190px',
      }}
      transform={`translate(0, ${dy})`}
    >
      {/* Arrow shaft */}
      <rect x={310} y={188} width={60} height={4} fill={color} rx="1" />
      {/* Arrowhead */}
      <polygon points="370,183 382,190 370,197" fill={color} />
      {/* Pixel label */}
      <rect x={310} y={175} width={58} height={14} rx="2" fill={color} opacity="0.9" />
      <text
        x={339} y={185}
        fontFamily="'VT323', monospace"
        fontSize="11"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label.toUpperCase()}
      </text>
    </g>
  )
}

function Sparkle({ x, y, delay }) {
  return (
    <g style={{ animation: `sparkle 2s ease-in-out infinite ${delay}s` }}>
      <rect x={x - 1} y={y - 3} width={2} height={6} fill="var(--color-gold-light)" />
      <rect x={x - 3} y={y - 1} width={6} height={2} fill="var(--color-gold-light)" />
    </g>
  )
}

/* ─────────────────────────────────────────────
   Floating UI card overlay
   ───────────────────────────────────────────── */
function FloatingCard({ label, color, style }) {
  return (
    <div
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(255,255,255,0.92)',
        border: '1.5px solid var(--color-border)',
        borderRadius: '8px',
        padding: '6px 12px',
        boxShadow: '0 2px 12px rgba(44,36,22,0.10)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={{
        width: '8px', height: '8px',
        borderRadius: '2px',
        backgroundColor: color,
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.875rem',
        color: 'var(--color-charcoal)',
        letterSpacing: '0.02em',
      }}>
        {label}
      </span>
    </div>
  )
}

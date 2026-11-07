import { useState } from 'react'

/**
 * Header — HackMatrix
 *
 * Sticky frosted-glass nav with:
 *   Left:   Pixel-art logomark + wordmark
 *   Centre: 9-link navigation (desktop)
 *   Right:  "Check a Website" CTA
 *   Mobile: Hamburger menu with full-screen drawer
 */

const NAV_LINKS = [
  { label: 'Home',             href: '#home' },
  { label: 'How It Works',     href: '#how-it-works' },
  { label: 'Scanner',          href: '#scanner' },
  { label: 'Threat Intel',     href: '#threat-intel' },
  { label: 'Digital Trust',    href: '#digital-trust' },
  { label: 'Assessment',       href: '#assessment' },
  { label: 'Technology',       href: '#technology' },
  { label: 'Reports',          href: '#reports' },
  { label: 'About',            href: '#about' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header
        id="home"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(250,250,247,0.90)',
          backdropFilter:       'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--color-border-light)',
          boxShadow: '0 1px 0 rgba(44,36,22,0.04)',
        }}
      >
        <div
          className="section-container"
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* ── Logo ── */}
          <a
            href="/"
            aria-label="HackMatrix home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <PixelLogoMark />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.0625rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-charcoal)',
                lineHeight: 1,
              }}
            >
              Hack
              <span style={{ color: 'var(--color-forest)' }}>Matrix</span>
            </span>
          </a>

          {/* ── Desktop nav ── */}
          <nav
            aria-label="Main navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              flex: 1,
              justifyContent: 'center',
            }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* ── Right: CTA + hamburger ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <a
              href="#scanner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-forest)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                padding: '9px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '2px solid var(--color-forest-dark)',
                boxShadow: '0 3px 0 var(--color-forest-dark)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)'
                e.currentTarget.style.boxShadow = '0 1px 0 var(--color-forest-dark)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 3px 0 var(--color-forest-dark)'
              }}
            >
              <ShieldMiniIcon />
              Check a Website
            </a>

            {/* Hamburger (mobile only) */}
            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--color-charcoal)',
              }}
              className="show-mobile"
            >
              {open ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            backgroundColor: 'rgba(250,250,247,0.97)',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '80px',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingBottom: '2rem',
            overflowY: 'auto',
          }}
        >
          <nav aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--color-charcoal)',
                  textDecoration: 'none',
                  letterSpacing: '-0.02em',
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#scanner"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                marginTop: '1.5rem',
                backgroundColor: 'var(--color-forest)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '14px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center',
                border: '2px solid var(--color-forest-dark)',
                boxShadow: '0 4px 0 var(--color-forest-dark)',
              }}
            >
              Check a Website
            </a>
          </nav>
        </div>
      )}

      {/* ── Inline responsive helpers ── */}
      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 901px) {
          .show-mobile   { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}

/* ── Desktop nav link ── */
function NavLink({ href, label }) {
  return (
    <a
      href={href}
      style={{
        padding: '6px 10px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.84rem',
        fontWeight: 500,
        color: 'var(--color-muted)',
        textDecoration: 'none',
        borderRadius: '6px',
        transition: 'color 0.15s ease, background-color 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-charcoal)'
        e.currentTarget.style.backgroundColor = 'var(--color-stone-light)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-muted)'
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {label}
    </a>
  )
}

/* ── Pixel-art block logomark ── */
function PixelLogoMark() {
  return (
    <svg
      width="36" height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, imageRendering: 'pixelated' }}
    >
      {/* Stone base block */}
      <rect width="36" height="36" rx="6" fill="#527A50" />
      {/* Pixel grid overlay — top-left highlight */}
      <rect x="2" y="2" width="16" height="8" rx="1" fill="rgba(255,255,255,0.15)" />
      <rect x="20" y="4" width="14" height="6" rx="1" fill="rgba(255,255,255,0.08)" />
      {/* Shield pixels */}
      <rect x="11" y="8"  width="4" height="4" fill="white" opacity="0.9" />
      <rect x="15" y="8"  width="4" height="4" fill="white" opacity="0.9" />
      <rect x="19" y="8"  width="4" height="4" fill="white" opacity="0.9" />
      <rect x="9"  y="12" width="4" height="4" fill="white" opacity="0.9" />
      <rect x="13" y="12" width="8" height="4" fill="white" opacity="0.9" />
      <rect x="21" y="12" width="4" height="4" fill="white" opacity="0.9" />
      <rect x="11" y="16" width="4" height="4" fill="white" opacity="0.9" />
      <rect x="15" y="16" width="4" height="4" fill="white" opacity="0.9" />
      <rect x="19" y="16" width="4" height="4" fill="white" opacity="0.9" />
      <rect x="13" y="20" width="4" height="4" fill="white" opacity="0.7" />
      <rect x="17" y="20" width="4" height="4" fill="white" opacity="0.7" />
      <rect x="15" y="24" width="4" height="4" fill="white" opacity="0.5" />
      {/* Bottom shadow */}
      <rect x="0" y="30" width="36" height="6" rx="0" fill="rgba(0,0,0,0.18)" />
      <rect x="0" y="30" width="36" height="6" rx="0" fill="transparent"
        style={{ borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }} />
    </svg>
  )
}

function ShieldMiniIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.5L2 3.5V7.5C2 10 4.2 12.2 7 13C9.8 12.2 12 10 12 7.5V3.5L7 1.5Z"
        fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5 7.2L6.2 8.4L9.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

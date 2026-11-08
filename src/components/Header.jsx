import { useState } from 'react'

/**
 * Header — HackMatrix
 *
 * Sticky frosted-glass nav:
 *   Left:   Pixel-art logomark + wordmark (click to scroll to top)
 *   Centre: Responsive clean navigation (desktop)
 *   Right:  "Check a Website" CTA + mobile hamburger toggle
 *   Mobile: Fullscreen slide-down drawer with quick navigation links
 */

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Scanner',      href: '#scanner' },
  { label: 'Repo Scan',    href: '#repo-scanner' },
  { label: 'Threat Intel', href: '#threat-intel' },
  { label: 'About',        href: '#about' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  const scrollToHome = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      window.history.pushState(null, '', '#home')
    } catch {}
  }

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(250,250,247,0.95)',
          backdropFilter: 'blur(18px)',
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
            paddingLeft: 'clamp(1rem, 3vw, 2rem)',
            paddingRight: 'clamp(1rem, 3vw, 2rem)',
            boxSizing: 'border-box',
          }}
        >
          {/* ── Logo ── */}
          <a
            href="#home"
            onClick={scrollToHome}
            aria-label="HackMatrix home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <PixelLogoMark />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: 'var(--color-charcoal)',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              Hack<span style={{ color: 'var(--color-forest)' }}>Matrix</span>
            </span>
          </a>

          {/* ── Desktop Nav (Hidden below 1200px to guarantee ample spacing and zero collision) ── */}
          <nav
            aria-label="Main navigation"
            className="header-desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(3px, 0.5vw, 8px)',
              flex: 1,
              minWidth: 0,
              margin: '0 16px',
            }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* ── Right Actions: CTA + Hamburger ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
              marginLeft: '12px',
            }}
          >
            <a
              href="#scanner"
              className="header-cta-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-forest)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '9px 15px',
                borderRadius: '5px',
                textDecoration: 'none',
                border: '2px solid var(--color-forest-dark)',
                boxShadow: '0 3px 0 var(--color-forest-dark)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
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
              <span>Check a Website</span>
            </a>

            {/* Hamburger Button (shown below 1200px) */}
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="header-mobile-toggle"
              style={{
                background: '#ffffff',
                border: '2px solid #2a2a2a',
                borderRadius: '4px',
                boxShadow: '2px 2px 0 #2a2a2a',
                cursor: 'pointer',
                padding: '6px 8px',
                color: 'var(--color-charcoal)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(1px, 1px)'
                e.currentTarget.style.boxShadow = '1px 1px 0 #2a2a2a'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '2px 2px 0 #2a2a2a'
              }}
            >
              {open ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile & Tablet Drawer (Full Screen / Smooth Slide) ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            backgroundColor: 'rgba(250,250,247,0.98)',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '74px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingBottom: '2rem',
            overflowY: 'auto',
          }}
        >
          {/* Quick Header inside drawer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '2px solid var(--color-border-light)',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.72rem',
                color: 'var(--color-forest)',
                letterSpacing: '0.08em',
              }}
            >
              NAVIGATION DIRECTORY
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#888',
              }}
            >
              6 MODULES
            </span>
          </div>

          <nav aria-label="Mobile navigation" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  setOpen(false)
                  if (link.href === '#home') {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    try {
                      window.history.pushState(null, '', '#home')
                    } catch {}
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #2a2a2a',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0 #2a2a2a',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--color-charcoal)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  transition: 'transform 0.12s ease',
                }}
              >
                <span>{link.label}</span>
                <span style={{ color: 'var(--color-forest)', fontSize: '0.8rem' }}>▶</span>
              </a>
            ))}

            {/* Quick action buttons in drawer */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="#repo-scanner"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  color: '#111',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '13px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: '2px solid #2a2a2a',
                  boxShadow: '3px 3px 0 #2a2a2a',
                  letterSpacing: '0.04em',
                }}
              >
                <span>■ CHECK REPOSITORY</span>
              </a>

              <a
                href="#scanner"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-forest)',
                  color: '#fff',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '13px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: '2px solid #1f551f',
                  boxShadow: '3px 3px 0 #1f551f',
                  letterSpacing: '0.04em',
                }}
              >
                <span>▶ CHECK WEBSITE</span>
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* ── Precise Responsive Breakpoints ── */}
      <style>{`
        @media (max-width: 1200px) {
          .header-desktop-nav {
            display: none !important;
          }
          .header-mobile-toggle {
            display: flex !important;
          }
        }
        @media (min-width: 1201px) {
          .header-desktop-nav {
            display: flex !important;
          }
          .header-mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 540px) {
          .header-cta-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

/* ── Desktop Nav Link with Compact, Balanced Spacing ── */
function NavLink({ href, label }) {
  const handleClick = (e) => {
    if (href === '#home') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      try {
        window.history.pushState(null, '', '#home')
      } catch {}
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      style={{
        padding: '5px 8px',
        fontFamily: 'var(--font-pixel)',
        fontSize: 'clamp(0.58rem, 0.7vw, 0.64rem)',
        fontWeight: 400,
        color: '#444',
        textDecoration: 'none',
        borderRadius: '3px',
        transition: 'color 0.15s ease, background-color 0.15s ease',
        whiteSpace: 'nowrap',
        lineHeight: 1.25,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#111'
        e.currentTarget.style.backgroundColor = '#e8e8e2'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#444'
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {label}
    </a>
  )
}

/* ── Pixel-Art Block Logomark ── */
function PixelLogoMark() {
  return (
    <svg
      width="28" height="28"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, imageRendering: 'pixelated' }}
    >
      <rect width="36" height="36" rx="6" fill="#527A50" />
      <rect x="2" y="2" width="16" height="8" rx="1" fill="rgba(255,255,255,0.15)" />
      <rect x="20" y="4" width="14" height="6" rx="1" fill="rgba(255,255,255,0.08)" />
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
      <rect x="0" y="30" width="36" height="6" rx="0" fill="rgba(0,0,0,0.18)" />
    </svg>
  )
}

function ShieldMiniIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M7 1.5L2 3.5V7.5C2 10 4.2 12.2 7 13C9.8 12.2 12 10 12 7.5V3.5L7 1.5Z"
        fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5 7.2L6.2 8.4L9.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

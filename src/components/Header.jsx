import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Header — Raven
 *
 * Fully Responsive Multi-Device Navigation:
 *   Desktop (>1340px): Full inline nav links + Logo + CTA + Welcome Badge + Sign Out
 *   Tablet (769px - 1340px): Logo + CTA + Welcome Badge + Three-Lines Menu Button
 *   Phone (<=768px): Logo + Avatar + Three-Lines Menu Button
 *   Drawer: Accessible on all devices via Three-Lines Menu with user operative card & quick actions
 */

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Scanner',      href: '#scanner' },
  { label: 'Repo Scan',    href: '#repo-scanner' },
  { label: 'Threat Intel', href: '#threat-intel' },
  { label: 'About',        href: '#about' },
]

export default function Header({ onSignOut }) {
  const { user, userProfile, logout, openAuthModal } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      const orig = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = orig
      }
    }
  }, [open])

  async function handleSignOut() {
    try {
      await logout()
      if (onSignOut) onSignOut()
    } catch (e) {
      console.error('Logout error:', e)
    }
  }

  const scrollToHome = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      window.history.pushState(null, '', '#home')
    } catch {}
  }

  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Agent'
  const displayAvatar = userProfile?.avatar || user?.photoURL || '/avatars/coder_boy.jpg'

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(250,250,247,0.96)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--color-border-light)',
          boxShadow: '0 1px 0 rgba(44,36,22,0.04)',
        }}
      >
        <div
          className="header-bar-container"
          style={{
            height: '64px',
            maxWidth: '1560px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 'clamp(0.75rem, 2vw, 2rem)',
            paddingRight: 'clamp(0.75rem, 2vw, 2rem)',
            boxSizing: 'border-box',
            gap: '12px',
          }}
        >
          {/* ── LEFT: Logo + Desktop Navigation ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(10px, 1.2vw, 16px)',
              flexShrink: 0,
            }}
          >
            {/* Logo (Emblem + Wordmark) */}
            <a
              href="#home"
              onClick={scrollToHome}
              aria-label="Raven home"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <img
                src="/assets/raven-emblem-new.jpg"
                className="header-logo-emblem"
                alt="Raven Logo"
                style={{
                  height: '38px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply',
                }}
              />
              <img
                src="/assets/raven-wordmark-new.jpg"
                className="header-logo-wordmark"
                alt="RAVEN"
                style={{
                  height: '24px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply',
                }}
              />
            </a>

            {/* Desktop Navigation Links */}
            <div
              className="header-desktop-nav-wrap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 1vw, 14px)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '1px',
                  height: '20px',
                  backgroundColor: '#dcd8cf',
                  flexShrink: 0,
                }}
              />

              <nav
                aria-label="Main navigation"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  flexShrink: 0,
                }}
              >
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} href={link.href} label={link.label} />
                ))}
              </nav>
            </div>
          </div>

          {/* ── RIGHT: Actions + Welcome + Hamburger Button ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {/* Check a Website CTA (Visible on Desktop & Tablet) */}
            <a
              href="#scanner"
              className="header-cta-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-forest)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '8px 13px',
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

            {/* Authenticated State: Welcome [Name] Badge + Avatar */}
            {user && (
              <div
                className="header-user-welcome"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #2a2a2a',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0 #2a2a2a',
                  padding: '4px 8px 4px 5px',
                  flexShrink: 0,
                }}
              >
                <img
                  src={displayAvatar}
                  alt={displayName}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '3px',
                    objectFit: 'cover',
                    border: '1.5px solid #2b772b',
                    imageRendering: 'pixelated',
                    display: 'block',
                  }}
                />
                <span
                  className="header-welcome-text"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.62rem',
                    color: '#2b772b',
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                  }}
                  title={`Welcome, ${displayName}`}
                >
                  Welcome, {displayName}
                </span>
              </div>
            )}

            {/* Desktop-only Sign Out / Sign In Button (>1340px) */}
            <div className="header-desktop-auth-btn">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  title={`Signed in as ${displayName}`}
                  aria-label="Sign out"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#ffffff',
                    color: '#cc2222',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    padding: '8px 11px',
                    borderRadius: '4px',
                    border: '2px solid #2a2a2a',
                    boxShadow: '2px 2px 0 #2a2a2a',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff0f0'
                    e.currentTarget.style.transform = 'translate(-1px, -1px)'
                    e.currentTarget.style.boxShadow = '3px 3px 0 #2a2a2a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.transform = 'translate(0, 0)'
                    e.currentTarget.style.boxShadow = '2px 2px 0 #2a2a2a'
                  }}
                >
                  <LogoutPixelIcon />
                  <span>SIGN OUT</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  aria-label="Sign in"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#ffffff',
                    color: '#2b772b',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '2px solid #2a2a2a',
                    boxShadow: '2px 2px 0 #2a2a2a',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f4fbf4'
                    e.currentTarget.style.transform = 'translate(-1px, -1px)'
                    e.currentTarget.style.boxShadow = '3px 3px 0 #2a2a2a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.transform = 'translate(0, 0)'
                    e.currentTarget.style.boxShadow = '2px 2px 0 #2a2a2a'
                  }}
                >
                  <span>▶</span>
                  <span>SIGN IN</span>
                </button>
              )}
            </div>

            {/* ── THREE-LINES HAMBURGER BUTTON (Phone & Tablet) ── */}
            <button
              type="button"
              aria-label={open ? 'Close navigation directory' : 'Open navigation directory'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="header-three-lines-btn"
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #2a2a2a',
                borderRadius: '4px',
                boxShadow: '2px 2px 0 #2a2a2a',
                cursor: 'pointer',
                padding: '6px 8px',
                display: 'flex',
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
              {open ? <CloseIcon /> : <ThreeLinesIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── NAVIGATION DIRECTORY DRAWER (PHONE & TABLET) ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(12, 18, 12, 0.76)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '74px',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingBottom: '2.5rem',
            overflowY: 'auto',
            animation: 'drawerFadeIn 0.18s ease-out both',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#fafaf6',
              border: '3px solid #2a2a2a',
              borderRadius: '6px',
              boxShadow: '6px 6px 0 #1c2e1c, 0 20px 40px rgba(0,0,0,0.5)',
              padding: '20px 18px',
              boxSizing: 'border-box',
              animation: 'drawerPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Top Bar inside Drawer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '2px solid #e0ded4',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#2b772b', fontSize: '0.8rem' }}>■</span>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.74rem',
                    color: '#2b772b',
                    letterSpacing: '0.08em',
                  }}
                >
                  RAVEN DIRECTORY
                </span>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: '#ffffff',
                  border: '2px solid #2a2a2a',
                  borderRadius: '3px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#2a2a2a',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.75rem',
                  boxShadow: '2px 2px 0 #1c2e1c',
                }}
              >
                ✕
              </button>
            </div>

            {/* Operative Card (If Signed In) */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #2a2a2a',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0 #2a2a2a',
                  marginBottom: '16px',
                }}
              >
                <img
                  src={displayAvatar}
                  alt={displayName}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '4px',
                    objectFit: 'cover',
                    border: '1.5px solid #2b772b',
                    imageRendering: 'pixelated',
                    display: 'block',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.72rem',
                      color: '#2b772b',
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Welcome, {displayName}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.64rem',
                      color: '#666',
                      marginTop: '2px',
                    }}
                  >
                    <span style={{ color: '#2b772b' }}>●</span> VERIFIED OPERATIVE
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Links Directory */}
            <nav aria-label="Directory navigation" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    padding: '12px 14px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #2a2a2a',
                    borderRadius: '4px',
                    boxShadow: '2px 2px 0 #2a2a2a',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    color: '#222',
                    textDecoration: 'none',
                    letterSpacing: '0.04em',
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5faf5'
                    e.currentTarget.style.transform = 'translate(-1px, -1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.transform = 'translate(0, 0)'
                  }}
                >
                  <span>{link.label}</span>
                  <span style={{ color: '#2b772b', fontSize: '0.74rem' }}>▶</span>
                </a>
              ))}
            </nav>

            {/* Quick Action Options */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  padding: '12px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  border: '2px solid #1c551c',
                  boxShadow: '3px 3px 0 #1c551c',
                  letterSpacing: '0.04em',
                }}
              >
                <ShieldMiniIcon />
                <span>CHECK A WEBSITE</span>
              </a>

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
                  padding: '12px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  border: '2px solid #2a2a2a',
                  boxShadow: '3px 3px 0 #2a2a2a',
                  letterSpacing: '0.04em',
                }}
              >
                <span>🛡 CHECK REPOSITORY</span>
              </a>

              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    handleSignOut()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#fff0f0',
                    color: '#cc2222',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    border: '2px solid #cc2222',
                    boxShadow: '3px 3px 0 #2a2a2a',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    width: '100%',
                  }}
                >
                  <LogoutPixelIcon />
                  <span>SIGN OUT ({displayName})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    openAuthModal('signin')
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                    color: '#2b772b',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    border: '2px solid #2b772b',
                    boxShadow: '3px 3px 0 #2a2a2a',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    width: '100%',
                  }}
                >
                  <span>▶</span>
                  <span>SIGN IN / REGISTER</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Multi-Device Responsive Breakpoint System ── */}
      <style>{`
        /* Desktop: >= 1260px */
        @media (min-width: 1260px) {
          .header-desktop-nav-wrap {
            display: flex !important;
          }
          .header-desktop-auth-btn {
            display: block !important;
          }
          .header-three-lines-btn {
            display: none !important;
          }
        }

        /* Tablet & Small Desktop: < 1260px */
        @media (max-width: 1259px) {
          .header-desktop-nav-wrap {
            display: none !important;
          }
          .header-desktop-auth-btn {
            display: none !important;
          }
          .header-three-lines-btn {
            display: flex !important;
          }
        }

        /* Small Tablet & Mobile: <= 920px */
        @media (max-width: 920px) {
          .header-welcome-text {
            max-width: 110px !important;
          }
        }

        /* Phone: <= 640px */
        @media (max-width: 640px) {
          .header-cta-btn {
            display: none !important; /* Full prominent CTA is inside the three lines drawer */
          }
          .header-welcome-text {
            display: none !important; /* Avatar-only icon on phone bar, full name inside drawer */
          }
          .header-user-welcome {
            padding: 3px !important;
          }
        }

        /* Extra small phones: <= 480px */
        @media (max-width: 480px) {
          .header-bar-container {
            padding-left: 8px !important;
            padding-right: 8px !important;
            gap: 6px !important;
          }
          .header-logo-emblem {
            height: 32px !important;
          }
          .header-logo-wordmark {
            height: 18px !important;
          }
        }

        /* 320px - 350px ultra compact phones */
        @media (max-width: 350px) {
          .header-logo-wordmark {
            display: none !important;
          }
        }

        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerPopIn {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}

/* -- Desktop Nav Link with Clean, Balanced Spacing -- */
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
        fontSize: '0.64rem',
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

function ShieldMiniIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M7 1.5L2 3.5V7.5C2 10 4.2 12.2 7 13C9.8 12.2 12 10 12 7.5V3.5L7 1.5Z"
        fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5 7.2L6.2 8.4L9.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Three Horizontal Lines Hamburger Icon */
function ThreeLinesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="15" height="2.2" rx="0.5" fill="#222" />
      <rect x="1.5" y="7.9" width="15" height="2.2" rx="0.5" fill="#222" />
      <rect x="1.5" y="12.8" width="15" height="2.2" rx="0.5" fill="#222" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3.5 3.5L14.5 14.5M14.5 3.5L3.5 14.5" stroke="#222" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  )
}

function LogoutPixelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <path d="M10 11L13 8L10 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <path d="M5 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  )
}

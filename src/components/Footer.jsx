/**
 * Footer — Raven
 *
 * Minecraft-inspired dark footer with pixel typography and block-style elements.
 */

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #0f1f0f 0%, #0a160a 100%)',
        borderTop: '4px solid #2d4a2d',
        padding: 'clamp(3rem, 6vw, 4.5rem) 0',
        overflow: 'hidden',
      }}
    >
      {/* Pixel grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(82,122,80,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(82,122,80,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
          pointerEvents: 'none',
        }}
      />

      <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Grid: Logo + sections */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
            marginBottom: 'clamp(2rem, 3vw, 3rem)',
          }}
        >
          {/* Brand column */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: '#3a7a3a',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid #4a9a4a',
                  boxShadow: '0 3px 0 #1f551f',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1.5L2 3.5V8.5C2 11.2 4.2 13.6 8 14.5C11.8 13.6 14 11.2 14 8.5V3.5L8 1.5Z"
                    fill="rgba(122,186,122,0.2)" stroke="#7aba7a" strokeWidth="1.1" strokeLinejoin="round" />
                  <path d="M5.5 8.2L6.8 9.5L10.5 6.5" stroke="#7aba7a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '1.2rem',
                  color: '#c8e0c8',
                  letterSpacing: '0.03em',
                }}
              >
                Raven
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: '#5a7a5a',
                lineHeight: 1.7,
              }}
            >
              AI-powered digital trust and threat intelligence platform. Explore the web safely.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1rem',
                color: '#7aba7a',
                letterSpacing: '0.06em',
                marginBottom: '1rem',
              }}
            >
              PRODUCT
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Security Scanner', 'Threat Intelligence', 'Digital Trust', 'Reports', 'Documentation'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: '#5a8a5a',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#8aba8a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5a8a5a')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1rem',
                color: '#7aba7a',
                letterSpacing: '0.06em',
                marginBottom: '1rem',
              }}
            >
              COMPANY
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: '#5a8a5a',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#8aba8a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5a8a5a')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1rem',
                color: '#7aba7a',
                letterSpacing: '0.06em',
                marginBottom: '1rem',
              }}
            >
              LEGAL
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Privacy Policy', 'Terms of Service', 'Security', 'Compliance', 'Cookies'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: '#5a8a5a',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#8aba8a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5a8a5a')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Block-style divider */}
        <div
          style={{
            height: '3px',
            background: 'repeating-linear-gradient(90deg, #2d4a2d 0px, #2d4a2d 12px, transparent 12px, transparent 16px)',
            margin: 'clamp(2rem, 3vw, 3rem) 0',
          }}
        />

        {/* Bottom bar: copyright + socials */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: '#4a6a4a',
            }}
          >
            © 2026 Raven. All rights reserved. Built with{' '}
            <span style={{ color: '#e06060' }}>♥</span> for digital security.
          </p>

          {/* Social links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {['Twitter', 'Discord', 'GitHub'].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={social}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(82,122,80,0.15)',
                  border: '2px solid #2d4a2d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5a9a5a',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 0 #0a160a',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3a7a3a'
                  e.currentTarget.style.color = '#e0f0e0'
                  e.currentTarget.style.borderColor = '#4a9a4a'
                  e.currentTarget.style.transform = 'translateY(1px)'
                  e.currentTarget.style.boxShadow = '0 1px 0 #0a160a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(82,122,80,0.15)'
                  e.currentTarget.style.color = '#5a9a5a'
                  e.currentTarget.style.borderColor = '#2d4a2d'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 0 #0a160a'
                }}
              >
                {social.charAt(0)}
              </a>
            ))}
          </div>
        </div>

        {/* Status indicator */}
        <div
          style={{
            marginTop: '2rem',
            padding: '12px 16px',
            backgroundColor: 'rgba(82,122,80,0.1)',
            border: '2px solid #2d4a2d',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: '#4a9a4a',
              animation: 'sparkle 2s ease-in-out infinite',
            }}
          />
          <span style={{ color: '#5a8a5a', fontFamily: 'var(--font-pixel)', letterSpacing: '0.04em' }}>
            All security investigation services operational
          </span>
        </div>
      </div>
    </footer>
  )
}

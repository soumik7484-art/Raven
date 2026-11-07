/**
 * Footer — HackMatrix
 *
 * Company info, links, and contact details.
 * Stone-textured minimal design to match the Minecraft theme.
 */

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-stone-light)',
        borderTop: '2px solid var(--color-border)',
        padding: 'clamp(3rem, 6vw, 4.5rem) 0',
      }}
    >
      <div className="section-container">
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
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-forest)',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid var(--color-forest-dark)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1.5L2 3.5V8.5C2 11.2 4.2 13.6 8 14.5C11.8 13.6 14 11.2 14 8.5V3.5L8 1.5Z"
                    fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.1" strokeLinejoin="round" />
                  <path d="M5.5 8.2L6.8 9.5L10.5 6.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  letterSpacing: '-0.02em',
                }}
              >
                HackMatrix
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-muted)',
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
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                letterSpacing: '-0.015em',
                marginBottom: '1rem',
              }}
            >
              Product
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Security Scanner', 'Threat Intelligence', 'Digital Trust', 'Reports', 'Documentation'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'var(--color-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-charcoal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
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
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                letterSpacing: '-0.015em',
                marginBottom: '1rem',
              }}
            >
              Company
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'var(--color-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-charcoal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
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
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                letterSpacing: '-0.015em',
                marginBottom: '1rem',
              }}
            >
              Legal
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Privacy Policy', 'Terms of Service', 'Security', 'Compliance', 'Cookies'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'var(--color-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-charcoal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--color-border)',
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
              color: 'var(--color-faint)',
            }}
          >
            © 2026 HackMatrix. All rights reserved. Built with{' '}
            <span style={{ color: 'var(--color-danger)' }}>♥</span> for digital security.
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
                  borderRadius: '6px',
                  backgroundColor: 'rgba(82,122,80,0.1)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-forest)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-forest)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(82,122,80,0.1)'
                  e.currentTarget.style.color = 'var(--color-forest)'
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
            backgroundColor: 'rgba(82,122,80,0.08)',
            border: '1px solid rgba(82,122,80,0.2)',
            borderRadius: '8px',
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
              borderRadius: '4px',
              backgroundColor: '#4CAF50',
              animation: 'sparkle 2s ease-in-out infinite',
            }}
          />
          <span style={{ color: 'var(--color-muted)' }}>
            All security investigation services operational
          </span>
        </div>
      </div>
    </footer>
  )
}

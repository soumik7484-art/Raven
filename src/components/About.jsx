/**
 * About — Raven (Pixel-Art Cyber World Console & Manifesto)
 *
 * Details the Raven mission and cyber defense pillars
 * within a cohesive Minecraft-inspired pixel-art presentation matching the light theme.
 */

const PILLARS = [
  {
    icon: '🛡️',
    title: 'MISSION ZERO PHISH',
    desc: 'Unmask counterfeit web portals, deceptive credential harvesters, and punycode masquerades before users share sensitive credentials.',
  },
  {
    icon: '⚡',
    title: 'EXPLAINABLE INTELLIGENCE',
    desc: 'No black-box mystery scores. Raven provides clear cryptographic indicators, TLS certificate signatures, and raw heuristic signals.',
  },
  {
    icon: '🌐',
    title: 'COMMUNITY DEFENSE GRID',
    desc: 'Empowering security researchers, students, and curious web explorers with accessible, high-grade cybersecurity investigation tools.',
  },
]

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{
        backgroundColor: '#f8f8f5',
        borderTop: '2px solid #ddd',
        borderBottom: '3px solid #2a2a2a',
        paddingTop: 'clamp(3.5rem, 7vw, 5.5rem)',
        paddingBottom: 'clamp(3.5rem, 7vw, 5.5rem)',
        scrollMarginTop: '64px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle pixel grid */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      <div className="section-container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.72rem',
              color: '#2a2a2a',
              letterSpacing: '0.1em',
              marginBottom: '1.25rem',
              padding: '6px 16px',
              backgroundColor: '#fff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
            }}
          >
            <span style={{ color: '#3a7a3a' }}>■</span>
            DEFENSE MANIFESTO • GRID TELEMETRY
          </div>

          <h2
            id="about-heading"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.1rem, 2.8vw, 1.8rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              lineHeight: 1.4,
              color: '#111',
              marginBottom: '1rem',
            }}
          >
            ABOUT RAVEN &amp;<br />
            <span style={{ color: '#3a7a3a' }}>THE CYBER DEFENSE GRID</span>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              lineHeight: 1.8,
              color: '#555',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            Raven was conceived to make digital investigation transparent, swift, and engaging.
            Inspired by voxel worlds and retro computing, our mission is to defend every explorer of the web.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '20px',
            marginBottom: '2.5rem',
          }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              style={{
                padding: '22px',
                backgroundColor: '#ffffff',
                border: '2px solid #2a2a2a',
                borderRadius: '4px',
                boxShadow: '3px 3px 0 #2a2a2a',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '5px 5px 0 #2a2a2a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '3px 3px 0 #2a2a2a'
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  lineHeight: 1,
                }}
              >
                {p.icon}
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.8rem',
                  color: '#111',
                  margin: 0,
                  letterSpacing: '0.04em',
                  lineHeight: 1.4,
                }}
              >
                {p.title}
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  lineHeight: 1.8,
                  color: '#555',
                  margin: 0,
                }}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Cyber Core Intelligence & Action Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #2a2a2a',
            borderRadius: '4px',
            boxShadow: '4px 4px 0 #2a2a2a',
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ flex: '1 1 240px', minWidth: 0, maxWidth: '640px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: '#555',
              }}
            >
              Powered by advanced neural heuristics, distributed threat crawlers, and community intelligence.
            </div>
          </div>

          <a
            href="#scanner"
            style={{
              padding: '10px 18px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-pixel)',
              color: '#ffffff',
              backgroundColor: '#3a7a3a',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              boxShadow: '3px 3px 0 #2a2a2a',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)'
              e.currentTarget.style.boxShadow = '1px 1px 0 #2a2a2a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '3px 3px 0 #2a2a2a'
            }}
          >
            <span>▶ LAUNCH WORKSTATION</span>
          </a>
        </div>
      </div>
    </section>
  )
}

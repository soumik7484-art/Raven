/**
 * ThreatIntel — Raven
 *
 * Threat Intelligence / Hostile Entity Registry section.
 * White pixel-art themed cards matching the reference design.
 */

const THREATS = [
  {
    id: 'phishing-phantom',
    severity: 'CRITICAL',
    severityColor: '#cc2222',
    type: 'CREDENTIAL HARVESTER',
    icon: '👾',
    iconBg: '#fff0f0',
    iconBorder: '#cc2222',
    name: 'PHISHING PHANTOM',
    desc: 'Lurks behind counterfeit login forms and spoofed domain blocks to intercept authentication tokens.',
    tags: ['Deceptive UI', 'Punycode', 'Form Hijack'],
    tagColors: ['#cc2222', '#cc2222', '#cc2222'],
    cardBorder: '#cc2222',
  },
  {
    id: 'malware-creeper',
    severity: 'HIGH',
    severityColor: '#e67e22',
    type: 'PAYLOAD INJECTOR',
    icon: '🦠',
    iconBg: '#fff8f0',
    iconBorder: '#e67e22',
    name: 'MALWARE CREEPER',
    desc: 'Quietly drops obfuscated bytecode into client browsers via malicious iframes and infected CDNs.',
    tags: ['Drive-by DL', 'Obfuscated JS', 'Zero-Day'],
    tagColors: ['#e67e22', '#e67e22', '#e67e22'],
    cardBorder: '#2a2a2a',
  },
  {
    id: 'ransom-golem',
    severity: 'SEVERE',
    severityColor: '#7c3aed',
    type: 'ENCRYPTION LOCKER',
    icon: '🔒',
    iconBg: '#f5f0ff',
    iconBorder: '#7c3aed',
    name: 'RANSOM GOLEM',
    desc: 'Encrypts critical data blocks behind impenetrable cryptographic locks, demanding extortion ransoms.',
    tags: ['AES-256 Trap', 'C2 Callback', 'Extortion'],
    tagColors: ['#7c3aed', '#7c3aed', '#7c3aed'],
    cardBorder: '#2a2a2a',
  },
  {
    id: 'dns-ghast',
    severity: 'HIGH',
    severityColor: '#e67e22',
    type: 'TRAFFIC SPOOFER',
    icon: '👻',
    iconBg: '#fff8f0',
    iconBorder: '#e67e22',
    name: 'DNS GHAST',
    desc: 'Infiltrates authoritative nameservers, poisoning cache entries to reroute legitimate traffic.',
    tags: ['Cache Poison', 'BGP Anomaly', 'Fast Flux'],
    tagColors: ['#e67e22', '#e67e22', '#e67e22'],
    cardBorder: '#2a2a2a',
  },
]

export default function ThreatIntel() {
  return (
    <section
      id="threat-intel"
      aria-labelledby="threat-intel-heading"
      style={{
        background: '#f5f5f0',
        scrollMarginTop: '64px',
        paddingTop: 'clamp(3.5rem, 7vw, 5rem)',
        paddingBottom: 'clamp(3.5rem, 7vw, 5rem)',
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

      <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.72rem',
            color: '#1a1a1a',
            letterSpacing: '0.12em',
            marginBottom: '1.25rem',
            padding: '6px 16px',
            backgroundColor: '#fff',
            border: '2px solid #2a2a2a',
            borderRadius: '3px',
          }}>
            <span style={{ color: '#3a7a3a' }}>■</span>
            HOSTILE ENTITY RADAR • DATABASE V2.6
          </div>

          {/* Title */}
          <h2
            id="threat-intel-heading"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1rem, 3vw, 1.8rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              lineHeight: 1.4,
              color: '#111',
              marginBottom: '0.4rem',
            }}
          >
            THREAT INTELLIGENCE
          </h2>
          <h3 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(0.75rem, 2vw, 1.1rem)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            color: '#cc2222',
            marginBottom: '1rem',
          }}>
            HOSTILE ENTITY REGISTRY
          </h3>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: '#555',
            lineHeight: 1.8,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Every web attack vector is classified into behavioral threat entity profiles,
            monitored 24/7 across our global threat telemetry grid.
          </p>
        </div>

        {/* ── Cards grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '20px',
        }}>
          {THREATS.map((t) => (
            <ThreatCard key={t.id} threat={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ThreatCard({ threat: t }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `2px solid ${t.cardBorder}`,
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.12)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.12)'
      }}
    >
      {/* Card top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        backgroundColor: '#f8f8f5',
        borderBottom: '1px solid #e0e0da',
      }}>
        {/* Severity badge */}
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.68rem',
          color: '#fff',
          backgroundColor: t.severityColor,
          padding: '4px 8px',
          borderRadius: '2px',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}>
          {t.severity}
        </span>
        {/* Type label */}
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.68rem',
          color: '#555',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {t.type}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '18px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Icon */}
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: t.iconBg,
          border: `2px solid ${t.iconBorder}`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          imageRendering: 'pixelated',
        }}>
          {t.icon}
        </div>

        {/* Name */}
        <h4 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.8rem',
          fontWeight: 400,
          color: '#111',
          letterSpacing: '0.04em',
          lineHeight: 1.4,
          margin: 0,
        }}>
          {t.name}
        </h4>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: '#555',
          lineHeight: 1.8,
          margin: 0,
          flex: 1,
        }}>
          {t.desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
          {t.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.65rem',
                color: t.severityColor,
                border: `1px solid ${t.severityColor}`,
                padding: '4px 8px',
                borderRadius: '2px',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useAuth } from '../context/AuthContext'

export default function RepoRestrictedAccess() {
  const { openAuthModal } = useAuth()

  function scrollToWebsiteScanner() {
    const el = document.getElementById('scanner')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="repo-scanner"
      aria-labelledby="restricted-repo-heading"
      style={{
        position: 'relative',
        backgroundColor: '#0d0404',
        backgroundImage: `
          radial-gradient(ellipse at 50% 20%, rgba(138, 20, 20, 0.28) 0%, rgba(15, 5, 5, 0.98) 75%),
          linear-gradient(rgba(255, 50, 50, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 50, 50, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        borderTop: '3px solid #4a0808',
        borderBottom: '3px solid #4a0808',
        paddingTop: 'clamp(4rem, 8vw, 6.5rem)',
        paddingBottom: 'clamp(4.5rem, 9vw, 7rem)',
        overflow: 'hidden',
        scrollMarginTop: '64px',
      }}
    >
      {/* Subtle crimson scanline ambient effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      <div className="section-container" style={{ maxWidth: '820px', position: 'relative', zIndex: 2 }}>
        
        {/* Main Blood-Red Restricted Card */}
        <div
          className="repo-restricted-card"
          style={{
            backgroundColor: '#160505',
            border: '3px solid #8a1414',
            borderRadius: '6px',
            boxShadow: `
              0 0 30px rgba(179, 24, 24, 0.35),
              inset 2px 2px 0 #cc2b2b,
              inset -2px -2px 0 #4a0808,
              8px 8px 0 #000000
            `,
            padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Top Classification Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.68rem',
              color: '#ff4d4d',
              letterSpacing: '0.12em',
              marginBottom: '20px',
              padding: '6px 14px',
              backgroundColor: '#2b0707',
              border: '2px solid #8a1414',
              borderRadius: '3px',
              boxShadow: '2px 2px 0 #000',
            }}
          >
            <span style={{ color: '#ff2222', animation: 'bloodPulse 1.8s infinite' }}>■</span>
            <span>SECURITY LEVEL 4 • RESTRICTED CLEARANCE REQUIRED</span>
          </div>

          {/* Locked Repository Pixel Graphic */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px',
              filter: 'drop-shadow(0 6px 16px rgba(204, 34, 34, 0.4))',
            }}
          >
            <PixelLockVaultIcon />
          </div>

          {/* Main Warning Text */}
          <h2
            id="restricted-repo-heading"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.2rem, 3.2vw, 1.9rem)',
              color: '#ff3333',
              letterSpacing: '0.06em',
              lineHeight: 1.35,
              marginBottom: '16px',
              textShadow: '0 0 12px rgba(255, 30, 30, 0.6), 2px 2px 0 #3b0505',
            }}
          >
            FIRST, YOU MUST SIGN IN.
          </h2>

          {/* Supporting Text */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.88rem, 1.8vw, 0.98rem)',
              color: '#e0c8c8',
              lineHeight: 1.7,
              maxWidth: '580px',
              margin: '0 auto 32px auto',
            }}
          >
            Repository Intelligence is available exclusively to registered RAVEN users.
            Sign in or create an account to unlock repository security analysis.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* SIGN IN Button */}
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                backgroundColor: '#b31818',
                color: '#ffffff',
                border: '2px solid #ff4d4d',
                borderRadius: '4px',
                padding: '13px 24px',
                cursor: 'pointer',
                boxShadow: '3px 3px 0 #000, 0 0 14px rgba(255, 50, 50, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.12s ease, background-color 0.12s ease, box-shadow 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#cc2222'
                e.currentTarget.style.transform = 'translate(-1px, -1px)'
                e.currentTarget.style.boxShadow = '4px 4px 0 #000, 0 0 20px rgba(255, 50, 50, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#b31818'
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '3px 3px 0 #000, 0 0 14px rgba(255, 50, 50, 0.4)'
              }}
            >
              <span>▶</span>
              <span>SIGN IN</span>
            </button>

            {/* CREATE ACCOUNT Button */}
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                backgroundColor: '#240808',
                color: '#ff8888',
                border: '2px solid #8a1414',
                borderRadius: '4px',
                padding: '13px 22px',
                cursor: 'pointer',
                boxShadow: '3px 3px 0 #000',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.12s ease, background-color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#380c0c'
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.transform = 'translate(-1px, -1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#240808'
                e.currentTarget.style.color = '#ff8888'
                e.currentTarget.style.transform = 'translate(0, 0)'
              }}
            >
              <span>+</span>
              <span>CREATE ACCOUNT</span>
            </button>

            {/* BACK TO WEBSITE SCANNER Button */}
            <button
              type="button"
              onClick={scrollToWebsiteScanner}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                backgroundColor: '#111111',
                color: '#aaaaaa',
                border: '2px solid #333333',
                borderRadius: '4px',
                padding: '13px 20px',
                cursor: 'pointer',
                boxShadow: '3px 3px 0 #000',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.12s ease, color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.borderColor = '#555555'
                e.currentTarget.style.transform = 'translate(-1px, -1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#aaaaaa'
                e.currentTarget.style.borderColor = '#333333'
                e.currentTarget.style.transform = 'translate(0, 0)'
              }}
            >
              <span>←</span>
              <span>BACK TO WEBSITE SCANNER</span>
            </button>
          </div>

          {/* Bottom Security Assurance Note */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '18px',
              borderTop: '1px dashed rgba(180, 40, 40, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.74rem',
                color: '#997777',
              }}
            >
              Public Website Scanner remains completely open and free to all visitors.
            </span>
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.62rem',
                color: '#773333',
                letterSpacing: '0.08em',
              }}
            >
              ENCRYPTED AUTH VIA FIREBASE
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bloodPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.9); }
        }
      `}</style>
    </section>
  )
}

function PixelLockVaultIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
      {/* Outer shield/vault frame */}
      <rect x="14" y="22" width="40" height="38" rx="4" fill="#200606" stroke="#b31818" strokeWidth="3" />
      {/* Shackle */}
      <path
        d="M24 22V16C24 10.4772 28.4772 6 34 6C39.5228 6 44 10.4772 44 16V22"
        stroke="#ff4d4d"
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Keyhole */}
      <circle cx="34" cy="38" r="4.5" fill="#ff3333" />
      <polygon points="31.5,39 36.5,39 35.5,49 32.5,49" fill="#ff3333" />
      {/* Corner rivets */}
      <rect x="18" y="26" width="3" height="3" fill="#ff4d4d" opacity="0.8" />
      <rect x="47" y="26" width="3" height="3" fill="#ff4d4d" opacity="0.8" />
      <rect x="18" y="52" width="3" height="3" fill="#ff4d4d" opacity="0.8" />
      <rect x="47" y="52" width="3" height="3" fill="#ff4d4d" opacity="0.8" />
    </svg>
  )
}

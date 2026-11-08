/**
 * ScanResult — HackMatrix
 *
 * All result states for the URL scanner.
 * Renders ONLY real backend data. Never fabricates scores, findings, or certs.
 * States: loading | unavailable | error | success
 */

export default function ScanResult({ state, data, error, url, onRetry, onReset }) {
  if (state === 'idle') return null

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Scan results"
      style={{
        marginTop: '24px',
        animation: 'scale-in 0.4s var(--ease-spring) both',
      }}
    >
      {state === 'loading'     && <LoadingView url={url} />}
      {state === 'unavailable' && <UnavailableView onRetry={onRetry} onReset={onReset} />}
      {state === 'error'       && <ErrorView error={error} onRetry={onRetry} onReset={onReset} />}
      {state === 'success'     && <SuccessView data={data} url={url} onReset={onReset} />}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Loading State
   ───────────────────────────────────────────── */
function LoadingView({ url }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(18,30,18,0.85)',
        border: '3px solid #2d4a2d',
        borderRadius: '8px',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 6px 0 #1a2e1a, 0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Pixel spinner */}
      <div style={{ position: 'relative', width: '52px', height: '52px', margin: '0 auto' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="26" cy="26" r="20" stroke="#2d4a2d" strokeWidth="3" fill="none" />
        </svg>
        <svg
          width="52" height="52" viewBox="0 0 52 52"
          style={{ position: 'absolute', inset: 0, animation: 'spin 1.4s linear infinite' }}
        >
          <circle
            cx="26" cy="26" r="20"
            stroke="#4a9a4a"
            strokeWidth="3"
            fill="none"
            strokeDasharray="35 125"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p
        style={{
          marginTop: '20px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.3rem',
          color: '#c8e0c8',
          letterSpacing: '0.03em',
          textShadow: '0 0 10px rgba(82,122,80,0.3)',
        }}
      >
        Investigating Website…
      </p>

      <p
        style={{
          marginTop: '8px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: '#6a9a6a',
          lineHeight: 1.6,
        }}
      >
        Running phishing detection, threat intelligence, certificate validation, and security assessment modules.
      </p>

      {url && (
        <p
          style={{
            marginTop: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#5a9a5a',
            wordBreak: 'break-all',
            backgroundColor: 'rgba(10,20,10,0.5)',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #2d4a2d',
          }}
        >
          Target: {url}
        </p>
      )}

      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <ModuleIndicator label="ML Detection" />
        <ModuleIndicator label="Threat Intel" />
        <ModuleIndicator label="TLS & Domain" />
        <ModuleIndicator label="Assessment" />
      </div>
    </div>
  )
}

function ModuleIndicator({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.85rem',
        color: '#5a9a5a',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '2px',
          backgroundColor: '#4a9a4a',
          animation: 'sparkle 1.4s ease-in-out infinite',
        }}
      />
      {label}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Unavailable State
   ───────────────────────────────────────────── */
function UnavailableView({ onRetry, onReset }) {
  return (
    <StateCard
      icon={<WifiOffIcon />}
      iconColor="#c8952a"
      bgColor="rgba(30,25,15,0.85)"
      borderColor="#5a4a2a"
      title="Website Scanner Backend Disconnected"
      message="The website security investigation backend is currently offline. No fabricated scores or fake reports are generated. The GitHub Repository Security Health Check is active below."
      details={[
        'Backend service is temporarily unavailable',
        'Network connectivity issue detected',
        'Please ensure your connection is active',
        'Try again in a few seconds',
      ]}
      onRetry={onRetry}
      onReset={onReset}
    />
  )
}

/* ─────────────────────────────────────────────
   Error State
   ───────────────────────────────────────────── */
function ErrorView({ error, onRetry, onReset }) {
  return (
    <StateCard
      icon={<AlertCircleIcon />}
      iconColor="#e06060"
      bgColor="rgba(30,15,15,0.85)"
      borderColor="#5a2a2a"
      title="Investigation Failed"
      message={error || 'An unexpected error occurred while investigating this website. The URL may be invalid, unreachable, or triggered a security filter.'}
      details={[
        'URL validation passed but investigation failed',
        'Backend returned an error response',
        'Check the URL and try again',
        'If the issue persists, contact support',
      ]}
      onRetry={onRetry}
      onReset={onReset}
    />
  )
}

/* ─────────────────────────────────────────────
   State Card — shared layout for error/unavailable
   ───────────────────────────────────────────── */
function StateCard({ icon, iconColor, bgColor, borderColor, title, message, details, onRetry, onReset }) {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `3px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '28px 24px',
        boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div
          style={{
            flexShrink: 0,
            width: '40px',
            height: '40px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            border: `2px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.2rem',
              color: '#e0d0c0',
              letterSpacing: '0.02em',
              marginBottom: '6px',
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: '#8a7a6a',
              lineHeight: 1.65,
              marginBottom: '12px',
            }}
          >
            {message}
          </p>

          {/* Details list */}
          {details && (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 16px 0',
                display: 'grid',
                gap: '6px',
              }}
            >
              {details.map((d, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: '#6a6a5a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '1px',
                      backgroundColor: borderColor,
                      flexShrink: 0,
                    }}
                  />
                  {d}
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <ActionButton label="Try Again" onClick={onRetry} primary />
            <ActionButton label="Check Another Website" onClick={onReset} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Success State — renders actual backend response
   ───────────────────────────────────────────── */
function SuccessView({ data, url, onReset }) {
  const entries =
    Array.isArray(data)
      ? [['results', data]]
      : data && typeof data === 'object'
        ? Object.entries(data)
        : [['result', data]]

  return (
    <div
      style={{
        backgroundColor: 'rgba(18,30,18,0.85)',
        border: '3px solid #2d4a2d',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 6px 0 #1a2e1a, 0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Result header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderBottom: '2px solid #3a5a3a',
          background: 'linear-gradient(180deg, #2d4a2d 0%, #1f361f 100%)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            backgroundColor: 'rgba(82,122,80,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid #4a9a4a',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 1L2 3.5V9C2 12.8 5.2 16 9 17C12.8 16 16 12.8 16 9V3.5L9 1Z"
              fill="rgba(82,122,80,0.3)" stroke="#7aba7a" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M6 9L7.8 10.8L12.5 6.5" stroke="#7aba7a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.15rem',
              color: '#c8e0c8',
              letterSpacing: '0.02em',
            }}
          >
            Investigation Complete
          </p>
          <p
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.75rem',
              color: '#4a8a4a',
              letterSpacing: '0.05em',
              marginTop: '2px',
            }}
          >
            RESULTS RECEIVED
          </p>
        </div>
      </div>

      {/* Target URL */}
      {url && (
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: 'rgba(10,20,10,0.5)',
            borderBottom: '1px solid #2d4a2d',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.75rem',
              color: '#3a6b3a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '6px',
            }}
          >
            Investigated URL
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              color: '#8aba8a',
              wordBreak: 'break-all',
            }}
          >
            {url}
          </p>
        </div>
      )}

      {/* Data fields */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.length > 0 ? (
          entries.map(([key, value]) => (
            <DataField key={key} label={key} value={value} />
          ))
        ) : (
          <p style={{ color: '#5a7a5a', textAlign: 'center', padding: '20px', fontFamily: 'var(--font-pixel)' }}>
            No investigation data returned. The website may not have been reachable.
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '2px dashed #1f361f',
          backgroundColor: 'rgba(10,20,10,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: '#4a7a4a',
          }}
        >
          Investigation completed successfully
        </span>
        <ActionButton label="Scan Another Website" onClick={onReset} primary />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Data Field — generic renderer
   ───────────────────────────────────────────── */
function DataField({ label, value }) {
  const isPrimitive =
    value === null || value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'

  return (
    <div
      style={{
        backgroundColor: 'rgba(10,20,10,0.4)',
        border: '1px solid #2d4a2d',
        borderRadius: '4px',
        padding: '14px 16px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.8rem',
          color: '#4a8a4a',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '8px',
        }}
      >
        {formatLabel(label)}
      </p>

      {isPrimitive ? (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: '#b0d0b0',
            lineHeight: 1.65,
            wordBreak: 'break-word',
          }}
        >
          {value === null || value === undefined ? '—' : String(value)}
        </p>
      ) : (
        <pre
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#8aba8a',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            overflowY: 'auto',
            maxHeight: '280px',
            margin: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #1f361f',
          }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Action Button
   ───────────────────────────────────────────── */
function ActionButton({ label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: primary ? '#3a7a3a' : 'none',
        border: primary ? '2px solid #4a9a4a' : 'none',
        padding: primary ? '8px 16px' : 0,
        borderRadius: primary ? '4px' : 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.95rem',
        fontWeight: 400,
        color: primary ? '#e0f0e0' : '#5a9a5a',
        textDecoration: primary ? 'none' : 'underline',
        textUnderlineOffset: '3px',
        boxShadow: primary ? '0 3px 0 #1f551f' : 'none',
        transition: 'all 0.15s ease',
        letterSpacing: '0.03em',
      }}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.backgroundColor = '#4a8a4a'
          e.currentTarget.style.transform = 'translateY(1px)'
          e.currentTarget.style.boxShadow = '0 2px 0 #1f551f'
        } else {
          e.currentTarget.style.color = '#7aba7a'
        }
      }}
      onMouseLeave={(e) => {
        if (primary) {
          e.currentTarget.style.backgroundColor = '#3a7a3a'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 3px 0 #1f551f'
        } else {
          e.currentTarget.style.color = '#5a9a5a'
        }
      }}
    >
      {label}
    </button>
  )
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */
function WifiOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 17a2 2 0 1 1 2 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12a8 8 0 0 1 6-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 8C5.5 5.5 9 3.5 13 3.5c1 0 1.8.2 2.5.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function AlertCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

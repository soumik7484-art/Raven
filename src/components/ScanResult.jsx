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
        backgroundColor: 'var(--color-off-white)',
        border: '2px solid var(--color-border)',
        borderRadius: '10px',
        padding: '40px 32px',
        textAlign: 'center',
      }}
    >
      {/* Dual-ring spinner */}
      <div style={{ position: 'relative', width: '52px', height: '52px', margin: '0 auto' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="26" cy="26" r="20" stroke="var(--color-border)" strokeWidth="3" fill="none" />
        </svg>
        <svg
          width="52" height="52" viewBox="0 0 52 52"
          style={{ position: 'absolute', inset: 0, animation: 'spin 1.4s linear infinite' }}
        >
          <circle
            cx="26" cy="26" r="20"
            stroke="var(--color-forest)"
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
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--color-charcoal)',
          letterSpacing: '-0.02em',
        }}
      >
        Investigating Website…
      </p>

      <p
        style={{
          marginTop: '8px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-muted)',
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
            color: 'var(--color-faint)',
            wordBreak: 'break-all',
            backgroundColor: 'var(--color-white)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border-light)',
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
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem',
        color: 'var(--color-muted)',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '4px',
          backgroundColor: 'var(--color-gold)',
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
      iconColor="var(--color-earth)"
      bgColor="rgba(169,130,91,0.08)"
      borderColor="var(--color-earth)"
      title="Website Scanning Unavailable"
      message="The security investigation backend is currently offline or unreachable. Please try again in a few moments, or check our status page for updates."
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
      iconColor="var(--color-danger)"
      bgColor="rgba(181,64,58,0.08)"
      borderColor="var(--color-danger)"
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
        border: `2px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '28px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div
          style={{
            flexShrink: 0,
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.6)',
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
              fontFamily: 'var(--font-display)',
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--color-muted)',
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
                    color: 'var(--color-faint)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: 'var(--color-stone)',
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
        backgroundColor: 'var(--color-white)',
        border: '2px solid var(--color-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 0 var(--color-border)',
      }}
    >
      {/* Result header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border-light)',
          backgroundColor: 'var(--color-stone-light)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-pale-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid var(--color-forest)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 1L2 3.5V9C2 12.8 5.2 16 9 17C12.8 16 16 12.8 16 9V3.5L9 1Z"
              fill="rgba(82,122,80,0.2)" stroke="var(--color-forest)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M6 9L7.8 10.8L12.5 6.5" stroke="var(--color-forest)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.02em',
            }}
          >
            Investigation Complete
          </p>
          <p
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.75rem',
              color: 'var(--color-stone-dark)',
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
            backgroundColor: 'var(--color-ivory)',
            borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-faint)',
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
              color: 'var(--color-charcoal)',
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
          <p style={{ color: 'var(--color-faint)', textAlign: 'center', padding: '20px' }}>
            No investigation data returned. The website may not have been reachable.
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px dashed var(--color-border)',
          backgroundColor: 'var(--color-ivory)',
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
            color: 'var(--color-faint)',
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
        backgroundColor: 'var(--color-stone-light)',
        border: '1px solid var(--color-border-light)',
        borderRadius: '8px',
        padding: '14px 16px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          fontWeight: 500,
          color: 'var(--color-faint)',
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
            color: 'var(--color-charcoal)',
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
            color: 'var(--color-charcoal)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            overflowY: 'auto',
            maxHeight: '280px',
            margin: 0,
            backgroundColor: 'rgba(255,255,255,0.4)',
            padding: '10px',
            borderRadius: '4px',
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
        background: 'none',
        border: primary ? '2px solid var(--color-forest)' : 'none',
        padding: primary ? '8px 16px' : 0,
        borderRadius: primary ? '6px' : 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        fontSize: '0.875rem',
        fontWeight: primary ? 700 : 600,
        color: 'var(--color-forest)',
        textDecoration: primary ? 'none' : 'underline',
        textUnderlineOffset: '3px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.backgroundColor = 'var(--color-forest)'
          e.currentTarget.style.color = 'white'
          e.currentTarget.style.boxShadow = '0 2px 0 var(--color-forest-dark)'
        } else {
          e.currentTarget.style.color = 'var(--color-forest-dark)'
        }
      }}
      onMouseLeave={(e) => {
        if (primary) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--color-forest)'
          e.currentTarget.style.boxShadow = 'none'
        } else {
          e.currentTarget.style.color = 'var(--color-forest)'
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

import { useState } from 'react'
import { validateUrl } from '../utils/urlValidator'
import { startScan } from '../services/scanService'
import ScanResult from './ScanResult'

/**
 * Scanner — HackMatrix
 *
 * Premium URL investigation interface.
 * State machine: idle → loading → (unavailable | error | success)
 * Connects to POST /api/scan via existing scanService (untouched).
 * Never fabricates scan results.
 */
export default function Scanner() {
  const [input,      setInput]      = useState('')
  const [valErr,     setValErr]     = useState('')
  const [state,      setState]      = useState('idle')
  const [data,       setData]       = useState(null)
  const [error,      setError]      = useState('')
  const [scannedUrl, setScannedUrl] = useState('')

  async function runScan(url) {
    setState('loading')
    setScannedUrl(url)
    setData(null)
    setError('')
    const result = await startScan(url)
    if (result.unavailable)    setState('unavailable')
    else if (result.error)   { setError(result.error);  setState('error') }
    else if (result.data)    { setData(result.data);    setState('success') }
    else                       setState('unavailable')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setValErr('')
    const { valid, normalized, error } = validateUrl(input)
    if (!valid) { setValErr(error); return }
    runScan(normalized)
  }

  function retry()      { if (scannedUrl) runScan(scannedUrl) }
  function clearInput() { setInput(''); setValErr('') }
  function reset() {
    setInput(''); setValErr(''); setState('idle')
    setData(null); setError(''); setScannedUrl('')
  }

  const isLoading = state === 'loading'

  return (
    <section
      id="scanner"
      aria-labelledby="scanner-heading"
      style={{
        backgroundColor: 'var(--color-stone-light)',
        borderTop:    '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        scrollMarginTop: '64px',
        paddingTop:    'clamp(3.5rem, 7vw, 5.5rem)',
        paddingBottom: 'clamp(4rem,  8vw, 6.5rem)',
      }}
    >
      {/* Pixel texture accent */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          backgroundImage: `radial-gradient(circle, var(--color-border-strong) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          width: '100%',
          height: '100%',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <div className="section-container" style={{ maxWidth: '700px' }}>

        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.9rem',
              color: 'var(--color-stone-dark)',
              letterSpacing: '0.06em',
              marginBottom: '1rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" fill="var(--color-stone-dark)" />
              <rect x="8" y="1" width="5" height="5" fill="var(--color-stone-dark)" />
              <rect x="1" y="8" width="5" height="5" fill="var(--color-stone-dark)" />
              <rect x="8" y="8" width="5" height="5" fill="var(--color-stone-dark)" />
            </svg>
            SECURITY SCANNER
          </div>

          <h2
            id="scanner-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: 'var(--color-charcoal)',
              marginBottom: '0.75rem',
            }}
          >
            Check Any Website
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--color-muted)',
            lineHeight: 1.65,
            maxWidth: '440px',
            margin: '0 auto',
          }}>
            Investigate a website before you trust it.
          </p>
        </div>

        {/* Scanner card */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '2px solid var(--color-border-strong)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 6px 0 var(--color-border-strong), var(--shadow-md)',
          }}
        >
          {/* Card header bar — stone block style */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border-light)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-forest)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                border: '2px solid var(--color-forest-dark)',
                boxShadow: '0 2px 0 var(--color-forest-dark)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L2 3V7C2 9.8 4.2 12.2 7 13C9.8 12.2 12 9.8 12 7V3L7 1Z"
                  fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.1" strokeLinejoin="round" />
                <path d="M5 7L6.3 8.3L9.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.02em',
            }}>
              Website Security Investigation
            </span>
            <div style={{ flex: 1 }} />
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.8rem',
              color: 'var(--color-sage)',
              letterSpacing: '0.05em',
            }}>
              v2.0
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="url-input"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 500,
                color: 'var(--color-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
              }}
            >
              Target URL
            </label>

            {/* Input bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                border: '2px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-off-white)',
                overflow: 'hidden',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-forest)'
                e.currentTarget.style.boxShadow   = 'var(--shadow-focus)'
              }}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.boxShadow   = 'none'
                }
              }}
            >
              {/* Globe prefix */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '14px',
                flexShrink: 0,
              }}>
                <GlobeIcon />
              </div>

              {/* Input */}
              <input
                id="url-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a website URL (e.g. https://example.com)"
                disabled={isLoading}
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                aria-label="Website URL to investigate"
                aria-describedby={valErr ? 'url-error' : undefined}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '15px 10px 15px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  color: 'var(--color-charcoal)',
                  caretColor: 'var(--color-forest)',
                }}
              />

              {/* Clear */}
              {input && !isLoading && (
                <button
                  type="button"
                  onClick={clearInput}
                  aria-label="Clear URL"
                  style={{
                    flexShrink: 0,
                    padding: '0 10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-stone)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-charcoal)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-stone)')}
                >
                  <XIcon />
                </button>
              )}

              {/* Divider */}
              <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Run security investigation"
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  margin: '6px',
                  padding: '0 20px',
                  backgroundColor: isLoading || !input.trim() ? 'var(--color-sage)' : 'var(--color-forest)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: `2px solid ${isLoading || !input.trim() ? 'var(--color-sage-light)' : 'var(--color-forest-dark)'}`,
                  borderRadius: '6px',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading || !input.trim() ? 'none' : '0 3px 0 var(--color-forest-dark)',
                  transition: 'background-color 0.18s ease, box-shadow 0.12s ease, transform 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(2px)'
                    e.currentTarget.style.boxShadow = '0 1px 0 var(--color-forest-dark)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = e.currentTarget.disabled ? 'none' : '0 3px 0 var(--color-forest-dark)'
                }}
              >
                {isLoading ? (
                  <>
                    <SpinIcon />
                    <span>Scanning…</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.3" />
                      <path d="M9.5 9.5L12.5 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>Investigate</span>
                  </>
                )}
              </button>
            </div>

            {/* Validation error */}
            {valErr && (
              <div
                id="url-error"
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  marginTop: '10px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-danger-light)',
                  border: '1px solid rgba(181,64,58,0.2)',
                  borderRadius: '6px',
                  color: 'var(--color-danger)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.84rem',
                }}
              >
                <AlertIcon />
                {valErr}
              </div>
            )}
          </form>

          {/* Privacy + hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px dashed var(--color-border)',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--color-faint)',
            }}>
              URLs are not stored beyond the investigation duration.
            </span>
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.85rem',
              color: 'var(--color-stone-dark)',
              letterSpacing: '0.03em',
            }}>
              POWERED BY AI
            </span>
          </div>
        </div>

        {/* Results */}
        <ScanResult
          state={state}
          data={data}
          error={error}
          url={scannedUrl}
          onRetry={retry}
          onReset={reset}
        />
      </div>
    </section>
  )
}

/* Icons */
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="var(--color-stone)" strokeWidth="1.3" />
      <path d="M9 1.5C9 1.5 6.5 4.5 6.5 9s2.5 7.5 2.5 7.5S11.5 13.5 11.5 9 9 1.5 9 1.5Z"
        stroke="var(--color-stone)" strokeWidth="1.3" />
      <path d="M1.5 9h15" stroke="var(--color-stone)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{ animation: 'spin 0.9s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7.5" cy="7.5" r="6.5" stroke="var(--color-danger)" strokeWidth="1.2" />
      <path d="M7.5 4.5v4" stroke="var(--color-danger)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="0.8" fill="var(--color-danger)" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

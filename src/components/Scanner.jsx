import { useState } from 'react'
import { validateUrl } from '../utils/urlValidator'
import { startScan } from '../services/scanService'
import ScanResult from './ScanResult'

/**
 * Scanner — Raven
 *
 * Light-themed security scanner interface matching the reference design.
 * State machine: idle → loading → (unavailable | error | success)
 * Connects to POST /api/scan via existing scanService (untouched).
 * Never fabricates scan results.
 */

const SAMPLE_TARGETS = ['github.com', 'wikipedia.org', 'suspicious-verify-login.xyz']

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

  function applySample(url) {
    setInput(url)
    setValErr('')
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
        position: 'relative',
        background: '#f5f5f0',
        borderTop: '3px solid #d0d0c8',
        borderBottom: '3px solid #d0d0c8',
        scrollMarginTop: '64px',
        paddingTop: 'clamp(3.5rem, 7vw, 5.5rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6.5rem)',
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
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      <div className="section-container" style={{ maxWidth: state !== 'idle' ? '1080px' : '820px', width: '100%', position: 'relative', zIndex: 1, transition: 'max-width 0.25s ease' }}>

        {/* ── Section header ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>

          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.72rem',
              color: '#2a2a2a',
              letterSpacing: '0.12em',
              marginBottom: '1.25rem',
              padding: '6px 16px',
              backgroundColor: '#fff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
            }}
          >
            <span>■</span>
            SECURITY WORKSTATION • ACTIVE RADAR
          </div>

          {/* Main heading */}
          <h2
            id="scanner-heading"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.2rem, 3.2vw, 2rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              lineHeight: 1.3,
              color: '#111',
              marginBottom: '1rem',
            }}
          >
            CHECK ANY WEBSITE
          </h2>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: '#555',
            lineHeight: 1.8,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Investigate website reputation, threat feeds, and security integrity before trusting it.
          </p>
        </div>

        {/* ── Terminal card ── */}
        <div
          className="scanner-card"
          style={{
            backgroundColor: '#fff',
            border: '2px solid #2a2a2a',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '4px 4px 0 #2a2a2a',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              backgroundColor: '#f0f0eb',
              borderBottom: '2px solid #2a2a2a',
            }}
          >
            {/* Green square icon */}
            <span style={{ color: '#3a7a3a', fontSize: '0.8rem', lineHeight: 1 }}>■</span>

            {/* Title */}
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.72rem',
              color: '#1a1a1a',
              letterSpacing: '0.08em',
              flex: 1,
            }}>
              SECURITY WORKSTATION · V2.6
            </span>

            {/* READY badge */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.7rem',
              color: '#1a1a1a',
              border: '1px solid #2a2a2a',
              padding: '4px 10px',
              borderRadius: '2px',
              letterSpacing: '0.08em',
              backgroundColor: '#fff',
            }}>
              READY
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '22px 22px 0' }}>
            <form onSubmit={handleSubmit} noValidate>

              {/* Label */}
              <label
                htmlFor="url-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.72rem',
                  color: '#1a1a1a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '12px',
                }}
              >
                <span style={{ color: '#3a7a3a' }}>▶</span>
                ENTER TARGET URL
              </label>

              {/* Input row */}
              <div
                className="scanner-input-box"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  border: '2px solid #2a2a2a',
                  borderRadius: '3px',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.18s ease',
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(58,122,58,0.2)'
                }}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {/* Globe + input */}
                <div
                  className="scanner-field-row"
                  style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', flexShrink: 0 }}>
                    <GlobeIcon />
                  </div>
                  <input
                    id="url-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter website URL (e.g. https://example.com)"
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
                      padding: '14px 10px 14px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: '#222',
                      caretColor: '#3a7a3a',
                    }}
                  />
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
                        color: '#888',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#333')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                    >
                      <XIcon />
                    </button>
                  )}
                </div>

                {/* Investigate button */}
                <button
                  type="submit"
                  className="scanner-submit-btn"
                  disabled={isLoading || !input.trim()}
                  aria-label="Run security investigation"
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '0 24px',
                    backgroundColor: isLoading || !input.trim() ? '#ccc' : '#3a7a3a',
                    color: isLoading || !input.trim() ? '#888' : '#fff',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    border: 'none',
                    borderLeft: '2px solid #2a2a2a',
                    borderRadius: '0',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled)
                      e.currentTarget.style.backgroundColor = '#2d6a2d'
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled)
                      e.currentTarget.style.backgroundColor = '#3a7a3a'
                  }}
                >
                  {isLoading ? (
                    <>
                      <SpinIcon />
                      <span>Scanning…</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.75rem' }}>▶</span>
                      <span>INVESTIGATE</span>
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
                    padding: '8px 12px',
                    backgroundColor: '#fff0f0',
                    border: '2px solid #cc4444',
                    borderRadius: '3px',
                    color: '#cc4444',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    lineHeight: 1.4,
                  }}
                >
                  <AlertIcon />
                  {valErr}
                </div>
              )}
            </form>

            {/* Sample targets */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.7rem',
                color: '#555',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}>
                SAMPLE TARGETS:
              </span>
              {SAMPLE_TARGETS.map((url) => (
                <button
                  key={url}
                  type="button"
                  className="scanner-sample-btn"
                  onClick={() => applySample(url)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#333',
                    background: '#fff',
                    border: '1px solid #aaa',
                    borderRadius: '2px',
                    padding: '5px 11px',
                    cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0eb'
                    e.currentTarget.style.borderColor = '#555'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#aaa'
                  }}
                >
                  {url}
                </button>
              ))}
            </div>

            {/* Footer row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '16px',
                padding: '14px 0 16px',
                borderTop: '1px solid #ddd',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                color: '#888',
                lineHeight: 1.6,
              }}>
                Zero logs stored. Safe sandboxed request pipeline.
              </span>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.68rem',
                color: '#555',
                letterSpacing: '0.06em',
              }}>
                POWERED BY RAVEN ENGINE
              </span>
            </div>
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

      <style>{`
        .scanner-card {
          transition: box-shadow 0.15s ease;
        }
        .scanner-card:hover {
          box-shadow: 6px 6px 0 #2a2a2a !important;
        }
        #url-input::placeholder {
          color: #bbb;
          font-size: 0.82rem;
        }
        @media (max-width: 540px) {
          .scanner-input-box {
            flex-direction: column !important;
            border: 2px solid #2a2a2a !important;
            overflow: visible !important;
          }
          .scanner-field-row {
            width: 100% !important;
          }
          .scanner-submit-btn {
            width: 100% !important;
            padding: 13px 18px !important;
            border-left: none !important;
            border-top: 2px solid #2a2a2a !important;
            justify-content: center !important;
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 480px) {
          .scanner-card {
            box-shadow: 3px 3px 0 #2a2a2a !important;
          }
          .scanner-sample-btn {
            padding: 4px 7px !important;
            font-size: 0.65rem !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

/* Icons */
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="#888" strokeWidth="1.3" />
      <path d="M9 1.5C9 1.5 6.5 4.5 6.5 9s2.5 7.5 2.5 7.5S11.5 13.5 11.5 9 9 1.5 9 1.5Z"
        stroke="#888" strokeWidth="1.3" />
      <path d="M1.5 9h15" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{ animation: 'spin 0.9s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7.5" cy="7.5" r="6.5" stroke="#cc4444" strokeWidth="1.2" />
      <path d="M7.5 4.5v4" stroke="#cc4444" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="0.8" fill="#cc4444" />
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

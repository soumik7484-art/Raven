import { useState } from 'react'
import { validateUrl } from '../utils/urlValidator'
import { startScan } from '../services/scanService'
import ScanResult from './ScanResult'

/**
 * Scanner — HackMatrix
 *
 * Minecraft-inspired security scanner interface.
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
        position: 'relative',
        background: 'linear-gradient(180deg, #1a2e1a 0%, #0f1f0f 40%, #0a160a 100%)',
        borderTop: '4px solid #2d4a2d',
        borderBottom: '4px solid #2d4a2d',
        scrollMarginTop: '64px',
        paddingTop: 'clamp(3.5rem, 7vw, 5.5rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6.5rem)',
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
            linear-gradient(rgba(82,122,80,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(82,122,80,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
          pointerEvents: 'none',
        }}
      />
      {/* Voxel dots */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(82,122,80,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />
      {/* Grass top edge */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #3a6b3a, #4a8a4a, #3a6b3a, #4a8a4a)',
          backgroundSize: '48px 6px',
        }}
      />

      <div className="section-container" style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* Label badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '1rem',
              color: '#7aba7a',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
              padding: '4px 14px',
              backgroundColor: 'rgba(82,122,80,0.15)',
              border: '2px solid rgba(82,122,80,0.3)',
              borderRadius: '4px',
            }}
          >
            {/* Pixel shield icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="6" y="1" width="4" height="2" fill="#7aba7a" />
              <rect x="4" y="3" width="8" height="2" fill="#7aba7a" />
              <rect x="3" y="5" width="10" height="2" fill="#5a9a5a" />
              <rect x="4" y="7" width="8" height="2" fill="#5a9a5a" />
              <rect x="5" y="9" width="6" height="2" fill="#4a8a4a" />
              <rect x="6" y="11" width="4" height="2" fill="#4a8a4a" />
              <rect x="7" y="13" width="2" height="2" fill="#3a7a3a" />
            </svg>
            SECURITY SCANNER
          </div>

          <h2
            id="scanner-heading"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
              color: '#e8f0e8',
              marginBottom: '0.75rem',
              textShadow: '0 0 20px rgba(82,122,80,0.4), 0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Check Any Website
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: '#8aaa8a',
            lineHeight: 1.65,
            maxWidth: '440px',
            margin: '0 auto',
          }}>
            Investigate a website before you trust it.
          </p>
        </div>

        {/* Scanner terminal card */}
        <div
          className="scanner-card"
          style={{
            backgroundColor: 'rgba(18,30,18,0.85)',
            border: '3px solid #2d4a2d',
            borderRadius: '8px',
            padding: '0',
            boxShadow: '0 8px 0 #1a2e1a, 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(82,122,80,0.2)',
            backdropFilter: 'blur(8px)',
            overflow: 'hidden',
          }}
        >
          {/* Terminal title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(180deg, #2d4a2d 0%, #1f361f 100%)',
              borderBottom: '2px solid #3a5a3a',
            }}
          >
            {/* Dot lights */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#4a8a4a', border: '1px solid #5a9a5a' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3a6b3a', border: '1px solid #4a7b4a' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#2d5a2d', border: '1px solid #3a6b3a' }} />
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Shield icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L2 3V7C2 9.8 4.2 12.2 7 13C9.8 12.2 12 9.8 12 7V3L7 1Z"
                  fill="rgba(82,122,80,0.3)" stroke="#5a9a5a" strokeWidth="1" strokeLinejoin="round" />
                <path d="M5 7L6.3 8.3L9.5 5.5" stroke="#7aba7a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.85rem',
                color: '#5a9a5a',
                letterSpacing: '0.05em',
              }}>
                INVESTIGATION TERMINAL
              </span>
            </div>
            <div style={{ flex: 1 }} />
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.75rem',
              color: '#3a6b3a',
              letterSpacing: '0.05em',
            }}>
              v2.0
            </span>
          </div>

          {/* Card body */}
          <div style={{ padding: '24px 20px' }}>
            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="url-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.85rem',
                  color: '#5a9a5a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '10px',
                }}
              >
                {/* Cursor blink */}
                <span style={{ color: '#7aba7a', animation: 'sparkle 1s step-end infinite' }}>▸</span>
                TARGET URL
              </label>

              {/* Input bar */}
              <div
                className="scanner-input-box"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  border: '2px solid #2d4a2d',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(10,20,10,0.6)',
                  overflow: 'hidden',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = '#4a8a4a'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(82,122,80,0.25), 0 0 20px rgba(82,122,80,0.15)'
                }}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    e.currentTarget.style.borderColor = '#2d4a2d'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {/* Field row with globe & input */}
                <div
                  className="scanner-field-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
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
                      color: '#c8e0c8',
                      caretColor: '#7aba7a',
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
                        color: '#5a7a5a',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#8aba8a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#5a7a5a')}
                    >
                      <XIcon />
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="scanner-divider" style={{ width: '2px', backgroundColor: '#2d4a2d', margin: '6px 0' }} />

                {/* Submit - Minecraft block button */}
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
                    margin: '6px',
                    padding: '0 22px',
                    backgroundColor: isLoading || !input.trim() ? '#2d4a2d' : '#3a7a3a',
                    color: isLoading || !input.trim() ? '#5a7a5a' : '#e0f0e0',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1rem',
                    fontWeight: 400,
                    border: `2px solid ${isLoading || !input.trim() ? '#2d5a2d' : '#4a9a4a'}`,
                    borderRadius: '4px',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 0 #1f551f, inset 0 1px 0 rgba(255,255,255,0.1)',
                    transition: 'background-color 0.15s ease, box-shadow 0.1s ease, transform 0.1s ease',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em',
                    textShadow: isLoading || !input.trim() ? 'none' : '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'translateY(2px)'
                      e.currentTarget.style.boxShadow = '0 2px 0 #1f551f, inset 0 1px 0 rgba(255,255,255,0.1)'
                      e.currentTarget.style.backgroundColor = '#4a8a4a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.boxShadow = '0 4px 0 #1f551f, inset 0 1px 0 rgba(255,255,255,0.1)'
                      e.currentTarget.style.backgroundColor = '#3a7a3a'
                    }
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
                        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
                    backgroundColor: 'rgba(181,64,58,0.15)',
                    border: '2px solid rgba(181,64,58,0.3)',
                    borderRadius: '4px',
                    color: '#e06060',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.95rem',
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
                borderTop: '2px dashed #1f361f',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Lock icon */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="2" y="5" width="8" height="6" rx="1" fill="#2d4a2d" stroke="#3a6b3a" strokeWidth="1" />
                  <path d="M4 5V3.5C4 2.12 5.12 1 6.5 1h0C7.88 1 9 2.12 9 3.5V5" stroke="#3a6b3a" strokeWidth="1" fill="none" />
                </svg>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: '#5a7a5a',
                }}>
                  URLs are not stored beyond the investigation duration.
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.85rem',
                color: '#3a6b3a',
                letterSpacing: '0.05em',
              }}>
                POWERED BY AI
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .scanner-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 0 #1a2e1a, 0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(82,122,80,0.2), 0 0 30px rgba(82,122,80,0.08) !important;
        }
        #url-input::placeholder {
          color: #3a5a3a;
        }
        @media (max-width: 540px) {
          .scanner-input-box {
            flex-direction: column !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            gap: 10px !important;
          }
          .scanner-field-row {
            background-color: rgba(10,20,10,0.6) !important;
            border: 2px solid #2d4a2d !important;
            border-radius: 4px !important;
            width: 100% !important;
          }
          .scanner-divider {
            display: none !important;
          }
          .scanner-submit-btn {
            width: 100% !important;
            margin: 0 !important;
            padding: 13px 20px !important;
            justify-content: center !important;
            border-radius: 4px !important;
          }
        }
      `}</style>
    </section>
  )
}

/* Icons */
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="#4a8a4a" strokeWidth="1.3" />
      <path d="M9 1.5C9 1.5 6.5 4.5 6.5 9s2.5 7.5 2.5 7.5S11.5 13.5 11.5 9 9 1.5 9 1.5Z"
        stroke="#4a8a4a" strokeWidth="1.3" />
      <path d="M1.5 9h15" stroke="#4a8a4a" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{ animation: 'spin 0.9s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke="rgba(122,186,122,0.3)" strokeWidth="1.5" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#7aba7a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7.5" cy="7.5" r="6.5" stroke="#e06060" strokeWidth="1.2" />
      <path d="M7.5 4.5v4" stroke="#e06060" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="0.8" fill="#e06060" />
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

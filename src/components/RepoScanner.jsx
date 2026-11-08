import { useState, useEffect } from 'react'
import {
  fetchUserRepos,
  startRepoScan,
  getRepoScanStatus,
  getRepoScanReport
} from '../services/repoScanService'
import RepoReport from './RepoReport'

/**
 * RepoScanner — TRUSTLENS GitHub Repository Security Workstation
 * Integrates the Three-State Warrior Reaction System.
 */

const SAMPLE_EXAMPLES = [
  { label: 'octocat/Hello-World', value: 'https://github.com/octocat/Hello-World' },
  { label: 'appsecco/dvna (Vulnerable Demo)', value: 'https://github.com/appsecco/dvna' },
  { label: 'octocat (User Profile)', value: 'https://github.com/octocat' }
]

export default function RepoScanner() {
  const [input, setInput] = useState('')
  const [valErr, setValErr] = useState('')
  const [state, setState] = useState('idle') // idle | loading_repos | selecting_repo | scanning | completed | error | unavailable
  const [userRepos, setUserRepos] = useState([])
  const [selectedUsername, setSelectedUsername] = useState('')
  const [scanStatus, setScanStatus] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeScanId, setActiveScanId] = useState(null)

  // Developer Preview Mode override (null = live automated mode)

  // Polling for scan progress
  useEffect(() => {
    if (state !== 'scanning' || !activeScanId) return

    const interval = setInterval(async () => {
      const res = await getRepoScanStatus(activeScanId)
      if (res.unavailable) {
        setState('unavailable')
        clearInterval(interval)
        return
      }
      if (res.error) {
        setErrorMessage(res.error)
        setState('error')
        clearInterval(interval)
        return
      }

      const scanState = res.data
      setScanStatus(scanState)

      if (scanState.status === 'completed') {
        clearInterval(interval)
        const repRes = await getRepoScanReport(activeScanId)
        if (repRes.data) {
          setReportData(repRes.data)
          setState('completed')
        } else {
          setReportData(scanState.report)
          setState('completed')
        }
      } else if (scanState.status === 'failed') {
        clearInterval(interval)
        setErrorMessage(scanState.error || 'Repository analysis failed.')
        setState('error')
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [state, activeScanId])

  function handleInputChange(e) {
    setInput(e.target.value)
    if (valErr) setValErr('')
  }

  async function handleInspect(e) {
    if (e) e.preventDefault()
    setValErr('')
    setErrorMessage('')

    const trimmed = input.trim()
    if (!trimmed) {
      setValErr('Please enter a GitHub username or repository URL.')
      return
    }

    // Determine if input is a repository URL or single username
    const isRepo = trimmed.includes('/') && !trimmed.endsWith('github.com/') && !trimmed.match(/^https?:\/\/github\.com\/[^/]+\/?$/)

    if (isRepo) {
      // Trigger scan directly on repository
      await initiateScan(trimmed)
    } else {
      // Extract username
      let username = trimmed.replace(/^https?:\/\/(?:www\.)?github\.com\//, '').replace(/\/.*$/, '').trim()
      if (!username) {
        setValErr('Invalid GitHub target. Please enter a username or repository URL.')
        return
      }

      setState('loading_repos')
      setSelectedUsername(username)
      const res = await fetchUserRepos(username)

      if (res.unavailable) {
        setState('unavailable')
        return
      }
      if (res.error) {
        setErrorMessage(res.error)
        setState('error')
        return
      }

      const repos = res.data?.repositories || []
      if (repos.length === 0) {
        setErrorMessage(`User '${username}' has no accessible public repositories.`)
        setState('error')
        return
      }

      setUserRepos(repos)
      setState('selecting_repo')
    }
  }

  async function initiateScan(repoTarget) {
    setState('scanning')
    setScanStatus({ progress_message: 'Connecting to GitHub API and security engines...', step: 1 })
    setReportData(null)

    const res = await startRepoScan(repoTarget)
    if (res.unavailable) {
      setState('unavailable')
      return
    }
    if (res.error) {
      setErrorMessage(res.error)
      setState('error')
      return
    }

    setActiveScanId(res.data.scan_id)
  }

  function handleSelectRepo(full_name) {
    initiateScan(full_name)
  }

  function handleReset() {
    setInput('')
    setValErr('')
    setErrorMessage('')
    setState('idle')
    setUserRepos([])
    setSelectedUsername('')
    setScanStatus(null)
    setReportData(null)
    setActiveScanId(null)
  }

  const isWorking = state === 'loading_repos' || state === 'scanning'

  
  return (
    <section
      id="repo-scanner"
      aria-labelledby="repo-scanner-heading"
      style={{
        position: 'relative',
        background: '#f8f8f5',
        borderTop: '3px solid #2a2a2a',
        borderBottom: '3px solid #2a2a2a',
        scrollMarginTop: '64px',
        paddingTop: 'clamp(3.5rem, 7vw, 5.5rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6.5rem)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle pixel grid background */}
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

      <div className="section-container" style={{ maxWidth: '860px', position: 'relative', zIndex: 1 }}>

        {/* ── Section Header ── */}
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
              letterSpacing: '0.1em',
              marginBottom: '1.25rem',
              padding: '6px 16px',
              backgroundColor: '#fff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              boxShadow: '2px 2px 0 #2a2a2a',
            }}
          >
            <GitHubMiniPixelIcon />
            <span>CODE REPOSITORY SECURITY TELEMETRY</span>
          </div>

          {/* Heading */}
          <h2
            id="repo-scanner-heading"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.2rem, 3.2vw, 2rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              lineHeight: 1.3,
              color: '#111',
              marginBottom: '0.75rem',
            }}
          >
            CHECK YOUR REPOSITORY
          </h2>

          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(0.72rem, 1.8vw, 0.88rem)',
              color: '#3a7a3a',
              letterSpacing: '0.04em',
              marginBottom: '1rem',
            }}
          >
            "Your code deserves protection too."
          </div>

          {/* Description */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: '#555',
              lineHeight: 1.8,
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            Investigate your GitHub repository for exposed secrets, vulnerable dependencies and potentially risky code.
          </p>
        </div>

        {/* ── Workstation Terminal Card ── */}
        <div
          className="repo-terminal-card"
            style={{
              backgroundColor: '#fff',
              border: '2px solid #2a2a2a',
              borderRadius: '4px',
              boxShadow: '4px 4px 0 #2a2a2a',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Title Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                backgroundColor: '#f0f0eb',
                borderBottom: '2px solid #2a2a2a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#3a7a3a', fontSize: '0.8rem' }}>■</span>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    color: '#1a1a1a',
                    letterSpacing: '0.08em',
                  }}
                >
                  REPOSITORY HEALTH CHECK WORKSTATION
                </span>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.68rem',
                  color: isWorking ? '#8B6914' : '#3a7a3a',
                  border: '1px solid #2a2a2a',
                  padding: '4px 10px',
                  borderRadius: '2px',
                  backgroundColor: '#fff',
                  letterSpacing: '0.06em',
                }}
              >
                {isWorking ? 'SCANNING' : 'ONLINE'}
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <form onSubmit={handleInspect} noValidate>
                <label
                  htmlFor="repo-url-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    color: '#1a1a1a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ color: '#3a7a3a' }}>▶</span>
                  ENTER GITHUB TARGET (USERNAME OR REPOSITORY)
                </label>

                {/* Input row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                  }}
                  className="repo-input-group"
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', flexShrink: 0 }}>
                      <GitHubMiniPixelIcon />
                    </div>
                    <input
                      id="repo-url-input"
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Paste your GitHub username or repository URL..."
                      disabled={isWorking}
                      spellCheck={false}
                      autoCapitalize="none"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        padding: '14px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: '#222',
                        caretColor: '#3a7a3a',
                      }}
                    />
                    {input && !isWorking && (
                      <button
                        type="button"
                        onClick={() => setInput('')}
                        aria-label="Clear input"
                        style={{
                          padding: '0 12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#888',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Inspect button */}
                  <button
                    type="submit"
                    disabled={isWorking || !input.trim()}
                    className="repo-submit-btn"
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 24px',
                      backgroundColor: isWorking || !input.trim() ? '#ccc' : '#3a7a3a',
                      color: isWorking || !input.trim() ? '#888' : '#fff',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.06em',
                      border: 'none',
                      borderLeft: '2px solid #2a2a2a',
                      cursor: isWorking || !input.trim() ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isWorking ? (
                      <>
                        <span className="spin-indicator">⟳</span>
                        <span>INSPECTING…</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.75rem' }}>▶</span>
                        <span>INSPECT REPOSITORY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Validation error */}
                {valErr && (
                  <div
                    role="alert"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '12px',
                      padding: '10px 14px',
                      backgroundColor: '#fff0f0',
                      border: '2px solid #cc4444',
                      borderRadius: '3px',
                      color: '#cc4444',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.72rem',
                      lineHeight: 1.4,
                    }}
                  >
                    <span>⚠️</span>
                    {valErr}
                  </div>
                )}
              </form>

              {/* Examples list */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.68rem',
                    color: '#666',
                    letterSpacing: '0.04em',
                  }}
                >
                  EXAMPLES:
                </span>
                {SAMPLE_EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => {
                      setInput(ex.value)
                      setValErr('')
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#333',
                      background: '#fff',
                      border: '1px solid #aaa',
                      borderRadius: '2px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              {/* ── Status: Loading User Repos ── */}
              {state === 'loading_repos' && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '24px',
                    backgroundColor: '#f8f8f5',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.78rem',
                      color: '#111',
                      marginBottom: '8px',
                    }}
                  >
                    Querying GitHub public repositories for @{selectedUsername}…
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#666' }}>
                    Connecting to GitHub REST API without requiring your password or personal credentials.
                  </div>
                </div>
              )}

              {/* ── Status: Selecting Repo from Username ── */}
              {state === 'selecting_repo' && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    boxShadow: '3px 3px 0 #2a2a2a',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.75rem',
                        color: '#111',
                        letterSpacing: '0.04em',
                      }}
                    >
                      PUBLIC REPOSITORIES FOR @{selectedUsername.toUpperCase()} ({userRepos.length})
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#666' }}>
                      Select a repository to start security inspection:
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '12px',
                      maxHeight: '340px',
                      overflowY: 'auto',
                      paddingRight: '6px',
                    }}
                  >
                    {userRepos.map((r) => (
                      <div
                        key={r.full_name}
                        style={{
                          padding: '14px',
                          border: '2px solid #2a2a2a',
                          borderRadius: '3px',
                          backgroundColor: '#fbfbf8',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              color: '#111',
                              wordBreak: 'break-all',
                            }}
                          >
                            {r.name}
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.72rem',
                              color: '#666',
                              marginTop: '4px',
                              lineHeight: 1.4,
                            }}
                          >
                            {r.description}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#777' }}>
                            ★ {r.stars} · {r.language}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSelectRepo(r.full_name)}
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '0.68rem',
                              color: '#fff',
                              backgroundColor: '#3a7a3a',
                              border: '1px solid #2a2a2a',
                              padding: '6px 12px',
                              borderRadius: '2px',
                              cursor: 'pointer',
                              letterSpacing: '0.04em',
                            }}
                          >
                            INSPECT →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Status: Scan in Progress ── */}
              {state === 'scanning' && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '24px 20px',
                    backgroundColor: '#f8f8f5',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    boxShadow: '3px 3px 0 #2a2a2a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#3a7a3a',
                        borderRadius: '2px',
                        animation: 'pulse 1s ease-in-out infinite',
                      }}
                    />
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.78rem',
                        color: '#111',
                        letterSpacing: '0.04em',
                      }}
                    >
                      SECURITY HEALTH CHECK IN PROGRESS…
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#444',
                      marginBottom: '16px',
                    }}
                  >
                    {scanStatus?.progress_message || 'Inspecting repository source files and dependency manifests…'}
                  </div>

                  {/* Engine telemetry indicators */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <EngineStatusBadge label="Gitleaks Secrets" active={true} />
                    <EngineStatusBadge label="Semgrep SAST" active={true} />
                    <EngineStatusBadge label="OSV Vulnerabilities" active={true} />
                    <EngineStatusBadge label="AI Remediation" active={true} />
                  </div>
                </div>
              )}

              {/* ── Status: Error / Rate limit ── */}
              {state === 'error' && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '18px 20px',
                    backgroundColor: '#fff0f0',
                    border: '2px solid #cc2222',
                    borderRadius: '3px',
                    boxShadow: '3px 3px 0 #cc2222',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.75rem',
                      color: '#cc2222',
                      letterSpacing: '0.04em',
                      marginBottom: '6px',
                    }}
                  >
                    INSPECTION HALTED
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#333', lineHeight: 1.6 }}>
                    {errorMessage}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      marginTop: '12px',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.7rem',
                      color: '#fff',
                      backgroundColor: '#cc2222',
                      border: '1px solid #2a2a2a',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    ← TRY AGAIN
                  </button>
                </div>
              )}

              {/* ── Status: Backend Offline / Unavailable ── */}
              {state === 'unavailable' && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '18px 20px',
                    backgroundColor: '#fefbf0',
                    border: '2px solid #c8952a',
                    borderRadius: '3px',
                    boxShadow: '3px 3px 0 #c8952a',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.75rem',
                      color: '#8B6914',
                      letterSpacing: '0.04em',
                      marginBottom: '6px',
                    }}
                  >
                    REPOSITORY SCANNER SERVICE OFFLINE
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                    The backend security engine is currently disconnected or initializing. Please ensure the backend is running on port 8000.
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      marginTop: '12px',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.7rem',
                      color: '#fff',
                      backgroundColor: '#8B6914',
                      border: '1px solid #2a2a2a',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    RETRY CONNECTION
                  </button>
                </div>
              )}

              {/* Footer row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #ddd',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.72rem',
                    color: '#888',
                  }}
                >
                  No password required. Public repository analysis only. Never executes arbitrary code.
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.68rem',
                    color: '#555',
                    letterSpacing: '0.04em',
                  }}
                >
                  POWERED BY GITLEAKS · SEMGREP · OSV
                </span>
              </div>
            </div>
          </div>
        

        {/* ── Completed: Final Report with prominently mapped Warrior ── */}
        {state === 'completed' && reportData && (
          <RepoReport
            report={reportData}
            onReset={handleReset}
          />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-indicator {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @media (max-width: 760px) {
          .repo-terminal-wrapper {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 580px) {
          .repo-input-group {
            flex-direction: column !important;
            overflow: visible !important;
          }
          .repo-submit-btn {
            width: 100% !important;
            padding: 14px 20px !important;
            border-left: none !important;
            border-top: 2px solid #2a2a2a !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  )
}

function EngineStatusBadge({ label, active }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        backgroundColor: '#fff',
        border: '1px solid #2a2a2a',
        borderRadius: '3px',
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.68rem',
        color: active ? '#3a7a3a' : '#777',
      }}
    >
      <span style={{ fontSize: '0.6rem' }}>●</span>
      <span>{label}</span>
    </div>
  )
}

function GitHubMiniPixelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

import { useState, useEffect } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Globe,
  Clock,
  Loader2,
} from 'lucide-react'
import { getShareReport } from '../services/shareService'
import { downloadPdf } from '../utils/pdfGenerator'
import { generateReportImageBlob, downloadImage } from '../utils/imageGenerator'

export default function PublicReportView({ shareId, onNavigateHome }) {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [errorState, setErrorState] = useState(null) // null | 'not_found' | 'revoked' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!shareId) {
      setErrorState('not_found')
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorState(null)

    getShareReport(shareId)
      .then((res) => {
        if (res.data) {
          setReport(res.data)
        } else if (res.status === 410) {
          setErrorState('revoked')
        } else if (res.status === 404) {
          setErrorState('not_found')
        } else {
          setErrorState('error')
          setErrorMessage(res.error || 'Failed to retrieve shared report.')
        }
      })
      .catch((err) => {
        if (err.status === 410) setErrorState('revoked')
        else if (err.status === 404) setErrorState('not_found')
        else {
          setErrorState('error')
          setErrorMessage(err.message || 'Failed to connect to report server.')
        }
      })
      .finally(() => setLoading(false))
  }, [shareId])

  const handleDownloadPdf = () => {
    if (!report) return
    downloadPdf(report, `RAVEN-Public-Report-${shareId}.pdf`)
  }

  const handleDownloadCard = () => {
    if (!report) return
    generateReportImageBlob(report).then((blob) => {
      downloadImage(blob, `RAVEN-Public-Card-${shareId}.png`)
    })
  }

  const handleHomeClick = () => {
    if (onNavigateHome) onNavigateHome()
    else {
      window.history.pushState({}, '', '/')
      window.location.reload()
    }
  }

  // ── Loading Screen ──
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '3px solid #2a2a2a',
            borderRadius: '4px',
            boxShadow: '6px 6px 0 #2a2a2a',
            padding: '32px 40px',
            textAlign: 'center',
            maxWidth: '420px',
          }}
        >
          <Loader2 size={32} className="animate-spin" color="#3a7a3a" style={{ margin: '0 auto 16px auto' }} />
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: '#1a1a1a', marginBottom: '8px' }}>
            DECRYPTING REPORT DOSSIER
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            Retrieving verified security telemetry for {shareId}...
          </div>
        </div>
      </div>
    )
  }

  // ── Revoked Screen ──
  if (errorState === 'revoked') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '3px solid #cc2222',
            borderRadius: '4px',
            boxShadow: '6px 6px 0 #cc2222',
            padding: '32px 36px',
            textAlign: 'center',
            maxWidth: '480px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#fff0f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid #cc2222',
            }}
          >
            <ShieldAlert size={28} color="#cc2222" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.9rem', color: '#cc2222', margin: '0 0 10px 0' }}>
            REPORT LINK REVOKED
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#555', lineHeight: 1.55, margin: '0 0 20px 0' }}>
            The public share link for <strong>{shareId}</strong> has been deactivated by its owner. Access to this security evaluation is no longer available.
          </p>
          <button
            type="button"
            onClick={handleHomeClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.68rem',
              backgroundColor: '#3a7a3a',
              color: '#ffffff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              padding: '10px 18px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 #2a2a2a',
            }}
          >
            <ArrowLeft size={14} />
            SCAN A WEBSITE ON RAVEN
          </button>
        </div>
      </div>
    )
  }

  // ── Not Found Screen ──
  if (errorState === 'not_found' || !report) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '3px solid #2a2a2a',
            borderRadius: '4px',
            boxShadow: '6px 6px 0 #2a2a2a',
            padding: '32px 36px',
            textAlign: 'center',
            maxWidth: '480px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid #2a2a2a',
            }}
          >
            <AlertTriangle size={28} color="#d97706" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.88rem', color: '#1a1a1a', margin: '0 0 10px 0' }}>
            REPORT NOT FOUND
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#555', lineHeight: 1.55, margin: '0 0 20px 0' }}>
            No security investigation record was found matching ID <strong>{shareId}</strong>. The link may have expired or been entered incorrectly.
          </p>
          <button
            type="button"
            onClick={handleHomeClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.68rem',
              backgroundColor: '#3a7a3a',
              color: '#ffffff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              padding: '10px 18px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 #2a2a2a',
            }}
          >
            <ArrowLeft size={14} />
            VISIT RAVEN SECURITY PLATFORM
          </button>
        </div>
      </div>
    )
  }

  // ── Successful Report View ──
  const score = report.score || 0
  const riskCat = String(report.risk_category || 'Clean / Safe').toUpperCase()
  const scoreColor = riskCat.includes('CRITICAL') || score >= 75 ? '#cc2222'
    : riskCat.includes('HIGH') || score >= 50 ? '#e67e22'
    : riskCat.includes('MOD') || score >= 25 ? '#c8952a'
    : '#2b772b'

  const scoreBg = riskCat.includes('CRITICAL') || score >= 75 ? '#fff0f0'
    : riskCat.includes('HIGH') || score >= 50 ? '#fff6ed'
    : riskCat.includes('MOD') || score >= 25 ? '#fffbf0'
    : '#eef8ee'

  const findings = report.findings || []
  const incidentSummary = report.incident_summary || { total: findings.length, critical: 0, high: 0, medium: 0, low: 0 }
  const domainIntel = report.domain_intelligence || {}

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f0',
        padding: 'clamp(16px, 4vw, 36px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '860px' }}>
        {/* ── Top Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1rem',
                color: '#2a2a2a',
                letterSpacing: '0.06em',
              }}
            >
              RAVEN
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontFamily: 'var(--font-pixel)',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '2px',
              }}
            >
              PUBLIC DOSSIER
            </span>
          </div>

          <button
            type="button"
            onClick={handleHomeClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.65rem',
              backgroundColor: '#ffffff',
              color: '#2a2a2a',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              padding: '6px 14px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #2a2a2a',
            }}
          >
            <ArrowLeft size={12} />
            SCAN YOUR WEBSITE
          </button>
        </div>

        {/* ── Main Report Card ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '3px solid #2a2a2a',
            borderRadius: '4px',
            boxShadow: '8px 8px 0 #2a2a2a',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Header Strip */}
          <div
            style={{
              backgroundColor: '#1c241e',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.78rem', color: '#78c978', marginBottom: '4px' }}>
                WEBSITE SECURITY INVESTIGATION REPORT
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#bbb' }}>
                SHARE ID: {report.share_id}  |  AUDITED: {new Date(report.timestamp).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleDownloadPdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#3a7a3a',
                  color: '#ffffff',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.62rem',
                  padding: '7px 12px',
                  border: '1px solid #78c978',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                <FileText size={12} />
                PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadCard}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.62rem',
                  padding: '7px 12px',
                  border: '1px solid #2a2a2a',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                <Download size={12} />
                PNG CARD
              </button>
            </div>
          </div>

          {/* Scanned URL Callout */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#f8f8f4',
              borderBottom: '2px solid #2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="#555" />
              <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#111' }}>
                {report.url}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.65rem',
                backgroundColor: scoreColor,
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '3px',
              }}
            >
              {riskCat}
            </div>
          </div>

          {/* Score & Posture Box */}
          <div style={{ padding: '24px 20px', borderBottom: '2px solid #2a2a2a' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 220px) 1fr',
                gap: '20px',
                alignItems: 'center',
              }}
            >
              {/* Score Tile */}
              <div
                style={{
                  backgroundColor: scoreBg,
                  border: `2px solid ${scoreColor}`,
                  borderRadius: '3px',
                  padding: '18px 12px',
                  textAlign: 'center',
                  boxShadow: '3px 3px 0 #2a2a2a',
                }}
              >
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.62rem', color: '#555', marginBottom: '6px' }}>
                  OVERALL RISK SCORE
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.6rem', color: scoreColor, lineHeight: 1 }}>
                  {score}
                </div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#777', marginTop: '4px' }}>
                  / 100 MAXIMUM
                </div>
              </div>

              {/* Assessment Explanation */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.78rem',
                    color: scoreColor,
                    margin: '0 0 8px 0',
                  }}
                >
                  {report.detection_status || 'VERIFIED EVALUATION'}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#333', lineHeight: 1.55, margin: '0 0 12px 0' }}>
                  {report.explanation}
                </p>
                {report.recommended_action && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#444',
                      backgroundColor: '#f5f5f0',
                      padding: '8px 12px',
                      borderRadius: '3px',
                      borderLeft: `3px solid ${scoreColor}`,
                    }}
                  >
                    <strong>Recommended Action:</strong> {report.recommended_action}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#fafaf8',
              borderBottom: '2px solid #2a2a2a',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ border: '1px solid #2a2a2a', padding: '10px', borderRadius: '3px', backgroundColor: '#fff', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem', color: '#777', marginBottom: '4px' }}>TOTAL FINDINGS</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: '#2a2a2a' }}>{incidentSummary.total || 0}</div>
            </div>
            <div style={{ border: '1px solid #2a2a2a', padding: '10px', borderRadius: '3px', backgroundColor: '#fff', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem', color: '#777', marginBottom: '4px' }}>CRITICAL ALERTS</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: '#cc2222' }}>{incidentSummary.critical || 0}</div>
            </div>
            <div style={{ border: '1px solid #2a2a2a', padding: '10px', borderRadius: '3px', backgroundColor: '#fff', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem', color: '#777', marginBottom: '4px' }}>TLS SECURITY</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.72rem', color: domainIntel.ssl_valid ? '#2b772b' : '#cc2222', marginTop: '6px' }}>
                {domainIntel.ssl_valid ? 'VALID TLS' : 'INSECURE'}
              </div>
            </div>
            <div style={{ border: '1px solid #2a2a2a', padding: '10px', borderRadius: '3px', backgroundColor: '#fff', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem', color: '#777', marginBottom: '4px' }}>SAFE BROWSING</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.72rem', color: '#2b772b', marginTop: '6px' }}>VERIFIED</div>
            </div>
          </div>

          {/* Findings List */}
          <div style={{ padding: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.72rem', color: '#2a2a2a', margin: '0 0 14px 0' }}>
              SECURITY INCIDENTS & FINDINGS
            </h4>

            {findings.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#eef8ee',
                  border: '1px solid #2b772b',
                  borderRadius: '3px',
                  fontSize: '0.82rem',
                  color: '#2b772b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={18} />
                <span>Zero threats or deceptive routing patterns detected during this investigation.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {findings.map((finding, idx) => {
                  const isCrit = finding.severity === 'CRITICAL'
                  const isHigh = finding.severity === 'HIGH'
                  const badgeColor = isCrit ? '#cc2222' : isHigh ? '#e67e22' : '#c8952a'

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#fbfbf9',
                        border: '1px solid #dcdcd4',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '0.58rem',
                          backgroundColor: badgeColor,
                          color: '#fff',
                          padding: '3px 7px',
                          borderRadius: '2px',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {finding.severity || 'ALERT'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 'bold', color: '#222', marginBottom: '2px' }}>
                          {finding.title}
                        </div>
                        {finding.description && (
                          <div style={{ fontSize: '0.78rem', color: '#666' }}>
                            {finding.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── AI Refined Intelligence Briefing (if available) ── */}
            {report.ai_refinement?.refined_report && (
              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '2px solid #2a2a2a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.72rem', color: '#2b772b' }}>
                    ◆ AI INTELLIGENCE BRIEFING
                  </div>
                  <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-pixel)', backgroundColor: '#edf8ec', color: '#2b772b', border: '1px solid #2b772b', padding: '2px 6px', borderRadius: '2px' }}>
                    ✨ AI REFINED // NEURAL ENGINE
                  </span>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #2a2a2a', padding: '12px 14px', borderRadius: '3px', marginBottom: '10px' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem', color: '#2b772b', marginBottom: '4px' }}>EXECUTIVE SUMMARY</div>
                  <p style={{ fontSize: '0.82rem', color: '#222', lineHeight: 1.5, margin: 0 }}>
                    {report.ai_refinement.refined_report.executive_summary}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer Footer */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#f5f5f0',
              borderTop: '1px solid #dcdcd4',
              fontSize: '0.7rem',
              color: '#777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span>Snapshot generated automatically by RAVEN Security Platform.</span>
            <span>https://raven-security.vercel.app</span>
          </div>
        </div>
      </div>
    </div>
  )
}

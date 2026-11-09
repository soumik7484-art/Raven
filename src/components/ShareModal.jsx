import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Copy,
  Share2,
  Trash2,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { downloadPdf, generatePdfBlob } from '../utils/pdfGenerator'
import { generateReportImageBlob, downloadImage } from '../utils/imageGenerator'
import { createShareReport, revokeShareReport } from '../services/shareService'

export default function ShareModal({ isOpen, onClose, reportData, targetUrl }) {
  const [activeTab, setActiveTab] = useState('pdf') // 'pdf' | 'link' | 'image'
  const [copied, setCopied] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isRevokingLink, setIsRevokingLink] = useState(false)
  const [shareId, setShareId] = useState(null)
  const [shareUrl, setShareUrl] = useState(null)
  const [shareError, setShareError] = useState(null)
  const [previewImageBlob, setPreviewImageBlob] = useState(null)
  const [previewImageUrl, setPreviewImageUrl] = useState(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const url = targetUrl || reportData?.url || reportData?.submitted_url || 'https://unknown-target.com'
  const scanId = reportData?.scan_id || `RVN-${Date.now().toString(36).toUpperCase()}`

  // Extract score & category safely
  const finalRisk = reportData?.final_risk_report || {}
  const score = typeof reportData?.score === 'number'
    ? reportData.score
    : (typeof finalRisk.overall_risk_score === 'number' ? finalRisk.overall_risk_score : 0)

  const riskCategory = finalRisk.risk_category || reportData?.risk_category || (score >= 75 ? 'Critical Risk' : score >= 50 ? 'High Risk' : score >= 25 ? 'Moderate Risk' : 'Clean / Safe')
  const explanation = reportData?.explanation || finalRisk.explanation || 'Security investigation completed.'
  const incidentSummary = reportData?.incident_summary || { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
  const incidents = reportData?.findings || reportData?.incidents || []
  const recommendedAction = reportData?.recommended_action || finalRisk.recommendation || 'Safe to proceed with normal browsing awareness.'

  // Prepare normalized report payload for PDF / Image / Sharing
  const exportPayload = {
    url,
    scanId,
    timestamp: reportData?.timestamp || new Date().toISOString(),
    score,
    riskCategory,
    classification: reportData?.classification || 'safe',
    explanation,
    incidentSummary,
    incidents,
    recommendedAction,
  }

  // Pre-generate preview image when switching to 'image' tab
  useEffect(() => {
    if (activeTab === 'image' && !previewImageBlob && !isGeneratingImage) {
      setIsGeneratingImage(true)
      generateReportImageBlob(exportPayload)
        .then((blob) => {
          setPreviewImageBlob(blob)
          setPreviewImageUrl(URL.createObjectURL(blob))
        })
        .catch((err) => console.error('Failed to generate image preview:', err))
        .finally(() => setIsGeneratingImage(false))
    }
  }, [activeTab])

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl)
    }
  }, [previewImageUrl])

  // Lock background scrolling cleanly while modal is open, with zero layout shift
  useEffect(() => {
    if (!isOpen) return

    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyPaddingRight = document.body.style.paddingRight

    // Prevent layout shift from scrollbar disappearing on Windows/Linux laptops
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalBodyPaddingRight
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // ── Actions ──

  const handleDownloadPdf = () => {
    downloadPdf(exportPayload, `RAVEN-Security-Report-${scanId}.pdf`)
  }

  const handleSharePdf = async () => {
    try {
      const blob = generatePdfBlob(exportPayload)
      const file = new File([blob], `RAVEN-Security-Report-${scanId}.pdf`, { type: 'application/pdf' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `RAVEN Security Audit: ${url}`,
          text: `Website Security Investigation Report for ${url} (Score: ${score}/100 - ${riskCategory})`,
          files: [file],
        })
      } else {
        handleDownloadPdf()
      }
    } catch (err) {
      if (err.name !== 'AbortError') handleDownloadPdf()
    }
  }

  const getFullShareUrl = (rawUrl, id) => {
    if (!rawUrl && !id) return ''
    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      return rawUrl
    }
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''
    const sharePath = rawUrl ? (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`) : `/report/${id}`
    return `${origin}${sharePath}`
  }

  const handleCreateShareLink = async () => {
    setIsGeneratingLink(true)
    setShareError(null)

    try {
      const res = await createShareReport({
        scanId,
        targetUrl: url,
        reportData: reportData || exportPayload,
      })
      if (res.data?.success) {
        const id = res.data.share_id || scanId
        const fullUrl = getFullShareUrl(res.data.share_url, id)
        setShareId(id)
        setShareUrl(fullUrl)
      } else {
        setShareError(res.error || 'Failed to generate public link. Please try again.')
      }
    } catch (err) {
      setShareError(err.message || 'Network error generating link.')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    let succeeded = false

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        succeeded = true
      }
    } catch {
      succeeded = false
    }

    if (!succeeded) {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        textArea.style.top = '-9999px'
        textArea.setAttribute('readonly', '')
        document.body.appendChild(textArea)
        textArea.select()
        succeeded = document.execCommand('copy')
        document.body.removeChild(textArea)
      } catch {
        succeeded = false
      }
    }

    if (succeeded) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareLinkNative = async () => {
    if (!shareUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `RAVEN Security Audit: ${url}`,
          text: `Check out the verified cybersecurity evaluation for ${url}:`,
          url: shareUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleRevokeLink = async () => {
    if (!shareId) return
    const confirmed = window.confirm('Are you sure you want to deactivate and revoke this public share link? Visitors will no longer be able to access it.')
    if (!confirmed) return

    setIsRevokingLink(true)
    try {
      const res = await revokeShareReport(shareId)
      if (res.data?.success) {
        setShareId(null)
        setShareUrl(null)
      } else {
        alert(res.error || 'Failed to revoke link.')
      }
    } catch (err) {
      alert(err.message || 'Failed to revoke link.')
    } finally {
      setIsRevokingLink(false)
    }
  }

  const handleDownloadImage = () => {
    if (previewImageBlob) {
      downloadImage(previewImageBlob, `RAVEN-Card-${scanId}.png`)
    } else {
      generateReportImageBlob(exportPayload).then((blob) => {
        downloadImage(blob, `RAVEN-Card-${scanId}.png`)
      })
    }
  }

  const handleShareImage = async () => {
    try {
      let blob = previewImageBlob
      if (!blob) blob = await generateReportImageBlob(exportPayload)
      const file = new File([blob], `RAVEN-Card-${scanId}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `RAVEN Security Audit: ${url}`,
          text: `Verified Website Security Report for ${url} (Score: ${score}/100 - ${riskCategory})`,
          files: [file],
        })
      } else {
        handleDownloadImage()
      }
    } catch (err) {
      if (err.name !== 'AbortError') handleDownloadImage()
    }
  }

  const modalJSX = (
    <div
      className="raven-share-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: 'rgba(15, 20, 15, 0.78)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(10px, 2.5vh, 24px) clamp(10px, 2vw, 20px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        animation: 'ravenModalFadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="raven-share-modal-dialog"
        style={{
          margin: 'auto',
          width: 'min(92vw, 600px)',
          maxWidth: '100%',
          maxHeight: 'min(88vh, calc(100vh - 32px))',
          backgroundColor: '#ffffff',
          border: '3px solid #2a2a2a',
          borderRadius: '4px',
          boxShadow: '6px 6px 0 #2a2a2a',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxSizing: 'border-box',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #2a2a2a',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={16} color="#78c978" />
            <span
              id="share-modal-title"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                color: '#ffffff',
              }}
            >
              SHARE SECURITY REPORT
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              minWidth: '34px',
              minHeight: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              flexShrink: 0,
              borderRadius: '3px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Target Sub-banner ── */}
        <div
          style={{
            backgroundColor: '#f5f5f0',
            borderBottom: '1px solid #dcdcd4',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: '#444',
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, fontSize: 'clamp(0.68rem, 2.2vw, 0.75rem)' }}>
            Target: <strong>{url}</strong>
          </span>
          <span
            style={{
              padding: '2px 6px',
              backgroundColor: score >= 75 ? '#cc2222' : score >= 50 ? '#e67e22' : score >= 25 ? '#c8952a' : '#2b772b',
              color: '#fff',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-pixel)',
              borderRadius: '2px',
              flexShrink: 0,
            }}
          >
            {score}/100
          </span>
        </div>

        {/* ── Tabs Header (3 Options) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderBottom: '2px solid #2a2a2a',
            backgroundColor: '#eaeae4',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            style={{
              padding: '12px 8px',
              backgroundColor: activeTab === 'pdf' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRight: '1px solid #2a2a2a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.1s ease',
              minWidth: 0,
            }}
          >
            <FileText size={16} color={activeTab === 'pdf' ? '#3a7a3a' : '#666'} />
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(0.52rem, 2.2vw, 0.62rem)',
                color: activeTab === 'pdf' ? '#111' : '#666',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              PDF REPORT
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            style={{
              padding: '12px 8px',
              backgroundColor: activeTab === 'link' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRight: '1px solid #2a2a2a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.1s ease',
              minWidth: 0,
            }}
          >
            <LinkIcon size={16} color={activeTab === 'link' ? '#3a7a3a' : '#666'} />
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(0.52rem, 2.2vw, 0.62rem)',
                color: activeTab === 'link' ? '#111' : '#666',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              PUBLIC LINK
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            style={{
              padding: '12px 8px',
              backgroundColor: activeTab === 'image' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.1s ease',
              minWidth: 0,
            }}
          >
            <ImageIcon size={16} color={activeTab === 'image' ? '#3a7a3a' : '#666'} />
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(0.52rem, 2.2vw, 0.62rem)',
                color: activeTab === 'image' ? '#111' : '#666',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              SOCIAL CARD
            </span>
          </button>
        </div>

        {/* ── Tab Content (Independently Scrollable with minHeight: 0) ── */}
        <div
          className="raven-share-modal-body"
          style={{
            padding: '20px 20px',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            minHeight: 0, // CRITICAL: allows flex child to shrink and scroll
            boxSizing: 'border-box',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* ════ Option A: Download PDF ════ */}
          {activeTab === 'pdf' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: '#eef6ee',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} color="#3a7a3a" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.74rem', margin: '0 0 6px 0', color: '#1a1a1a' }}>
                    PROFESSIONAL AUDIT PDF
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#555', lineHeight: 1.45 }}>
                    Generate an official, printable cybersecurity dossier containing the verified security score, incident breakdown, telemetry logs, and remediation guidance.
                  </p>
                </div>
              </div>

              {/* PDF Preview Snapshot Details Box */}
              <div
                style={{
                  backgroundColor: '#fbfbf8',
                  border: '1px solid #d0d0c8',
                  borderRadius: '3px',
                  padding: '12px 14px',
                  marginBottom: '20px',
                  fontSize: '0.78rem',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.62rem', color: '#666', marginBottom: '8px' }}>
                  INCLUDED IN THIS DOCUMENT:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '6px', color: '#333' }}>
                  <div>✓ Executive Risk Score ({score}/100)</div>
                  <div>✓ Risk Category ({riskCategory})</div>
                  <div>✓ Authoritative Safe Browsing</div>
                  <div>✓ Domain & TLS Validation</div>
                  <div>✓ {incidentSummary.total || 0} Detected Security Findings</div>
                  <div>✓ Remediation Playbook</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  style={{
                    flex: 1,
                    minWidth: 'min(100%, 160px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#3a7a3a',
                    color: '#ffffff',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.68rem',
                    padding: '12px 16px',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0 #2a2a2a',
                    transition: 'all 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#458f45'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3a7a3a'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Download size={14} />
                  DOWNLOAD PDF
                </button>

                {navigator.share && (
                  <button
                    type="button"
                    onClick={handleSharePdf}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#ffffff',
                      color: '#2a2a2a',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.68rem',
                      padding: '12px 16px',
                      border: '2px solid #2a2a2a',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      boxShadow: '3px 3px 0 #2a2a2a',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <Share2 size={14} />
                    DEVICE SHARE
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ════ Option B: Public Share Link ════ */}
          {activeTab === 'link' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: '#f5f0fa',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LinkIcon size={22} color="#7c3aed" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.74rem', margin: '0 0 6px 0', color: '#1a1a1a' }}>
                    PUBLIC SHAREABLE URL
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#555', lineHeight: 1.45 }}>
                    Create an unguessable public link to this security evaluation. Only sanitized summary findings are visible—credentials and internal tokens are never shared.
                  </p>
                </div>
              </div>

              {shareError && (
                <div
                  style={{
                    backgroundColor: '#fff0f0',
                    border: '1px solid #cc2222',
                    borderRadius: '3px',
                    padding: '8px 12px',
                    marginBottom: '14px',
                    fontSize: '0.75rem',
                    color: '#cc2222',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{shareError}</span>
                </div>
              )}

              {!shareUrl ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <button
                    type="button"
                    onClick={handleCreateShareLink}
                    disabled={isGeneratingLink}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#3a7a3a',
                      color: '#ffffff',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.7rem',
                      padding: '12px 22px',
                      border: '2px solid #2a2a2a',
                      borderRadius: '3px',
                      cursor: isGeneratingLink ? 'wait' : 'pointer',
                      boxShadow: '3px 3px 0 #2a2a2a',
                    }}
                  >
                    {isGeneratingLink ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        GENERATING SECURE LINK...
                      </>
                    ) : (
                      <>
                        <LinkIcon size={14} />
                        CREATE PUBLIC SHARE LINK
                      </>
                    )}
                  </button>
                  <p style={{ fontSize: '0.72rem', color: '#888', marginTop: '10px' }}>
                    Public reports are viewable by anyone with the link. You can revoke it anytime.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.62rem', color: '#666', marginBottom: '6px' }}>
                      YOUR PUBLIC REPORT LINK:
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        border: '2px solid #2a2a2a',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        boxShadow: '2px 2px 0 #2a2a2a',
                        maxWidth: '100%',
                      }}
                    >
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        onClick={(e) => e.target.select()}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px 12px',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: '#f5f5f0',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          color: '#222',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0 16px',
                          backgroundColor: copied ? '#2b772b' : '#ffffff',
                          color: copied ? '#ffffff' : '#222222',
                          border: 'none',
                          borderLeft: '2px solid #2a2a2a',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '0.64rem',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => window.open(shareUrl, '_blank')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ffffff',
                        border: '2px solid #2a2a2a',
                        borderRadius: '3px',
                        padding: '8px 12px',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-pixel)',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0 #2a2a2a',
                      }}
                    >
                      <ExternalLink size={12} />
                      PREVIEW PAGE
                    </button>

                    {navigator.share && (
                      <button
                        type="button"
                        onClick={handleShareLinkNative}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#ffffff',
                          border: '2px solid #2a2a2a',
                          borderRadius: '3px',
                          padding: '8px 12px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-pixel)',
                          cursor: 'pointer',
                          boxShadow: '2px 2px 0 #2a2a2a',
                        }}
                      >
                        <Share2 size={12} />
                        DEVICE SHARE
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRevokeLink}
                      disabled={isRevokingLink}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#fff0f0',
                        color: '#cc2222',
                        border: '2px solid #cc2222',
                        borderRadius: '3px',
                        padding: '8px 12px',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-pixel)',
                        cursor: isRevokingLink ? 'wait' : 'pointer',
                        marginLeft: 'auto',
                      }}
                    >
                      <Trash2 size={12} />
                      REVOKE LINK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ Option C: Share Summary Image ════ */}
          {activeTab === 'image' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: '#fff7ed',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ImageIcon size={22} color="#ea580c" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.74rem', margin: '0 0 6px 0', color: '#1a1a1a' }}>
                    HIGH-RESOLUTION SOCIAL CARD
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#555', lineHeight: 1.45 }}>
                    Generate an attractive 16:9 cybersecurity report-card image optimized for WhatsApp, Telegram, LinkedIn, and social feeds.
                  </p>
                </div>
              </div>

              {/* Image Preview Box */}
              <div
                style={{
                  backgroundColor: '#1c241e',
                  border: '2px solid #2a2a2a',
                  borderRadius: '3px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '140px',
                  maxHeight: 'min(280px, 35vh)',
                  boxShadow: '3px 3px 0 #2a2a2a',
                }}
              >
                {isGeneratingImage ? (
                  <div style={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'var(--font-pixel)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    RENDERING CARD...
                  </div>
                ) : previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Scan Summary Card"
                    style={{ width: '100%', height: '100%', maxHeight: 'min(280px, 35vh)', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div style={{ color: '#888', fontSize: '0.75rem' }}>Click below to generate image</div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  style={{
                    flex: 1,
                    minWidth: 'min(100%, 160px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#3a7a3a',
                    color: '#ffffff',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.68rem',
                    padding: '12px 16px',
                    border: '2px solid #2a2a2a',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0 #2a2a2a',
                    transition: 'all 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#458f45'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3a7a3a'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Download size={14} />
                  DOWNLOAD PNG
                </button>

                {navigator.share && (
                  <button
                    type="button"
                    onClick={handleShareImage}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#ffffff',
                      color: '#2a2a2a',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.68rem',
                      padding: '12px 16px',
                      border: '2px solid #2a2a2a',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      boxShadow: '3px 3px 0 #2a2a2a',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <Share2 size={14} />
                    SHARE CARD
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            backgroundColor: '#f5f5f0',
            borderTop: '2px solid #2a2a2a',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#666',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.58rem' }}>
            RAVEN // SECURITY ENGINE
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #2a2a2a',
              borderRadius: '2px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.62rem',
              color: '#333',
              cursor: 'pointer',
              boxShadow: '1.5px 1.5px 0 #2a2a2a',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f4f4ee'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ravenModalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .raven-share-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .raven-share-modal-body::-webkit-scrollbar-track {
          background: #f0f0ea;
        }
        .raven-share-modal-body::-webkit-scrollbar-thumb {
          background: #3a7a3a;
          border-radius: 2px;
        }
        .raven-share-modal-backdrop::-webkit-scrollbar {
          width: 6px;
        }
        .raven-share-modal-backdrop::-webkit-scrollbar-track {
          background: transparent;
        }
        .raven-share-modal-backdrop::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 3px;
        }
      `}</style>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null
}

/**
 * HowItWorks — HackMatrix
 *
 * Seven-stage investigation pipeline rendered as a connected visual journey.
 * Scroll-triggered animations: cards slide in from left/right, connector draws down.
 * Alternating left/right layout on desktop, single column on mobile.
 */

import { useEffect, useRef } from 'react'

const STAGES = [
  {
    num: '01',
    title: 'URL Submission',
    desc: 'Submit a website URL for a complete digital security investigation. The journey begins with a single address.',
    icon: <SubmitIcon />,
    color: '#527A50',
    badge: 'Input',
  },
  {
    num: '02',
    title: 'Validation & Safety',
    desc: 'The URL is validated, normalised, and checked for formatting. Safe request restrictions are applied before investigation begins.',
    icon: <ValidateIcon />,
    color: '#8B6914',
    badge: 'Checks',
  },
  {
    num: '03',
    title: 'Parallel Investigation',
    desc: 'Four independent security modules investigate simultaneously: ML Detection, Threat Intelligence, TLS & Domain, and Website Assessment.',
    icon: <ParallelIcon />,
    color: '#1A5E8A',
    badge: '4 Modules',
    modules: ['ML Detection', 'Threat Intel', 'TLS & Domain', 'Assessment'],
  },
  {
    num: '04',
    title: 'AI-Assisted Analysis',
    desc: 'An open-source AI model explains suspicious page content, possible impersonation, misleading login forms, and abnormal network requests.',
    icon: <AIIcon />,
    color: '#6C3483',
    badge: 'AI',
  },
  {
    num: '05',
    title: 'Risk Intelligence Engine',
    desc: 'Evidence is combined, conflicting signals reconciled, unavailable checks accounted for, and an explainable risk score calculated.',
    icon: <RiskIcon />,
    color: '#B7770D',
    badge: 'Scoring',
  },
  {
    num: '06',
    title: 'Investigation Report',
    desc: 'A full report displays the overall risk level, supporting evidence, individual module results, and actionable recommendations.',
    icon: <ReportIcon />,
    color: '#527A50',
    badge: 'Results',
  },
  {
    num: '07',
    title: 'Threat Intelligence Storage',
    desc: 'Scan history, investigation results, and community-verified threat reports are stored with appropriate privacy controls.',
    icon: <StorageIcon />,
    color: '#7F8C8D',
    badge: 'Archive',
  },
]

export default function HowItWorks() {
  const lineRef = useRef(null)
  const sectionRef = useRef(null)

  /* Animate the connector line height on scroll */
  useEffect(() => {
    const line = lineRef.current
    const section = sectionRef.current
    if (!line || !section) return

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const windowH = window.innerHeight
      // progress: 0 when top of section hits bottom of viewport → 1 when bottom of section hits top
      const progress = Math.min(
        1,
        Math.max(0, (windowH - rect.top) / (rect.height + windowH))
      )
      line.style.transform = `scaleY(${progress})`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      ref={sectionRef}
      style={{
        backgroundColor: 'var(--color-white)',
        paddingTop:    'clamp(4rem, 8vw, 6rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6rem)',
        scrollMarginTop: '64px',
      }}
    >
      <div className="section-container">
        {/* Section header */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.45rem',
            color: 'var(--color-stone-dark)',
            letterSpacing: '0.04em',
            wordSpacing: '-4px',
            marginBottom: '1rem',
          }}>
            <PixelBlock size={10} color="var(--color-earth)" />
            HOW IT WORKS
          </div>
          <h2
            id="how-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',
              fontWeight: 800,
              letterSpacing: '0',
              wordSpacing: '-4px',
              lineHeight: 1.3,
              color: 'var(--color-charcoal)',
              marginBottom: '1rem',
            }}
          >
            Seven Stages of<br />
            <span style={{ color: 'var(--color-forest)' }}>Digital Investigation</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            color: 'var(--color-muted)',
            lineHeight: 2,
          }}>
            Every URL submission triggers a multi-layer security investigation pipeline,
            from input to archived intelligence report.
          </p>
        </div>

        {/* Stages */}
        <div style={{ position: 'relative' }}>
          {/* Central connector line — animated via scaleY */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: '40px',
              bottom: '40px',
              width: '2px',
              backgroundColor: 'var(--color-border)',
              transform: 'translateX(-50%)',
              zIndex: 0,
            }}
            className="hide-on-mobile"
          >
            {/* Filled progress overlay */}
            <div
              ref={lineRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, var(--color-forest) 0%, var(--color-gold) 60%, var(--color-earth) 100%)',
                transformOrigin: 'top',
                transform: 'scaleY(0)',
                transition: 'transform 0.1s linear',
              }}
            />
          </div>

          {STAGES.map((stage, i) => (
            <StageCard key={stage.num} stage={stage} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .hide-on-mobile { display: none !important; }
          .stage-left, .stage-right {
            flex-direction: column !important;
            gap: 0 !important;
            margin-bottom: 1.5rem !important;
          }
          .stage-content-wrap {
            width: 100% !important;
            max-width: 600px !important;
            margin: 0 auto !important;
          }
          .stage-spacer { display: none !important; }
          .stage-desktop-icon { display: none !important; }
          .stage-mobile-icon { display: flex !important; }
        }

        /* Slide-in animation keyframes */
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        .stage-animate-left {
          opacity: 0;
        }
        .stage-animate-left.visible {
          animation: slideInLeft 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .stage-animate-right {
          opacity: 0;
        }
        .stage-animate-right.visible {
          animation: slideInRight 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .stage-animate-node {
          opacity: 0;
        }
        .stage-animate-node.visible {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .stage-animate-icon {
          opacity: 0;
        }
        .stage-animate-icon.visible {
          animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </section>
  )
}

/* ── Stage card with IntersectionObserver ── */
function StageCard({ stage, index }) {
  const isLeft = index % 2 === 0
  const { num, title, desc, icon, color, badge, modules } = stage

  const cardRef   = useRef(null)
  const nodeRef   = useRef(null)
  const iconRef   = useRef(null)

  useEffect(() => {
    const delay = `${index * 80}ms`

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reset then re-trigger animation by toggling the class
            const els = [
              { el: cardRef.current,  d: delay },
              { el: nodeRef.current,  d: `calc(${delay} + 100ms)` },
              { el: iconRef.current,  d: `calc(${delay} + 180ms)` },
            ]
            els.forEach(({ el, d }) => {
              if (!el) return
              el.classList.remove('visible')
              el.style.animationDelay = d
              // Force reflow so removing + re-adding the class restarts the animation
              void el.offsetWidth
              el.classList.add('visible')
            })
          } else {
            // Remove visible when element scrolls out so it re-animates next time
            ;[cardRef, nodeRef, iconRef].forEach(({ current }) => {
              if (current) current.classList.remove('visible')
            })
          }
        })
      },
      { threshold: 0.15 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [index])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        flexDirection: isLeft ? 'row' : 'row-reverse',
        position: 'relative',
        zIndex: 1,
      }}
      className={isLeft ? 'stage-left' : 'stage-right'}
    >
      {/* Content side */}
      <div className="stage-content-wrap" style={{ flex: 1 }}>
        <div
          ref={cardRef}
          className={isLeft ? 'stage-animate-left' : 'stage-animate-right'}
          style={{
            backgroundColor: 'var(--color-white)',
            border: '2px solid var(--color-border)',
            borderRadius: '10px',
            padding: '22px 24px',
            boxShadow: '0 4px 0 var(--color-border), var(--shadow-sm)',
            position: 'relative',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = `0 6px 0 ${color}55, var(--shadow-md)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 0 var(--color-border), var(--shadow-sm)'
          }}
        >
          {/* Card Top: Stage badge + mobile icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: color,
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.42rem',
              padding: '3px 10px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.42rem' }}>{num}</span>
              {badge.toUpperCase()}
            </div>

            {/* Mobile pixel icon */}
            <div
              className="stage-mobile-icon"
              style={{
                display: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-stone-light)',
                border: '2px solid var(--color-border)',
                boxShadow: '0 2px 0 var(--color-border)',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                {icon}
              </svg>
            </div>
          </div>

          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0',
            color: 'var(--color-charcoal)',
            marginBottom: '8px',
          }}>
            {title}
          </h3>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.52rem',
            color: 'var(--color-muted)',
            lineHeight: 2,
          }}>
            {desc}
          </p>

          {/* Module pills for stage 03 */}
          {modules && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {modules.map((m) => (
                <span key={m} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.42rem',
                  color: '#1A5E8A',
                  backgroundColor: '#EBF5FB',
                  border: '1px solid #AED6F1',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  letterSpacing: '0.04em',
                }}>
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Centre node — animated number badge */}
      <div
        ref={nodeRef}
        className="stage-spacer stage-animate-node"
        style={{
          flexShrink: 0,
          width: '52px',
          height: '52px',
          borderRadius: '6px',
          backgroundColor: color,
          border: '3px solid var(--color-white)',
          boxShadow: `0 0 0 2px ${color}40, var(--shadow-md)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1px',
          zIndex: 2,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.7rem',
          color: 'white',
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}>
          {num}
        </span>
      </div>

      {/* Icon side (desktop only) */}
      <div
        ref={iconRef}
        className="stage-desktop-icon stage-animate-icon"
        style={{ flex: 1, display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-stone-light)',
            border: '2px solid var(--color-border)',
            boxShadow: '0 4px 0 var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            {icon}
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Stage pixel icons (48×48 viewBox each)
   ───────────────────────────────────────────── */
function SubmitIcon() {
  return (
    <>
      <rect x="6"  y="8"  width="36" height="24" rx="2" fill="#527A50" />
      <rect x="8"  y="10" width="32" height="20" fill="#1A8A5A" />
      <rect x="8"  y="10" width="32" height="3"  fill="rgba(255,255,255,0.15)" />
      <rect x="11" y="16" width="20" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
      <rect x="11" y="21" width="14" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
      <rect x="11" y="26" width="18" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
      <polygon points="34,20 42,24 36,26 34,32 30,22" fill="white" opacity="0.9" />
      <rect x="20" y="32" width="8"  height="4" fill="#3F6040" />
      <rect x="16" y="36" width="16" height="3" rx="1" fill="#3F6040" />
    </>
  )
}

function ValidateIcon() {
  return (
    <>
      <rect x="8"  y="6"  width="32" height="36" rx="2" fill="#EDE5D6" stroke="#C8A87A" strokeWidth="2" />
      <rect x="16" y="2"  width="16" height="8"  rx="2" fill="#C8A87A" />
      <rect x="13" y="18" width="4" height="4" rx="1" fill="#527A50" />
      <rect x="20" y="19" width="16" height="2" rx="1" fill="#A89F92" />
      <rect x="13" y="26" width="4" height="4" rx="1" fill="#527A50" />
      <rect x="20" y="27" width="12" height="2" rx="1" fill="#A89F92" />
      <rect x="13" y="34" width="4" height="4" rx="1" fill="#E8B84B" />
      <rect x="20" y="35" width="14" height="2" rx="1" fill="#A89F92" />
      <path d="M14 20l1.5 1.5L17 18" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14 28l1.5 1.5L17 26" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </>
  )
}

function ParallelIcon() {
  return (
    <>
      <rect x="4"  y="4"  width="18" height="18" rx="2" fill="#1A5E8A" />
      <rect x="26" y="4"  width="18" height="18" rx="2" fill="#884EA0" />
      <rect x="4"  y="26" width="18" height="18" rx="2" fill="#E67E22" />
      <rect x="26" y="26" width="18" height="18" rx="2" fill="#1A6B3A" />
      <rect x="7"  y="10" width="12" height="2" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="7"  y="14" width="8"  height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="29" y="10" width="12" height="2" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="29" y="14" width="8"  height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="7"  y="32" width="12" height="2" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="7"  y="36" width="8"  height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="29" y="32" width="12" height="2" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="29" y="36" width="8"  height="2" rx="1" fill="rgba(255,255,255,0.5)" />
    </>
  )
}

function AIIcon() {
  return (
    <>
      <rect x="10" y="10" width="28" height="28" rx="14" fill="#6C3483" />
      <rect x="10" y="10" width="28" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
      <circle cx="18" cy="20" r="3" fill="white" opacity="0.9" />
      <circle cx="30" cy="20" r="3" fill="white" opacity="0.9" />
      <circle cx="24" cy="28" r="3" fill="white" opacity="0.9" />
      <line x1="18" y1="20" x2="30" y2="20" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="18" y1="20" x2="24" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="30" y1="20" x2="24" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <rect x="36" y="8"  width="4" height="4" fill="#E8B84B" />
      <rect x="8"  y="36" width="4" height="4" fill="#E8B84B" />
    </>
  )
}

function RiskIcon() {
  return (
    <>
      <path d="M24 4L6 12V24C6 34 14 42 24 44C34 42 42 34 42 24V12L24 4Z" fill="#B7770D" />
      <path d="M24 4L6 12V24C6 34 14 42 24 44C34 42 42 34 42 24V12L24 4Z" fill="rgba(255,255,255,0.08)" />
      <rect x="15" y="28" width="4" height="8"  rx="1" fill="rgba(255,255,255,0.6)" />
      <rect x="21" y="22" width="4" height="14" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="27" y="18" width="4" height="18" rx="1" fill="white" />
      <path d="M24 4L6 12" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    </>
  )
}

function ReportIcon() {
  return (
    <>
      <rect x="8" y="4" width="32" height="40" rx="2" fill="#FAFAF7" stroke="#C8BFB0" strokeWidth="2" />
      <rect x="8" y="4" width="32" height="8" rx="2" fill="#527A50" />
      <path d="M32 4L40 12H32V4Z" fill="rgba(0,0,0,0.15)" />
      <rect x="12" y="16" width="24" height="2" rx="1" fill="#C8BFB0" />
      <rect x="12" y="21" width="18" height="2" rx="1" fill="#C8BFB0" />
      <rect x="12" y="26" width="20" height="2" rx="1" fill="#C8BFB0" />
      <rect x="12" y="31" width="24" height="8" rx="2" fill="#DCE8D2" />
      <rect x="14" y="33" width="8" height="4" rx="1" fill="#527A50" />
      <rect x="24" y="34" width="10" height="2" rx="1" fill="#A5BD91" />
    </>
  )
}

function StorageIcon() {
  return (
    <>
      <ellipse cx="24" cy="10" rx="16" ry="6" fill="#95A5A6" />
      <rect x="8" y="10" width="32" height="10" fill="#7F8C8D" />
      <ellipse cx="24" cy="20" rx="16" ry="6" fill="#95A5A6" />
      <rect x="8" y="20" width="32" height="10" fill="#7F8C8D" />
      <ellipse cx="24" cy="30" rx="16" ry="6" fill="#95A5A6" />
      <rect x="19" y="12" width="10" height="8" rx="1" fill="white" opacity="0.9" />
      <path d="M21 12V10C21 8.3 22 7 24 7C26 7 27 8.3 27 10V12" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="16" r="2" fill="#7F8C8D" />
      <ellipse cx="24" cy="10" rx="16" ry="6" fill="rgba(255,255,255,0.15)" />
    </>
  )
}

function PixelBlock({ size, color }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <rect width={size} height={size} fill={color} />
      <rect width={size} height={Math.ceil(size / 4)} fill="rgba(255,255,255,0.25)" />
    </svg>
  )
}

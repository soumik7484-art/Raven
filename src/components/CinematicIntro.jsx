import { useRef, useEffect } from 'react'

/**
 * CinematicIntro — HackMatrix
 *
 * Full-screen cinematic video introduction shown when a visitor first arrives.
 * Plays landingpage1.mp4 without sound, freezes on the final frame, and provides
 * a clean 'ENTER HACKMATRIX →' continue button below the video.
 */
export default function CinematicIntro({ onEnter }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy fallback: video remains ready for user interaction
        console.warn('Autoplay paused by browser policy:', err)
      })
    }
  }, [])

  const handleEnded = () => {
    // Keep the final frame visible without showing black screen or looping
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  return (
    <div
      className="cinematic-intro-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#FAFAF7',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. Video Area (occupying 86–88% of viewport height) ── */}
      <div
        className="cinematic-video-wrap"
        style={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          height: '87vh',
          backgroundColor: '#0E140F',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          src="/landingpage1.mp4"
          autoPlay
          muted
          playsInline
          controls={false}
          preload="auto"
          loop={false}
          onEnded={handleEnded}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        >
          <source src="/landingpage1.mp4" type="video/mp4" />
          <source src="/landing page.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── 2. Clean bottom area with centered continue button ── */}
      <div
        className="cinematic-bottom-bar"
        style={{
          width: '100%',
          height: '13vh',
          minHeight: '76px',
          backgroundColor: '#FAFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          boxSizing: 'border-box',
          flexShrink: 0,
          borderTop: '1px solid rgba(44, 36, 22, 0.06)',
        }}
      >
        <button
          type="button"
          onClick={onEnter}
          className="enter-hackmatrix-btn"
          aria-label="Enter HackMatrix"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#2F522F',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display, "Manrope", sans-serif)',
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            padding: '13px 32px',
            borderRadius: '8px',
            border: '1.5px solid #233D23',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(47, 82, 47, 0.22)',
            transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
            textDecoration: 'none',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.filter = 'brightness(1.14)'
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(47, 82, 47, 0.32)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.filter = 'brightness(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(47, 82, 47, 0.22)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
        >
          ENTER HACKMATRIX →
        </button>
      </div>

      <style>{`
        @supports (height: 100dvh) {
          .cinematic-intro-root {
            height: 100dvh !important;
          }
          .cinematic-video-wrap {
            height: 87dvh !important;
          }
          .cinematic-bottom-bar {
            height: 13dvh !important;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
        @media (max-width: 600px) {
          .cinematic-video-wrap {
            height: 84vh !important;
          }
          @supports (height: 100dvh) {
            .cinematic-video-wrap {
              height: 84dvh !important;
            }
            .cinematic-bottom-bar {
              height: 16dvh !important;
            }
          }
          .cinematic-bottom-bar {
            height: 16vh !important;
            min-height: 80px !important;
            padding: 10px 16px !important;
          }
          .enter-hackmatrix-btn {
            width: 100% !important;
            max-width: 320px !important;
            padding: 14px 20px !important;
            font-size: 0.92rem !important;
          }
        }
      `}</style>
    </div>
  )
}

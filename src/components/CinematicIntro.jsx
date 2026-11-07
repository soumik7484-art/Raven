import { useRef, useEffect } from 'react'

/**
 * CinematicIntro — HackMatrix
 *
 * Full-screen edge-to-edge cinematic video introduction.
 * The video fills 100vw × 100vh with no white bars or separate sections.
 * The 'ENTER HACKMATRIX →' button floats directly over the video near the bottom.
 */
export default function CinematicIntro({ onEnter }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.loop = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('loop', '')

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay prevented by browser policy:', err)
      })
    }
  }, [])

  return (
    <div
      className="cinematic-intro-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0E140F',
        overflow: 'hidden',
      }}
    >
      {/* ── Fullscreen Video (Edge-to-Edge 100vw × 100vh, continuously looping) ── */}
      <video
        ref={videoRef}
        src="/landingpage1.mp4"
        autoPlay
        muted
        playsInline
        controls={false}
        preload="auto"
        loop
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      >
        <source src="/landingpage1.mp4" type="video/mp4" />
        <source src="/landing page.mp4" type="video/mp4" />
      </video>

      {/* ── Button directly on the video near the bottom ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(24px, 6vh, 48px)',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          padding: '0 20px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          pointerEvents: 'none',
        }}
      >
        <button
          type="button"
          onClick={onEnter}
          className="enter-hackmatrix-btn"
          aria-label="Enter HackMatrix"
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'rgba(32, 60, 32, 0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display, "Manrope", sans-serif)',
            fontSize: 'clamp(0.92rem, 1.8vw, 1.05rem)',
            fontWeight: 800,
            letterSpacing: '0.05em',
            padding: '15px 36px',
            borderRadius: '10px',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(32, 60, 32, 0.5)',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
            textDecoration: 'none',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-1px)'
            e.currentTarget.style.filter = 'brightness(1.18)'
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(0, 0, 0, 0.6), 0 4px 14px rgba(45, 95, 45, 0.6)'
            e.currentTarget.style.backgroundColor = 'rgba(40, 75, 40, 0.96)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)'
            e.currentTarget.style.filter = 'brightness(1)'
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(32, 60, 32, 0.5)'
            e.currentTarget.style.backgroundColor = 'rgba(32, 60, 32, 0.92)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-1px)'
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
        }
        @media (max-width: 600px) {
          .enter-hackmatrix-btn {
            width: 100% !important;
            max-width: 320px !important;
            padding: 14px 22px !important;
            font-size: 0.92rem !important;
          }
        }
      `}</style>
    </div>
  )
}

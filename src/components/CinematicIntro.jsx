import { useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * CinematicIntro — Raven
 *
 * Full-screen edge-to-edge cinematic video introduction.
 * The video fills 100vw × 100vh with no white bars or separate sections.
 * The top-left corner features the animated transparent REVEN logo.
 * The 'ENTER RAVEN →' button floats directly over the video near the bottom.
 */
export default function CinematicIntro({ onEnter }) {
  const { openAuthModal } = useAuth()
  const videoRef = useRef(null)
  const logoVideoRef = useRef(null)

  useEffect(() => {
    // Ensure any open Picture-in-Picture window is instantly dismissed
    if (typeof document !== 'undefined' && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {})
    }

    const video = videoRef.current
    if (video) {
      video.muted = true
      video.defaultMuted = true
      video.volume = 0
      video.playsInline = true
      video.loop = true
      video.disablePictureInPicture = true
      video.setAttribute('disablepictureinpicture', '')
      video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback noplaybackrate')
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', '')
      video.setAttribute('loop', '')
      video.onvolumechange = () => {
        video.muted = true
        video.volume = 0
      }

      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented by browser policy:', err)
        })
      }
    }

    const logoVideo = logoVideoRef.current
    if (logoVideo) {
      logoVideo.muted = true
      logoVideo.defaultMuted = true
      logoVideo.volume = 0
      logoVideo.playsInline = true
      logoVideo.loop = true
      logoVideo.disablePictureInPicture = true
      logoVideo.setAttribute('disablepictureinpicture', '')
      logoVideo.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback noplaybackrate')
      logoVideo.setAttribute('muted', '')
      logoVideo.setAttribute('playsinline', '')
      logoVideo.setAttribute('webkit-playsinline', '')
      logoVideo.setAttribute('loop', '')
      logoVideo.onvolumechange = () => {
        logoVideo.muted = true
        logoVideo.volume = 0
      }

      const p = logoVideo.play()
      if (p !== undefined) {
        p.catch(() => {})
      }
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
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        preload="auto"
        loop
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <source src="/landingpage1.mp4" type="video/mp4" />
        <source src="/landing page.mp4" type="video/mp4" />
      </video>

      {/* ── Top-Left Corner Animated REVEN Logo (Transparent WebM) ── */}
      <div
        className="cinematic-logo-overlay"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 'clamp(1rem, 2.5vw, 2.25rem)',
          left: 'clamp(1rem, 2.5vw, 2.5rem)',
          zIndex: 10,
          width: 'clamp(200px, 22vw, 340px)',
          aspectRatio: '854 / 480',
          pointerEvents: 'none',
          animation: 'logoFloat 6s ease-in-out infinite',
          filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.45))',
        }}
      >
        <video
          ref={logoVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          onContextMenu={(e) => e.preventDefault()}
          aria-label="REVEN Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <source src="/videos/reven-transparent.webm" type="video/webm" />
          <img
            src="/assets/raven-logo-full.jpg"
            alt="REVEN"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </video>
      </div>

      {/* ── Authentication & Entry Action Panel ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(20px, 5vh, 42px)',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          padding: '0 20px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Get Started / Create Account Button */}
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="enter-raven-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'rgba(32, 60, 32, 0.94)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display, "Manrope", sans-serif)',
              fontSize: 'clamp(0.88rem, 1.6vw, 1.02rem)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              padding: '14px 28px',
              borderRadius: '10px',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(32, 60, 32, 0.5)',
              transition: 'transform 0.18s ease, filter 0.18s ease, background-color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03) translateY(-1px)'
              e.currentTarget.style.backgroundColor = 'rgba(40, 75, 40, 0.98)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.backgroundColor = 'rgba(32, 60, 32, 0.94)'
            }}
          >
            <span>GET STARTED / CREATE ACCOUNT</span>
            <span>→</span>
          </button>

          {/* Enter Raven as Guest / Explore Button */}
          <button
            type="button"
            onClick={onEnter}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'rgba(20, 20, 20, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#EEEEEE',
              fontFamily: 'var(--font-display, "Manrope", sans-serif)',
              fontSize: 'clamp(0.84rem, 1.5vw, 0.96rem)',
              fontWeight: 700,
              letterSpacing: '0.04em',
              padding: '14px 22px',
              borderRadius: '10px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.18s ease, background-color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'
              e.currentTarget.style.backgroundColor = 'rgba(35, 35, 35, 0.95)'
              e.currentTarget.style.color = '#FFFFFF'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.backgroundColor = 'rgba(20, 20, 20, 0.85)'
              e.currentTarget.style.color = '#EEEEEE'
            }}
          >
            <span>ENTER RAVEN</span>
            <span>▶</span>
          </button>
        </div>

        {/* Already have an account? Sign In */}
        <div
          style={{
            pointerEvents: 'auto',
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.88)',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#85d985',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#b0f5b0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#85d985')}
          >
            SIGN IN
          </button>
        </div>
      </div>

      <style>{`
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @supports (height: 100dvh) {
          .cinematic-intro-root {
            height: 100dvh !important;
          }
        }
        @media (max-width: 600px) {
          .cinematic-logo-overlay {
            width: min(70vw, 240px) !important;
            top: 1rem !important;
            left: 1rem !important;
          }
          .enter-raven-btn {
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

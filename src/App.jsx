import { useState, useEffect } from 'react'
import CinematicIntro from './components/CinematicIntro'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Scanner from './components/Scanner'
import RepoScanner from './components/RepoScanner'
import ThreatIntel from './components/ThreatIntel'
import About from './components/About'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import MinecraftCursor from './components/MinecraftCursor'
import AuthModal from './components/AuthModal'
import PublicReportView from './components/PublicReportView'
import { AuthProvider, useAuth } from './context/AuthContext'

function MainApp() {
  const { user } = useAuth()
  const [guestEntered, setGuestEntered] = useState(
    () => sessionStorage.getItem('hm_entered') === 'true'
  )
  const [transitioning, setTransitioning] = useState(false)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // If user navigated directly to an unguessable public report link e.g. /report/RVN-XXXXXXXX
  if (currentPath.startsWith('/report/')) {
    const shareId = currentPath.replace(/^\/report\/?/, '').split('/')[0]
    if (shareId) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f0' }}>
          <MinecraftCursor />
          <PublicReportView
            shareId={shareId}
            onNavigateHome={() => {
              window.history.pushState({}, '', '/')
              setCurrentPath('/')
            }}
          />
        </div>
      )
    }
  }

  // Direct authenticated users straight into the homepage; otherwise respect guest entry
  const isEntered = Boolean(user) || guestEntered

  const handleEnter = () => {
    setTransitioning(true)
    setTimeout(() => {
      sessionStorage.setItem('hm_entered', 'true')
      setGuestEntered(true)
      setTransitioning(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 300)
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('hm_entered')
    setGuestEntered(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-white)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Minecraft Custom Cursor ── */}
      <MinecraftCursor />

      {/* ── Global Firebase Authentication Modal ── */}
      <AuthModal onSuccess={handleEnter} />

      {/* ── Cinematic Welcome Screen (Unauthenticated Landing Page) ── */}
      {!isEntered && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            transition: 'opacity 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            opacity: transitioning ? 0 : 1,
            pointerEvents: transitioning ? 'none' : 'auto',
          }}
        >
          <CinematicIntro onEnter={handleEnter} />
        </div>
      )}

      {/* ── Preserved Raven Website ── */}
      <Header onSignOut={handleSignOut} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Hero />
        <HowItWorks />
        <ErrorBoundary><Scanner /></ErrorBoundary>
        <RepoScanner />
        <ThreatIntel />
        <About />
      </main>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}

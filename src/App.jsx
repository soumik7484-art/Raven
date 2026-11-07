import { useState } from 'react'
import CinematicIntro from './components/CinematicIntro'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Scanner from './components/Scanner'
import Footer from './components/Footer'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const handleEnter = () => {
    setTransitioning(true)
    setTimeout(() => {
      setEntered(true)
      setTransitioning(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 300)
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
      {/* ── Cinematic Welcome Screen (First visit) ── */}
      {!entered && (
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

      {/* ── Preserved HackMatrix Website ── */}
      <Header />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Hero />
        <HowItWorks />
        <Scanner />
      </main>

      <Footer />
    </div>
  )
}

import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Scanner from './components/Scanner'
import Footer from './components/Footer'

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-white)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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

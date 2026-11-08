import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled React error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            maxWidth: '820px',
            margin: '32px auto',
            padding: '24px 28px',
            backgroundColor: '#fff8f8',
            border: '3px solid #cc2222',
            borderRadius: '4px',
            boxShadow: '4px 4px 0 #cc2222',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1rem',
              color: '#cc2222',
              letterSpacing: '0.06em',
              marginBottom: '10px',
            }}
          >
            ⚠️ APPLICATION ERROR ENCOUNTERED
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.86rem',
              color: '#444',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: '0 auto 18px',
            }}
          >
            An unexpected error occurred while rendering the interface: {this.state.error?.message || 'Unknown render error'}.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.72rem',
              color: '#fff',
              backgroundColor: '#3a7a3a',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              padding: '8px 20px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #2a2a2a',
            }}
          >
            ↻ RELOAD INTERFACE
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

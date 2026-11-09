import { useState, useEffect } from 'react'
import { useAuth, AVATARS } from '../context/AuthContext'
import { auth, logoutUser } from '../services/firebase'

export default function AuthModal({ onSuccess }) {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    checkUserExists,
    registerUserProfile,
  } = useAuth()

  // Steps: 'credentials' | 'profile'
  const [step, setStep] = useState('credentials')
  const [pendingUser, setPendingUser] = useState(null)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [genderFilter, setGenderFilter] = useState('all') // 'all' | 'boy' | 'girl'
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [noAccountWarning, setNoAccountWarning] = useState(false)

  // Reset state on modal open/mode change
  useEffect(() => {
    if (authModalOpen) {
      setStep('credentials')
      setErrorMsg('')
      setNoAccountWarning(false)
      setEmail('')
      setPassword('')
    }
  }, [authModalOpen, authModalMode])

  if (!authModalOpen) return null

  const isSignUp = authModalMode === 'signup'

  function getReadableErrorMessage(err) {
    const code = err?.code || ''
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'No account exists for this or invalid credentials. Please check or create an account.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.'
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.'
      case 'auth/network-request-failed':
        return 'Network error: Please check your internet connection.'
      case 'auth/too-many-requests':
        return 'Access temporarily disabled due to many failed attempts. Try again later.'
      default:
        return err?.message || 'An error occurred during authentication.'
    }
  }

  // Handle Google Auth
  async function handleGoogleAuth() {
    setErrorMsg('')
    setNoAccountWarning(false)
    setLoading(true)

    try {
      const res = await signInWithGoogle()
      const gUser = res.user
      const exists = checkUserExists(gUser.uid, gUser.email)

      if (isSignUp) {
        // Sign-Up Flow:
        if (exists) {
          // Account already created, load and proceed
          closeAuthModal()
          if (onSuccess) onSuccess()
          return
        }
        // New account: Transition to avatar & name selection
        setPendingUser(gUser)
        setName(gUser.displayName || gUser.email?.split('@')[0] || '')
        setStep('profile')
      } else {
        // Sign-In Flow:
        if (!exists) {
          // User attempted to sign in without creating an account first!
          await logoutUser()
          setNoAccountWarning(true)
          setErrorMsg('No account exists for this. Please create an account first.')
          setPendingUser(gUser)
          setName(gUser.displayName || gUser.email?.split('@')[0] || '')
          return
        }
        // Account exists: proceed directly
        closeAuthModal()
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      setErrorMsg(getReadableErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Handle Email Credentials Submit (Step 1)
  async function handleEmailAuth(e) {
    e.preventDefault()
    setErrorMsg('')
    setNoAccountWarning(false)

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        // Create user in Firebase
        const res = await signUpWithEmail(email.trim(), password)
        setPendingUser(res.user)
        setName(email.trim().split('@')[0])
        setStep('profile')
      } else {
        // Sign in existing user
        const res = await signInWithEmail(email.trim(), password)
        const exists = checkUserExists(res.user.uid, res.user.email)
        if (!exists) {
          await logoutUser()
          setNoAccountWarning(true)
          setErrorMsg('No account exists for this. Please create an account first.')
          return
        }
        closeAuthModal()
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      setErrorMsg(getReadableErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Handle Profile Completion (Step 2: Choose Avatar & Name)
  async function handleProfileSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Please enter your name.')
      return
    }

    const targetUser = pendingUser || auth.currentUser
    if (!targetUser) {
      setErrorMsg('Session expired. Please try again.')
      setStep('credentials')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      await registerUserProfile(targetUser.uid, {
        name: name.trim(),
        avatar: selectedAvatar.src,
        email: targetUser.email || email.trim(),
      })
      closeAuthModal()
      if (onSuccess) onSuccess()
    } catch (err) {
      setErrorMsg('Could not save profile: ' + (err?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const filteredAvatars = AVATARS.filter((av) => {
    if (genderFilter === 'boy') return av.gender === 'boy'
    if (genderFilter === 'girl') return av.gender === 'girl'
    return true
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(10px, 3vh, 20px) 12px',
        backgroundColor: 'rgba(10, 15, 10, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        animation: 'authFadeIn 0.2s ease-out both',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          closeAuthModal()
        }
      }}
    >
      <div
        className="auth-modal-card"
        style={{
          width: '100%',
          maxWidth: step === 'profile' ? '500px' : '430px',
          maxHeight: 'min(92vh, 92dvh)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          border: '3px solid #2a2a2a',
          borderRadius: '6px',
          boxShadow: '6px 6px 0 #1c2e1c, 0 20px 40px rgba(0,0,0,0.45)',
          overflow: 'hidden',
          position: 'relative',
          margin: 'auto',
          animation: 'authPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Top Header Bar — Pinned firmly to the top */}
        <div
          style={{
            backgroundColor: '#2b772b',
            padding: '12px 16px',
            borderBottom: '2px solid #2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <div
            id="auth-modal-title"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(0.68rem, 2.2vw, 0.74rem)',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: '0.65rem' }}>■</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {step === 'profile'
                ? 'SELECT AVATAR & NAME'
                : isSignUp
                ? 'CREATE RAVEN ACCOUNT'
                : 'SIGN IN TO RAVEN'}
            </span>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            disabled={loading}
            aria-label="Close"
            style={{
              background: '#ffffff',
              border: '2px solid #2a2a2a',
              borderRadius: '3px',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#2a2a2a',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.75rem',
              boxShadow: '2px 2px 0 #1c2e1c',
              lineHeight: 1,
              flexShrink: 0,
              marginLeft: '8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="auth-modal-scroll-body"
          style={{
            padding: 'clamp(14px, 3.5vw, 20px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
          }}
        >
          {/* STEP 1: CREDENTIALS (SIGN IN / SIGN UP) */}
          {step === 'credentials' && (
            <>
              {/* Subtitle */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: '#555',
                  lineHeight: 1.45,
                  marginBottom: '16px',
                }}
              >
                {isSignUp
                  ? 'Create your RAVEN account to personalize your pixel clearance and unlock repository intelligence.'
                  : 'Sign in to access your security intelligence workstation and unlocked tools.'}
              </p>

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #2a2a2a',
                  borderRadius: '4px',
                  boxShadow: '3px 3px 0 #2a2a2a',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.68rem',
                  color: '#222',
                  letterSpacing: '0.04em',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  marginBottom: '14px',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#f7faf7'
                    e.currentTarget.style.transform = 'translate(-1px, -1px)'
                    e.currentTarget.style.boxShadow = '4px 4px 0 #2a2a2a'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.transform = 'translate(0, 0)'
                    e.currentTarget.style.boxShadow = '3px 3px 0 #2a2a2a'
                  }
                }}
              >
                <GooglePixelIcon />
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '14px 0',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d0d0c8' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.58rem',
                    color: '#888',
                    letterSpacing: '0.08em',
                  }}
                >
                  OR WITH EMAIL
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#d0d0c8' }} />
              </div>

              {/* Error or Warning Banner */}
              {errorMsg && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: '#fff0f0',
                    border: '2px solid #cc2222',
                    borderRadius: '4px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    color: '#cc2222',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>✖</span>
                    <span>{errorMsg}</span>
                  </div>

                  {noAccountWarning && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('')
                        setNoAccountWarning(false)
                        setAuthModalMode('signup')
                        if (pendingUser) {
                          setStep('profile')
                        }
                      }}
                      style={{
                        marginTop: '4px',
                        alignSelf: 'flex-start',
                        backgroundColor: '#2b772b',
                        color: '#fff',
                        border: '2px solid #1c551c',
                        borderRadius: '3px',
                        padding: '6px 12px',
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.62rem',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0 #1c551c',
                      }}
                    >
                      ▶ CREATE ACCOUNT NOW
                    </button>
                  )}
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth}>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    htmlFor="auth-email-input"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.62rem',
                      color: '#333',
                      marginBottom: '5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="agent@example.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.82rem',
                      border: '2px solid #2a2a2a',
                      borderRadius: '4px',
                      backgroundColor: '#fbfbf9',
                      color: '#111',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2b772b'
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(43, 119, 43, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="auth-password-input"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.62rem',
                      color: '#333',
                      marginBottom: '5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    PASSWORD {isSignUp && '(MIN 6 CHARACTERS)'}
                  </label>
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.82rem',
                      border: '2px solid #2a2a2a',
                      borderRadius: '4px',
                      backgroundColor: '#fbfbf9',
                      color: '#111',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2b772b'
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(43, 119, 43, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#2b772b',
                    color: '#ffffff',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.05em',
                    border: '2px solid #1c551c',
                    borderRadius: '4px',
                    boxShadow: '3px 3px 0 #1c551c',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#348b34'
                      e.currentTarget.style.transform = 'translate(-1px, -1px)'
                      e.currentTarget.style.boxShadow = '4px 4px 0 #1c551c'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#2b772b'
                      e.currentTarget.style.transform = 'translate(0, 0)'
                      e.currentTarget.style.boxShadow = '3px 3px 0 #1c551c'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ animation: 'authSpin 0.9s linear infinite', display: 'inline-block' }}>⟳</span>
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : isSignUp ? (
                    <span>CONTINUE TO AVATAR SELECTION →</span>
                  ) : (
                    <span>SIGN IN →</span>
                  )}
                </button>
              </form>

              {/* Switch Sign In / Create Account */}
              <div
                style={{
                  marginTop: '14px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  color: '#555',
                }}
              >
                {isSignUp ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('')
                        setNoAccountWarning(false)
                        setAuthModalMode('signin')
                      }}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#2b772b',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('')
                        setNoAccountWarning(false)
                        setAuthModalMode('signup')
                      }}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#2b772b',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Create one
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

          {/* STEP 2: PROFILE SETUP (NAME + MINECRAFT AVATAR SELECTION) */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              {/* Success badge */}
              <div
                style={{
                  backgroundColor: '#f2f8f2',
                  border: '1.5px solid #2b772b',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: '#2b772b', fontWeight: 'bold' }}>✓</span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.76rem',
                    color: '#224422',
                    lineHeight: 1.35,
                  }}
                >
                  Authentication verified! Confirm your name and choose your pixel avatar.
                </span>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: '#fff0f0',
                    border: '2px solid #cc2222',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    color: '#cc2222',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Name Field (Pre-filled from Google Auth) */}
              <div style={{ marginBottom: '14px' }}>
                <label
                  htmlFor="profile-name-input"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.62rem',
                    color: '#222',
                    marginBottom: '5px',
                    letterSpacing: '0.04em',
                  }}
                >
                  YOUR DISPLAY NAME
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.74rem',
                    border: '2px solid #2a2a2a',
                    borderRadius: '4px',
                    backgroundColor: '#fbfbf9',
                    color: '#111',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '0.03em',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2b772b'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(43, 119, 43, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Avatar Selector Header + Category Tabs */}
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <label
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.62rem',
                      color: '#222',
                      letterSpacing: '0.04em',
                    }}
                  >
                    SELECT PIXEL AVATAR
                  </label>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['all', 'boy', 'girl'].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setGenderFilter(filter)}
                        style={{
                          background: genderFilter === filter ? '#2b772b' : '#f0f0ee',
                          color: genderFilter === filter ? '#fff' : '#444',
                          border: '1.5px solid #2a2a2a',
                          borderRadius: '3px',
                          padding: '3px 8px',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '0.56rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Grid (Responsive 3 Columns with crisp mobile sizing) */}
                <div
                  className="auth-avatar-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    maxHeight: '230px',
                    overflowY: 'auto',
                    padding: '3px',
                  }}
                >
                  {filteredAvatars.map((av) => {
                    const isSelected = selectedAvatar.id === av.id
                    return (
                      <div
                        key={av.id}
                        onClick={() => setSelectedAvatar(av)}
                        className="auth-avatar-card"
                        style={{
                          cursor: 'pointer',
                          border: isSelected ? '2.5px solid #2b772b' : '2px solid #ccc',
                          borderRadius: '5px',
                          backgroundColor: isSelected ? '#eef7ee' : '#fafafa',
                          padding: '6px 4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          position: 'relative',
                          boxShadow: isSelected ? '2px 2px 0 #2b772b' : '1px 1px 0 rgba(0,0,0,0.06)',
                          transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                          transition: 'all 0.12s ease',
                          minWidth: 0,
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              backgroundColor: '#2b772b',
                              color: '#fff',
                              borderRadius: '2px',
                              width: '13px',
                              height: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.52rem',
                              fontWeight: 'bold',
                              zIndex: 2,
                            }}
                          >
                            ✓
                          </div>
                        )}

                        <img
                          src={av.src}
                          alt={av.label}
                          className="auth-avatar-img"
                          style={{
                            width: '54px',
                            height: '54px',
                            objectFit: 'cover',
                            borderRadius: '3px',
                            border: '1px solid #2a2a2a',
                            imageRendering: 'pixelated',
                            display: 'block',
                          }}
                        />

                        <div style={{ textAlign: 'center', lineHeight: 1.15, width: '100%', overflow: 'hidden' }}>
                          <span
                            className="auth-avatar-label"
                            style={{
                              display: 'block',
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '0.56rem',
                              color: isSelected ? '#1c551c' : '#222',
                              fontWeight: isSelected ? 700 : 500,
                              letterSpacing: '0.01em',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                          >
                            {av.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Avatar Preview Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 10px',
                  backgroundColor: '#f8f8f6',
                  border: '2px solid #2a2a2a',
                  borderRadius: '4px',
                  marginBottom: '14px',
                }}
              >
                <img
                  src={selectedAvatar.src}
                  alt={selectedAvatar.label}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '3px',
                    border: '1.5px solid #2b772b',
                    imageRendering: 'pixelated',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.62rem',
                      color: '#2b772b',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    SELECTED: {selectedAvatar.label}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.66rem',
                      color: '#555',
                      lineHeight: 1.25,
                    }}
                  >
                    Will be displayed as your operative identity in RAVEN.
                  </span>
                </div>
              </div>

              {/* Submit & Enter Raven Button — Guaranteed visible and reachable */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#2b772b',
                  color: '#ffffff',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 'clamp(0.7rem, 2.2vw, 0.76rem)',
                  letterSpacing: '0.05em',
                  border: '2px solid #1c551c',
                  borderRadius: '4px',
                  boxShadow: '3px 3px 0 #1c551c',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#348b34'
                    e.currentTarget.style.transform = 'translate(-1px, -1px)'
                    e.currentTarget.style.boxShadow = '4px 4px 0 #1c551c'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2b772b'
                    e.currentTarget.style.transform = 'translate(0, 0)'
                    e.currentTarget.style.boxShadow = '3px 3px 0 #1c551c'
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={{ animation: 'authSpin 0.9s linear infinite', display: 'inline-block' }}>⟳</span>
                    <span>INITIALIZING CLEARANCE...</span>
                  </>
                ) : (
                  <span>CONFIRM & ENTER RAVEN ▶</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authPopIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 420px) {
          .auth-avatar-img {
            width: 46px !important;
            height: 46px !important;
          }
          .auth-avatar-label {
            font-size: 0.52rem !important;
          }
        }
      `}</style>
    </div>
  )
}

function GooglePixelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

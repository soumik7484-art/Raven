import { createContext, useContext, useEffect, useState } from 'react'
import {
  auth,
  onAuthStateChanged,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  updateUserProfile,
} from '../services/firebase'

export const AVATARS = [
  {
    id: 'coder_boy',
    label: 'Coder Boy',
    gender: 'boy',
    src: '/avatars/coder_boy.jpg',
  },
  {
    id: 'music_lover_boy',
    label: 'Music Lover',
    gender: 'boy',
    src: '/avatars/coder_boy_headphones.jpg',
  },
  {
    id: 'warrior_boy',
    label: 'Warrior',
    gender: 'boy',
    src: '/avatars/warrior_boy.jpg',
  },
  {
    id: 'coder_girl',
    label: 'Coder Girl',
    gender: 'girl',
    src: '/avatars/coder_girl.jpg',
  },
  {
    id: 'music_lover_girl',
    label: 'Music Lover',
    gender: 'girl',
    src: '/avatars/coder_girl_headphones.jpg',
  },
  {
    id: 'warrior_girl',
    label: 'Warrior',
    gender: 'girl',
    src: '/avatars/warrior_girl.jpg',
  },
]

const REGISTRY_KEY = 'raven_registered_profiles_v1'

function getRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveRegistry(reg) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg))
  } catch (e) {
    console.error('Failed to save user registry:', e)
  }
}

export function getUserProfileFromStorage(uid, email) {
  const reg = getRegistry()
  if (uid && reg[uid]) return reg[uid]
  if (email && reg['email:' + email.toLowerCase()]) return reg['email:' + email.toLowerCase()]
  return null
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin') // 'signin' | 'signup'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const stored = getUserProfileFromStorage(currentUser.uid, currentUser.email)
        if (stored) {
          setUserProfile(stored)
        } else if (currentUser.displayName && currentUser.photoURL) {
          const profile = {
            name: currentUser.displayName,
            avatar: currentUser.photoURL,
            email: currentUser.email || '',
            uid: currentUser.uid,
          }
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  function checkUserExists(uid, email) {
    const reg = getRegistry()
    if (uid && reg[uid]) return true
    if (email && reg['email:' + email.toLowerCase()]) return true
    return false
  }

  async function registerUserProfile(uid, { name, avatar, email }) {
    const reg = getRegistry()
    const profile = {
      name: name.trim(),
      avatar,
      email: email || '',
      uid,
      registeredAt: Date.now(),
    }
    reg[uid] = profile
    if (email) {
      reg['email:' + email.toLowerCase()] = profile
    }
    saveRegistry(reg)
    setUserProfile(profile)

    try {
      await updateUserProfile({
        displayName: name.trim(),
        photoURL: avatar,
      })
    } catch (e) {
      console.warn('Could not update Firebase user profile:', e)
    }

    return profile
  }

  function openAuthModal(mode = 'signin') {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  function closeAuthModal() {
    setAuthModalOpen(false)
  }

  async function handleGoogleSignIn() {
    return loginWithGoogle()
  }

  async function handleEmailSignIn(email, password) {
    return loginWithEmail(email, password)
  }

  async function handleEmailSignUp(email, password) {
    return registerWithEmail(email, password)
  }

  async function handleLogout() {
    setUserProfile(null)
    return logoutUser()
  }

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: Boolean(user && userProfile),
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    checkUserExists,
    getUserProfileFromStorage,
    registerUserProfile,
    signInWithGoogle: handleGoogleSignIn,
    signInWithEmail: handleEmailSignIn,
    signUpWithEmail: handleEmailSignUp,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

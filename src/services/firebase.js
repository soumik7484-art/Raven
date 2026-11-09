import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

export const firebaseConfig = {
  apiKey: "AIzaSyBM0ojm86RjFNEcjhXIF-6pigW5cpnS36g",
  authDomain: "raven-5543c.firebaseapp.com",
  projectId: "raven-5543c",
  storageBucket: "raven-5543c.firebasestorage.app",
  messagingSenderId: "697288241075",
  appId: "1:697288241075:web:b6109ec49e9381694425c6",
  measurementId: "G-RTH0SRH4T8"
}

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  return signOut(auth)
}

export async function updateUserProfile(profile) {
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, profile)
  }
}

export { onAuthStateChanged, updateProfile }

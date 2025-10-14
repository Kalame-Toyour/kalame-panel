'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function JWTExpirationHandler() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const hasHandledExpiration = useRef(false)
  const logoutInProgress = useRef(false)

  useEffect(() => {
    // Don't run if logout is already in progress
    if (logoutInProgress.current) return

    // Only run when session is loaded and we haven't already handled expiration
    if (status !== 'authenticated' || hasHandledExpiration.current) return

    const user = session?.user as any

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('JWT Expiration Handler - Checking session:', {
        hasUser: !!user,
        hasError: !!user?.error,
        hasAccessToken: !!user?.accessToken,
        hasExpiresAt: !!user?.expiresAt,
        expiresAt: user?.expiresAt ? new Date(user.expiresAt).toISOString() : 'No expiration',
        isExpired: user?.expiresAt ? Date.now() > user.expiresAt : false,
        error: user?.error
      })
    }

    // Check if token has an error (indicating JWT expiration or refresh failure)
    if (user?.error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Expiration Handler - Token error detected:', user.error)
      }
      handleLogout('Token error: ' + user.error)
      return
    }

    // Check if token is expired
    if (user?.expiresAt && Date.now() > user.expiresAt) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Expiration Handler - Token expired:', {
          expiresAt: new Date(user.expiresAt).toISOString(),
          now: new Date().toISOString(),
          timePast: Date.now() - user.expiresAt
        })
      }
      handleLogout('Token expired')
      return
    }

    // Check if access token is missing
    if (!user?.accessToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Expiration Handler - No access token found')
      }
      handleLogout('No access token')
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('JWT Expiration Handler - Session is valid')
    }
  }, [session?.user, status, router])

  const handleLogout = (reason: string) => {
    if (logoutInProgress.current) return
    
    if (process.env.NODE_ENV === 'development') {
      console.log('JWT Expiration Handler - Starting logout process:', reason)
    }
    hasHandledExpiration.current = true
    logoutInProgress.current = true
    
    // Clear any existing session data
    try {
      localStorage.removeItem('session')
      localStorage.removeItem('next-auth.session-token')
      sessionStorage.clear()
    } catch (error) {
      console.warn('Error clearing storage:', error)
    }
    
    // Sign out and redirect to auth page
    signOut({ 
      callbackUrl: '/auth',
      redirect: true 
    }).catch((error) => {
      console.error('Error during signOut:', error)
      // Force redirect if signOut fails
      window.location.href = '/auth'
    })
  }

  // Reset the handler when session changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      hasHandledExpiration.current = false
      logoutInProgress.current = false
    }
  }, [status])

  return null
}

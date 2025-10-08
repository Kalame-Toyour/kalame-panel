'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function JWTExpirationHandler() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const hasHandledExpiration = useRef(false)

  useEffect(() => {
    // Only run when session is loaded and we haven't already handled expiration
    if (status !== 'authenticated' || hasHandledExpiration.current) return

    const user = session?.user as any

    // Check if token has an error (indicating JWT expiration or refresh failure)
    if (user?.error) {
      console.log('JWT Expiration Handler - Token error detected:', user.error)
      hasHandledExpiration.current = true
      
      // Clear any existing session data
      localStorage.removeItem('session')
      sessionStorage.clear()
      
      // Sign out and redirect to auth page
      signOut({ 
        callbackUrl: '/auth',
        redirect: true 
      }).catch((error) => {
        console.error('Error during signOut:', error)
        // Force redirect if signOut fails
        router.push('/auth')
      })
      return
    }

    // Check if token is expired
    if (user?.expiresAt && Date.now() > user.expiresAt) {
      console.log('JWT Expiration Handler - Token expired:', {
        expiresAt: new Date(user.expiresAt).toISOString(),
        now: new Date().toISOString()
      })
      hasHandledExpiration.current = true
      
      // Clear any existing session data
      localStorage.removeItem('session')
      sessionStorage.clear()
      
      // Sign out and redirect to auth page
      signOut({ 
        callbackUrl: '/auth',
        redirect: true 
      }).catch((error) => {
        console.error('Error during signOut:', error)
        // Force redirect if signOut fails
        router.push('/auth')
      })
      return
    }

    // Check if access token is missing
    if (!user?.accessToken) {
      console.log('JWT Expiration Handler - No access token found')
      hasHandledExpiration.current = true
      
      // Clear any existing session data
      localStorage.removeItem('session')
      sessionStorage.clear()
      
      // Sign out and redirect to auth page
      signOut({ 
        callbackUrl: '/auth',
        redirect: true 
      }).catch((error) => {
        console.error('Error during signOut:', error)
        // Force redirect if signOut fails
        router.push('/auth')
      })
      return
    }
  }, [session, status, router])

  // Reset the handler when session changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      hasHandledExpiration.current = false
    }
  }, [status])

  return null
}

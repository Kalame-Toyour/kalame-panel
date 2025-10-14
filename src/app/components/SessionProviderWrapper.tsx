'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderWrapperProps {
  children: ReactNode
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return (
    <SessionProvider
      refetchInterval={30 * 60} // Refetch session every 30 minutes (reduced frequency)
      refetchOnWindowFocus={false} // Disable refetch on window focus to reduce calls
      refetchWhenOffline={false} // Don't refetch when offline
    >
      {children}
    </SessionProvider>
  )
}

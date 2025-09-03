'use client'

import { Suspense, ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function PageWrapper({ children, fallback = null }: PageWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

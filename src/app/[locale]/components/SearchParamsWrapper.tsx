'use client'

import { Suspense, ReactNode } from 'react'

interface SearchParamsWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function SearchParamsWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div> 
}: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

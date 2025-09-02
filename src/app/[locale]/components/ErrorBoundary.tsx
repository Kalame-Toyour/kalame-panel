'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[ErrorBoundary] Caught error:', error, errorInfo)
    
    // Call optional error handler
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo)
      } catch (handlerError) {
        console.warn('[ErrorBoundary] Error handler itself failed:', handlerError)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or null to silently fail
      return this.props.fallback || null
    }

    return this.props.children
  }
}

// Specialized Error Boundary for FCM components
export function FCMErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.warn('[FCM] Error caught by boundary - app continues normally:', error)
        
        // Clean up any FCM-related localStorage items on error
        try {
          localStorage.removeItem('pending_web_push_token')
          localStorage.removeItem('fcm_initialization_failed')
        } catch {}
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

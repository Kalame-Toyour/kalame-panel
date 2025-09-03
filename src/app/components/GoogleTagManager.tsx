'use client'

import { useEffect } from 'react'

// Google Tag Manager component for tracking events
export default function GoogleTagManager() {
  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
    }
  }, [])

  // Function to push events to GTM
  const gtmPush = (event: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(event)
    }
  }

  // Track page views
  const trackPageView = (url: string, title: string) => {
    gtmPush({
      event: 'page_view',
      page_title: title,
      page_location: url,
    })
  }

  // Track user interactions
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    gtmPush({
      event: eventName,
      ...parameters,
    })
  }

  // Track chat interactions
  const trackChatEvent = (action: string, model?: string, messageLength?: number) => {
    gtmPush({
      event: 'chat_interaction',
      chat_action: action,
      model_name: model,
      message_length: messageLength,
    })
  }

  // Track image generation
  const trackImageGeneration = (prompt: string, model?: string) => {
    gtmPush({
      event: 'image_generation',
      image_prompt: prompt.substring(0, 100), // Limit prompt length
      model_name: model,
    })
  }

  // Track user authentication
  const trackAuth = (action: 'login' | 'logout' | 'signup') => {
    gtmPush({
      event: 'user_auth',
      auth_action: action,
    })
  }

  // Track premium upgrades
  const trackPremiumUpgrade = (plan: string, price?: number) => {
    gtmPush({
      event: 'premium_upgrade',
      plan_name: plan,
      plan_price: price,
    })
  }

  return null // This component doesn't render anything
}

// Export functions for use in other components
export const gtmEvents = {
  trackPageView: (url: string, title: string) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_title: title,
        page_location: url,
      })
    }
  },
  
  trackChatEvent: (action: string, model?: string, messageLength?: number) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'chat_interaction',
        chat_action: action,
        model_name: model,
        message_length: messageLength,
      })
    }
  },
  
  trackImageGeneration: (prompt: string, model?: string) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'image_generation',
        image_prompt: prompt.substring(0, 100),
        model_name: model,
      })
    }
  },
  
  trackAuth: (action: 'login' | 'logout' | 'signup') => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'user_auth',
        auth_action: action,
      })
    }
  },
  
  trackPremiumUpgrade: (plan: string, price?: number) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'premium_upgrade',
        plan_name: plan,
        plan_price: price,
      })
    }
  },
}

// TypeScript declarations for dataLayer
declare global {
  interface Window {
    dataLayer: any[]
  }
}


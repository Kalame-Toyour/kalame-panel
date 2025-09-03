'use client'

import { useCallback } from 'react'

export function useGTM() {
  const trackPageView = useCallback((url: string, title: string) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_title: title,
        page_location: url,
      })
    }
  }, [])

  const trackChatEvent = useCallback((action: string, model?: string, messageLength?: number) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'chat_interaction',
        chat_action: action,
        model_name: model,
        message_length: messageLength,
      })
    }
  }, [])

  const trackImageGeneration = useCallback((prompt: string, model?: string) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'image_generation',
        image_prompt: prompt.substring(0, 100),
        model_name: model,
      })
    }
  }, [])

  const trackAuth = useCallback((action: 'login' | 'logout' | 'signup') => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'user_auth',
        auth_action: action,
      })
    }
  }, [])

  const trackPremiumUpgrade = useCallback((plan: string, price?: number) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'premium_upgrade',
        plan_name: plan,
        plan_price: price,
      })
    }
  }, [])

  const trackCustomEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...parameters,
      })
    }
  }, [])

  return {
    trackPageView,
    trackChatEvent,
    trackImageGeneration,
    trackAuth,
    trackPremiumUpgrade,
    trackCustomEvent,
  }
}

// TypeScript declarations for dataLayer
declare global {
  interface Window {
    dataLayer: any[]
  }
}


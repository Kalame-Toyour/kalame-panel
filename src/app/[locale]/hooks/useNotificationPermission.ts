'use client'

import { useCallback } from 'react'
import { useAuth } from './useAuth'

export function useNotificationPermission() {
  const { isAuthenticated } = useAuth()

  const registerDeviceAfterPermission = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[NotificationPermission] User not authenticated, skipping device registration')
      return
    }

    try {
      // Check if we have FCM support
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
        console.log('[NotificationPermission] FCM not supported')
        return
      }

      // Check if permission is granted
      if (window.Notification.permission !== 'granted') {
        console.log('[NotificationPermission] Permission not granted')
        return
      }

      // Import Firebase modules dynamically
      const { initializeApp } = await import('firebase/app')
      const { getMessaging, getToken, isSupported } = await import('firebase/messaging')

      // Check Firebase messaging support
      if (!(await isSupported())) {
        console.log('[NotificationPermission] Firebase messaging not supported')
        return
      }

      // Initialize Firebase
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID as string,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
      }

      const app = initializeApp(config)
      const messaging = getMessaging(app)

      // Register service worker
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('[NotificationPermission] Service worker registered:', reg.scope)

      // Get FCM token
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      const token = await getToken(
        messaging,
        vapidKey
          ? { vapidKey, serviceWorkerRegistration: reg }
          : { serviceWorkerRegistration: reg }
      )

      if (!token) {
        console.log('[NotificationPermission] No FCM token received')
        return
      }

      console.log('[NotificationPermission] FCM token obtained, length:', token.length)

      // Register device with backend
      const body = {
        platform: 'web',
        provider: 'fcm',
        token,
        device: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: navigator.languages,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          tzOffsetMin: new Date().getTimezoneOffset(),
          permission: window.Notification.permission,
          screen: { 
            w: window.screen?.width, 
            h: window.screen?.height, 
            dpr: window.devicePixelRatio 
          },
          swScope: reg.scope
        }
      }

      const response = await fetch('/api/notifications/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      })

      console.log('[NotificationPermission] Register device response:', response.status)

      if (response.ok) {
        // Mark as successfully registered
        localStorage.setItem('last_registered_token', token)
        localStorage.removeItem('pending_web_push_token')
        console.log('[NotificationPermission] Device successfully registered')
      } else if (response.status === 401) {
        // User not authenticated, save token for later
        localStorage.setItem('pending_web_push_token', token)
        console.log('[NotificationPermission] User not authenticated, token saved for later')
      } else {
        console.error('[NotificationPermission] Failed to register device:', response.status)
      }
    } catch (error) {
      console.error('[NotificationPermission] Error registering device:', error)
    }
  }, [isAuthenticated])

  return { registerDeviceAfterPermission }
}


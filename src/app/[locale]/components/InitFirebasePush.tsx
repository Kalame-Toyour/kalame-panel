'use client'

import { useEffect } from 'react'
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported, type Messaging, type MessagePayload } from 'firebase/messaging'
import { useAuth } from '../hooks/useAuth'

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID as string,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
  }
  return config
}

// Safe helper functions for feature detection with complete isolation
function isNotificationSupported(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.Notification !== 'undefined'
  } catch {
    return false
  }
}

function getNotificationPermission(): NotificationPermission | 'default' {
  try {
    if (!isNotificationSupported()) return 'default'
    return (window as Window & { Notification?: { permission: NotificationPermission } }).Notification?.permission || 'default'
  } catch {
    return 'default'
  }
}

function isServiceWorkerSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator
  } catch {
    return false
  }
}

function isFCMEnvironmentSupported(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      isServiceWorkerSupported() &&
      isNotificationSupported()
    )
  } catch {
    return false
  }
}

export default function InitFirebasePush() {
  const { isAuthenticated } = useAuth()
  
  useEffect(() => {
    let mounted = true
    let isInitializing = false
    let hasRegistered = false
    let initTimeout: NodeJS.Timeout | null = null
    
    async function init() {
      // Prevent multiple simultaneous initializations
      if (isInitializing) {
        console.log('[FCM] Already initializing, skipping duplicate call')
        return
      }
      
      isInitializing = true
      
      // Critical safety wrapper - MUST NOT crash the app
      try {
        // Additional safety wrapper for entire FCM initialization
        if (typeof window === 'undefined') {
          console.log('[FCM] Server-side rendering, skipping FCM initialization')
          return
        }

        // Ultra-safe environment validation
        if (!isFCMEnvironmentSupported()) {
          console.log('[FCM] Environment not supported - missing serviceWorker or Notification APIs')
          return
        }

        // Check Firebase messaging support
        if (!(await isSupported())) {
          console.log('[FCM] Firebase messaging is not supported in this browser')
          return
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        const app: FirebaseApp = initializeApp(getFirebaseConfig())
        const messaging: Messaging = getMessaging(app)

        // Register dedicated Firebase messaging SW
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        console.log('[FCM] SW registered:', reg.scope)

        // Permission gate - now safely checking
        const notificationPermission = getNotificationPermission()
        console.log('[FCM] Notification.permission:', notificationPermission)
        // Do NOT request permission here to satisfy user-gesture requirement.
        if (notificationPermission !== 'granted') {
          console.log('[FCM] Notification permission not granted, skipping token registration')
          return
        }

        // IMPORTANT: Ensure userVisibleOnly=true via default FCM options; VAPID used when provided
        const token = await getToken(
          messaging,
          vapidKey
            ? { vapidKey, serviceWorkerRegistration: reg }
            : { serviceWorkerRegistration: reg }
        )
        if (!mounted || !token) return
        console.log('[FCM] Obtained token length:', token.length)

        // If not authenticated, stash token for later and skip backend call
        if (!isAuthenticated) {
          localStorage.setItem('pending_web_push_token', token)
          console.log('[FCM] user not authenticated; token saved for later')
        } else {
          // Only register if we haven't already registered this token
          const lastRegisteredToken = localStorage.getItem('last_registered_token')
          if (lastRegisteredToken === token && hasRegistered) {
            console.log('[FCM] Token already registered, skipping duplicate registration')
            return
          }
          
          // Try registering to backend with additional device context
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
              permission: getNotificationPermission(),
              screen: { w: window.screen?.width, h: window.screen?.height, dpr: window.devicePixelRatio },
              swScope: reg.scope
            }
          }
          const resp = await fetch('/api/notifications/register-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
          })
          console.log('[FCM] register-device status:', resp.status)
          if (resp.status === 401) {
            localStorage.setItem('pending_web_push_token', token)
          } else if (resp.ok) {
            // Mark as successfully registered
            localStorage.setItem('last_registered_token', token)
            hasRegistered = true
            console.log('[FCM] Token successfully registered')
          }
        }

        // Foreground messages: explicitly show a notification
        onMessage(messaging, async (payload: MessagePayload) => {
          console.log('[FCM] foreground message:', payload)
          const title = payload.notification?.title || payload.data?.title || 'پیام جدید'
          const body = payload.notification?.body || payload.data?.body || ''
          const data = { url: payload.data?.url || '/', ...payload.data }
          const options: NotificationOptions = {
            body,
            icon: '/kalame-logo.png',
            data,
            requireInteraction: true,
            badge: '/kalame-logo.png',
            tag: 'kalame-fcm',
          }
          try {
            await reg.showNotification(title, options)
            console.log('[FCM] notification shown via SW (foreground)')
          } catch (e) {
            console.warn('[FCM] SW showNotification failed, fallback to page Notification', e)
                          try {
                if (isNotificationSupported() && getNotificationPermission() === 'granted') {
                  const NotificationConstructor = (window as Window & { Notification?: typeof Notification }).Notification
                  if (NotificationConstructor) {
                    new NotificationConstructor(title, options)
                    console.log('[FCM] notification shown via page Notification (fallback)')
                  } else {
                    showInlineBanner(title, body)
                  }
                } else {
                  showInlineBanner(title, body)
                }
              } catch {
                showInlineBanner(title, body)
              }
          }
        })

        function showInlineBanner(t: string, b: string) {
          try {
            const id = 'fcm-inline-banner'
            if (document.getElementById(id)) return
            const wrapper = document.createElement('div')
            wrapper.id = id
            wrapper.style.cssText = 'position:fixed;top:12px;left:0;right:0;display:flex;justify-content:center;z-index:9999;'
            const box = document.createElement('div')
            box.style.cssText = 'max-width:640px;margin:0 8px;background:#1e40af;color:#fff;border-radius:12px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.2);font-family:inherit;'
            box.innerHTML = `<div style="font-weight:700;margin-bottom:4px">${t}</div><div style="opacity:.9">${b}</div>`
            wrapper.appendChild(box)
            document.body.appendChild(wrapper)
            setTimeout(() => { wrapper.remove() }, 4000)
          } catch {}
        }
      } catch (error) {
        // Silently fail - FCM errors should NEVER crash the app
        console.warn('[FCM] Initialization failed silently - app continues normally:', error)
        
        // Clean up any pending tokens if initialization failed
        try {
          localStorage.removeItem('pending_web_push_token')
        } catch {}
      } finally {
        isInitializing = false
      }
    }

    // Debounced initialization to prevent rapid re-initializations
    const debouncedInit = () => {
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
      initTimeout = setTimeout(() => {
        try {
          init()
        } catch (error) {
          console.warn('[FCM] Critical error during init() call - app continues normally:', error)
        }
      }, 100) // 100ms debounce
    }
    
    // Safe initialization wrapper
    try {
      debouncedInit()
    } catch (error) {
      console.warn('[FCM] Critical error during debouncedInit() call - app continues normally:', error)
    }

    // If user logs in later, flush pending token immediately on focus
    const onFocus = async () => {
      const token = localStorage.getItem('pending_web_push_token')
      if (!token || !isAuthenticated) return
      
      // Check if this token was already registered
      const lastRegisteredToken = localStorage.getItem('last_registered_token')
      if (lastRegisteredToken === token) {
        console.log('[FCM] Focus: Token already registered, removing pending token')
        localStorage.removeItem('pending_web_push_token')
        return
      }
      
      // Only proceed if we still have FCM support
      if (!isFCMEnvironmentSupported()) {
        localStorage.removeItem('pending_web_push_token')
        return
      }
      try {
        const body = {
          platform: 'web', provider: 'fcm', token,
          device: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            tzOffsetMin: new Date().getTimezoneOffset(),
            permission: getNotificationPermission(),
            screen: { w: window.screen?.width, h: window.screen?.height, dpr: window.devicePixelRatio }
          }
        }
        const resp = await fetch('/api/notifications/register-device', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (resp.ok) {
          localStorage.removeItem('pending_web_push_token')
          localStorage.setItem('last_registered_token', token)
          console.log('[FCM] Focus: Token successfully registered')
        }
      } catch {}
    }
    // Safe event listener setup
    try {
      window.addEventListener('focus', onFocus)
    } catch (error) {
      console.warn('[FCM] Failed to add focus listener:', error)
    }

    return () => { 
      mounted = false
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
      try {
        window.removeEventListener('focus', onFocus)
      } catch {}
    }
  }, [isAuthenticated])

  // Clear registered token when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.removeItem('last_registered_token')
        console.log('[FCM] User logged out, cleared registered token')
      } catch {}
    }
  }, [isAuthenticated])

  // Try flush pending token on auth changes by polling periodically (simple approach)
  useEffect(() => {
    // Wrap entire polling effect in safety
    try {
    const id = setInterval(async () => {
      const token = localStorage.getItem('pending_web_push_token')
      if (!token || !isAuthenticated) return
      
      // Check if this token was already registered
      const lastRegisteredToken = localStorage.getItem('last_registered_token')
      if (lastRegisteredToken === token) {
        console.log('[FCM] Polling: Token already registered, removing pending token')
        localStorage.removeItem('pending_web_push_token')
        return
      }
      
      // Only proceed if we still have FCM support
      if (!isFCMEnvironmentSupported()) {
        localStorage.removeItem('pending_web_push_token')
        return
      }
      try {
        const body = {
          platform: 'web', provider: 'fcm', token,
          device: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            tzOffsetMin: new Date().getTimezoneOffset(),
            permission: getNotificationPermission(),
            screen: { w: window.screen?.width, h: window.screen?.height, dpr: window.devicePixelRatio }
          }
        }
        const resp = await fetch('/api/notifications/register-device', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (resp.ok) {
          localStorage.removeItem('pending_web_push_token')
          localStorage.setItem('last_registered_token', token)
          console.log('[FCM] Polling: Token successfully registered')
        }
      } catch {}
    }, 10000) // Increased interval to 10 seconds to reduce frequency
    return () => {
      try {
        clearInterval(id)
      } catch {}
    }
    } catch (error) {
      console.warn('[FCM] Failed to set up polling effect:', error)
      return () => {} // Safe no-op cleanup
    }
  }, [isAuthenticated])

  return null
}



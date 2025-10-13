'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNotificationPermission } from '../hooks/useNotificationPermission'

interface Props { onGranted?: () => void }

// Safe notification helpers to prevent ReferenceError
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

function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    if (!isNotificationSupported()) {
      return Promise.resolve('denied' as NotificationPermission)
    }
    const NotificationClass = (window as Window & { Notification?: typeof Notification }).Notification
    return NotificationClass?.requestPermission() || Promise.resolve('denied' as NotificationPermission)
  } catch {
    return Promise.resolve('denied' as NotificationPermission)
  }
}

function createSafeNotification(title: string, options?: NotificationOptions): boolean {
  try {
    if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
      return false
    }
    const NotificationClass = (window as Window & { Notification?: typeof Notification }).Notification
    if (NotificationClass) {
      new NotificationClass(title, options)
      return true
    }
    return false
  } catch {
    return false
  }
}

export default function PromptNotificationPermission({ onGranted }: Props) {
  const { isAuthenticated, isLoading } = useAuth()
  const { registerDeviceAfterPermission } = useNotificationPermission()
  const [shouldShow, setShouldShow] = useState(false)
  const [isSecureContext, setIsSecureContext] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      
      // Don't show if user is not authenticated or still loading
      if (!isAuthenticated || isLoading) {
        setShouldShow(false)
        return
      }
      
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecure = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      setIsSecureContext(isSecure)
      
      // Only show if user is authenticated, notifications are supported, in secure context, and not dismissed
      const dismissed = localStorage.getItem('notif_prompt_dismissed') === '1'
      if (isNotificationSupported() && getNotificationPermission() === 'default' && !dismissed && isSecure) {
        setShouldShow(true)
      }
      
      // Log notification support status for debugging
      console.log('Notification support check:', {
        isAuthenticated,
        isLoading,
        hasNotification: isNotificationSupported(),
        permission: getNotificationPermission(),
        isSecureContext: isSecure,
        dismissed,
        protocol: window.location.protocol,
        hostname: window.location.hostname
      })
    } catch (error) {
      console.warn('[NotificationPrompt] Error during initialization:', error)
    }
  }, [isAuthenticated, isLoading])

  // Reset dismissal when user logs in (for testing purposes)
  useEffect(() => {
    if (isAuthenticated) {
      // Only reset if permission is default (not granted or denied)
      if (getNotificationPermission() === 'default') {
        localStorage.removeItem('notif_prompt_dismissed')
        console.log('[NotificationPrompt] Reset dismissal for authenticated user')
      }
    }
  }, [isAuthenticated])

  if (!shouldShow) return null

  async function handleAllowClick() {
    console.log('Notification permission request initiated')
    
    try {
      // Check if Notification API is available
      if (!isNotificationSupported()) {
        console.error('Notifications not supported in this browser')
        alert('متأسفانه مرورگر شما از اعلان‌ها پشتیبانی نمی‌کند')
        return
      }
      
      // Check if we're in a secure context
      if (!isSecureContext) {
        console.error('Notifications require HTTPS or localhost')
        alert('برای فعال‌سازی اعلان‌ها، سایت باید از HTTPS استفاده کند')
        return
      }
      
      console.log('Requesting notification permission...')
      const perm = await requestNotificationPermission()
      console.log('Permission result:', perm)
      
      if (perm === 'granted') {
        console.log('Notification permission granted')
        localStorage.setItem('notif_prompt_dismissed', '1')
        setShouldShow(false)
        onGranted?.()
        
        // Register device with backend after permission is granted
        try {
          await registerDeviceAfterPermission()
        } catch (error) {
          console.error('Error registering device after permission:', error)
        }
        
        // Trigger permission change event for other components
        try {
          window.dispatchEvent(new CustomEvent('notification-permission-changed'))
        } catch (error) {
          console.warn('Failed to dispatch permission change event:', error)
        }
        
        // Test notification to confirm it works
        const logo = window.location.hostname === 'kalame.chat' ? '/kalame-logo.png' : '/okian-logo.svg'
        const notificationCreated = createSafeNotification('اعلان‌ها فعال شد!', {
          body: 'شما اکنون اعلان‌های مهم را دریافت خواهید کرد.',
          icon: logo,
          tag: 'permission-granted'
        })
        
        if (!notificationCreated) {
          console.warn('Test notification could not be created')
        }
      } else if (perm === 'denied') {
        console.log('Notification permission denied')
        localStorage.setItem('notif_prompt_dismissed', '1')
        setShouldShow(false)
        alert('اعلان‌ها مسدود شده‌اند. می‌توانید از تنظیمات مرورگر آن‌ها را فعال کنید.')
      } else {
        console.log('Notification permission dismissed')
        // Don't mark as dismissed if user just closed the dialog
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      alert('خطا در درخواست مجوز اعلان‌ها. لطفاً دوباره تلاش کنید.')
    }
  }

  function handleLater() {
    localStorage.setItem('notif_prompt_dismissed', '1')
    setShouldShow(false)
  }

  return (
    <div className="fixed top-3 inset-x-0 flex justify-center z-[100]">
      <div className="mx-2 max-w-xl w-full rounded-2xl border border-blue-200 bg-white/90 backdrop-blur-md shadow-lg p-4 dark:bg-gray-800/90 dark:border-blue-900" dir="rtl">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V7a8 8 0 10-16 0v5c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 dark:text-gray-100">فعال‌سازی اعلان‌ها</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">برای دریافت به‌روزرسانی‌ها و اعلان‌های مهم، لطفاً دسترسی اعلان را فعال کنید.</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAllowClick} className="rounded-lg px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">فعال‌سازی</button>
            <button onClick={handleLater} className="rounded-lg px-3 py-1.5 bg-gray-200 text-gray-800 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">بعداً</button>
          </div>
        </div>
      </div>
    </div>
  )
}



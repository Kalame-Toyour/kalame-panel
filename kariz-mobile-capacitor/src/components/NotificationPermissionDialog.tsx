import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { Capacitor } from '@capacitor/core'

interface NotificationPermissionDialogProps {
  isVisible: boolean
  onClose: () => void
  onPermissionGranted: () => void
}

export default function NotificationPermissionDialog({
  isVisible,
  onClose,
  onPermissionGranted
}: NotificationPermissionDialogProps) {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'default'>('unknown')
  const [isRequesting, setIsRequesting] = useState(false)
  const [androidVersion, setAndroidVersion] = useState<number>(0)

  useEffect(() => {
    if (isVisible) {
      checkPermissionStatus()
      checkAndroidVersion()
    }
  }, [isVisible])

  const checkAndroidVersion = async () => {
    try {
      if (Capacitor?.isNativePlatform?.()) {
        // Check if Device plugin is available
        if (Capacitor.isPluginAvailable('Device')) {
          const { Device } = await import('@capacitor/device')
          const deviceInfo = await Device.getInfo()
          const version = parseInt(deviceInfo.osVersion || '0')
          setAndroidVersion(version)
          console.log('[NotificationDialog] Android version detected:', version)
        } else {
          // Fallback: try to detect Android version from user agent
          const userAgent = navigator.userAgent
          const androidMatch = userAgent.match(/Android\s+(\d+)/)
          if (androidMatch && androidMatch[1]) {
            const version = parseInt(androidMatch[1])
            setAndroidVersion(version)
            console.log('[NotificationDialog] Android version from user agent:', version)
          }
        }
      }
    } catch (error) {
      console.error('[NotificationDialog] Error detecting Android version:', error)
    }
  }

  const checkPermissionStatus = async () => {
    try {
      if ('Notification' in window) {
        const currentPermission = Notification.permission
        console.log('[NotificationDialog] Current notification permission:', currentPermission)
        setPermissionStatus(currentPermission)
        
        // If permission is already granted, call the callback
        if (currentPermission === 'granted') {
          localStorage.setItem('kariz_notification_permission', 'granted')
          onPermissionGranted()
          setTimeout(() => {
            onClose()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('[NotificationDialog] Error checking notification permission:', error)
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('[NotificationDialog] Notifications not supported in this browser')
      return
    }

    setIsRequesting(true)
    try {
      console.log('[NotificationDialog] Requesting notification permission...')
      const permission = await Notification.requestPermission()
      console.log('[NotificationDialog] Permission request result:', permission)
      setPermissionStatus(permission)
      
      if (permission === 'granted') {
        // Save to localStorage that permission was granted
        localStorage.setItem('kariz_notification_permission', 'granted')
        console.log('[NotificationDialog] Permission granted, calling callback...')
        onPermissionGranted()
        setTimeout(() => {
          onClose()
        }, 2000)
      } else if (permission === 'denied') {
        // Save to localStorage that permission was denied
        localStorage.setItem('kariz_notification_permission', 'denied')
        // Increment denied count
        const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0') + 1
        localStorage.setItem('kariz_notification_denied_count', deniedCount.toString())
        console.log('[NotificationDialog] Permission denied, count:', deniedCount)
      }
    } catch (error) {
      console.error('[NotificationDialog] Error requesting notification permission:', error)
      setPermissionStatus('denied')
      // Save to localStorage that permission was denied
      localStorage.setItem('kariz_notification_permission', 'denied')
      // Increment denied count
      const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0') + 1
      localStorage.setItem('kariz_notification_denied_count', deniedCount.toString())
    } finally {
      setIsRequesting(false)
    }
  }

  const openAndroidSettings = () => {
    if (Capacitor.isNativePlatform()) {
      // Show instructions to user
      alert('برای فعال‌سازی نوتیفیکیشن:\n\n1. به تنظیمات گوشی بروید\n2. اپلیکیشن‌ها را انتخاب کنید\n3. کلمه را پیدا کنید\n4. نوتیفیکیشن‌ها را فعال کنید')
    }
  }

  // Determine if we should show the request permission button
  const shouldShowRequestButton = () => {
    // For Android 13+, always show request button if permission is not granted
    if (androidVersion >= 13) {
      return permissionStatus !== 'granted'
    }
    
    // For older Android versions, show button only for 'default' status
    return permissionStatus === 'default'
  }

  // Determine if we should show the Android settings button
  const shouldShowSettingsButton = () => {
    return Capacitor.isNativePlatform() && permissionStatus === 'denied'
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Bell size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          فعال‌سازی نوتیفیکیشن
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
          برای دریافت پیام‌های مهم و به‌روزرسانی‌ها، لطفاً اجازه نمایش نوتیفیکیشن را بدهید
        </p>

        {/* Android Version Info */}
        {androidVersion > 0 && (
          <div className="mb-4 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
            <div className="text-xs text-blue-700 dark:text-blue-300 text-center">
              اندروید {androidVersion} - {androidVersion >= 13 ? 'نیاز به مجوز POST_NOTIFICATIONS' : 'مجوز خودکار'}
            </div>
          </div>
        )}

        {/* Permission Status */}
        <div className="mb-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-2">
            {permissionStatus === 'granted' ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  نوتیفیکیشن فعال است
                </span>
              </>
            ) : permissionStatus === 'denied' ? (
              <>
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  نوتیفیکیشن مسدود شده است
                </span>
              </>
            ) : permissionStatus === 'default' ? (
              <>
                <Bell size={16} className="text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  در انتظار تصمیم کاربر
                </span>
              </>
            ) : (
              <>
                <Bell size={16} className="text-orange-500" />
                <span className="text-sm text-orange-700 dark:text-orange-300">
                  وضعیت مجوز نامشخص
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Request Permission Button - Show for Android 13+ or default status */}
          {shouldShowRequestButton() && (
            <button
              onClick={requestPermission}
              disabled={isRequesting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isRequesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال درخواست...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  {androidVersion >= 13 ? 'درخواست مجوز نوتیفیکیشن' : 'دادن دسترسی'}
                </>
              )}
            </button>
          )}

          {/* Android Settings Button */}
          {shouldShowSettingsButton() && (
            <button
              onClick={openAndroidSettings}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              راهنمای تنظیمات اندروید
            </button>
          )}

          {/* Close Button for granted permission */}
          {permissionStatus === 'granted' && (
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              بستن
            </button>
          )}

          {/* Skip Button for other cases */}
          {permissionStatus !== 'granted' && !shouldShowRequestButton() && (
            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              بعداً
            </button>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          می‌توانید این تنظیمات را بعداً از بخش تنظیمات اپلیکیشن تغییر دهید
        </p>

        {/* Debug Info - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div>Debug Info:</div>
              <div>Permission Status: {permissionStatus}</div>
              <div>Android Version: {androidVersion}</div>
              <div>Is Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</div>
              <div>Browser Permission: {'Notification' in window ? Notification.permission : 'Not Available'}</div>
              <div>Show Request Button: {shouldShowRequestButton() ? 'Yes' : 'No'}</div>
              <div>Show Settings Button: {shouldShowSettingsButton() ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


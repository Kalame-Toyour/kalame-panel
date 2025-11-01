import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { notificationPermissionManager, type NotificationPermissionInfo } from '../utils/notificationPermissionManager'

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
  const [permissionInfo, setPermissionInfo] = useState<NotificationPermissionInfo>({
    status: 'unknown',
    platform: 'unknown',
    androidVersion: 0,
    canRequest: false,
    needsDialog: false
  })
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    if (isVisible) {
      checkPermissionInfo()
    }
  }, [isVisible])

  const checkPermissionInfo = async () => {
    try {
      const info = await notificationPermissionManager.getPermissionInfo()
      
      // Normalize status: convert 'unknown' to 'default' so user can still request
      const normalizedStatus = info.status === 'unknown' ? 'default' : info.status
      const normalizedInfo = { ...info, status: normalizedStatus }
      
      setPermissionInfo(normalizedInfo)
      console.log('[NotificationDialog] Permission info:', normalizedInfo)
      
      // If permission is already granted, call the callback
      if (normalizedInfo.status === 'granted') {
        localStorage.setItem('kariz_notification_permission', 'granted')
        onPermissionGranted()
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('[NotificationDialog] Error checking permission info:', error)
      // On error, set to default so user can still try
      setPermissionInfo(prev => ({ ...prev, status: 'default', canRequest: true }))
    }
  }

  const requestPermission = async () => {
    if (!permissionInfo.canRequest) {
      console.warn('[NotificationDialog] Cannot request permission')
      return
    }

    setIsRequesting(true)
    try {
      console.log('[NotificationDialog] Requesting notification permission...')
      const result = await notificationPermissionManager.requestPermission()
      console.log('[NotificationDialog] Permission request result:', result)
      
      if (result === 'granted') {
        // Permission was granted, update local state
        setPermissionInfo(prev => ({ ...prev, status: 'granted' }))
        
        // Call callback immediately for granted permission
        onPermissionGranted()
        
        // Close dialog after a short delay
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        // Permission was denied or default, update local state
        setPermissionInfo(prev => ({ ...prev, status: result }))
      }
    } catch (error) {
      console.error('[NotificationDialog] Error requesting permission:', error)
      showToast('خطا در درخواست مجوز', 'error')
      
      // Add fallback: check if permission was actually granted despite the error
      setTimeout(async () => {
        try {
          const currentStatus = await notificationPermissionManager.getCurrentPermissionStatus()
          if (currentStatus === 'granted') {
            console.log('[NotificationDialog] Fallback: Permission was actually granted')
            setPermissionInfo(prev => ({ ...prev, status: 'granted' }))
            onPermissionGranted()
            setTimeout(() => onClose(), 1500)
          }
        } catch (fallbackError) {
          console.error('[NotificationDialog] Fallback check failed:', fallbackError)
        }
      }, 2000)
    } finally {
      setIsRequesting(false)
    }
  }

  const openAndroidSettings = async () => {
    try {
      await notificationPermissionManager.openNotificationSettings()
    } catch (error) {
      console.error('[NotificationDialog] Error opening notification settings:', error)
      showToast('خطا در باز کردن تنظیمات', 'error')
    }
  }

  // Helper function to show toast (you can replace this with your toast system)
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`[NotificationDialog] Toast (${type}):`, message)
    // You can integrate this with your existing toast system
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(message, type)
    }
  }

  // Determine if we should show the request permission button
  const shouldShowRequestButton = () => {
    // Show button if:
    // 1. Can request permission, and
    // 2. Status is not granted, and
    // 3. Status is not not_supported (no point showing button if not supported)
    return permissionInfo.canRequest && 
           permissionInfo.status !== 'granted' && 
           permissionInfo.status !== 'not_supported' &&
           permissionInfo.platform !== 'web' // Don't show for web in native app context
  }

  // Determine if we should show the Android settings button
  const shouldShowSettingsButton = () => {
    return permissionInfo.platform === 'native' && permissionInfo.status === 'denied'
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

        {/* Platform and Android Version Info */}
        {/* <div className="mb-4 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
          <div className="text-xs text-blue-700 dark:text-blue-300 text-center">
            {permissionInfo.platform === 'native' ? 'اپلیکیشن اندروید' : 'مرورگر وب'} - 
            {permissionInfo.androidVersion > 0 ? ` اندروید ${permissionInfo.androidVersion}` : ''} - 
            {permissionInfo.androidVersion >= 13 ? 'نیاز به مجوز POST_NOTIFICATIONS' : 'مجوز خودکار'}
          </div>
        </div> */}

        {/* Permission Status */}
        <div className="mb-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-2">
            {permissionInfo.status === 'granted' ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  نوتیفیکیشن فعال است
                </span>
              </>
            ) : permissionInfo.status === 'denied' ? (
              <>
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  نوتیفیکیشن مسدود شده است
                </span>
              </>
            ) : permissionInfo.status === 'not_supported' ? (
              <>
                <AlertCircle size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  نوتیفیکیشن در این دستگاه پشتیبانی نمی‌شود
                </span>
              </>
            ) : (
              <>
                <Bell size={16} className="text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  برای فعال‌سازی نوتیفیکیشن، روی دکمه زیر کلیک کنید
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Request Permission Button */}
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
                  {permissionInfo.platform === 'native' ? 'درخواست مجوز نوتیفیکیشن' : 'دادن دسترسی'}
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
          {permissionInfo.status === 'granted' && (
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              بستن
            </button>
          )}

          {/* Skip Button for other cases */}
          {permissionInfo.status !== 'granted' && !shouldShowRequestButton() && permissionInfo.status !== 'not_supported' && (
            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              بعداً
            </button>
          )}

          {/* Message for not_supported status */}
          {permissionInfo.status === 'not_supported' && (
            <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg text-center">
              متأسفانه نوتیفیکیشن در این دستگاه شما پشتیبانی نمی‌شود
            </div>
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
              <div>Permission Status: {permissionInfo.status}</div>
              <div>Platform: {permissionInfo.platform}</div>
              <div>Android Version: {permissionInfo.androidVersion}</div>
              <div>Can Request: {permissionInfo.canRequest ? 'Yes' : 'No'}</div>
              <div>Needs Dialog: {permissionInfo.needsDialog ? 'Yes' : 'No'}</div>
              <div>AndroidInterface Available: {(window as any).AndroidInterface ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


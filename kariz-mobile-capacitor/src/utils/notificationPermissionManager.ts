import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

export interface NotificationPermissionInfo {
  status: 'granted' | 'denied' | 'default' | 'unknown' | 'not_supported'
  platform: 'native' | 'web' | 'unknown'
  androidVersion: number
  canRequest: boolean
  needsDialog: boolean
}

export class NotificationPermissionManager {
  private static instance: NotificationPermissionManager
  private androidVersion: number = 0
  private platform: 'native' | 'web' | 'unknown' = 'unknown'

  private constructor() {
    this.detectPlatform()
    this.detectAndroidVersion()
  }

  public static getInstance(): NotificationPermissionManager {
    if (!NotificationPermissionManager.instance) {
      NotificationPermissionManager.instance = new NotificationPermissionManager()
    }
    return NotificationPermissionManager.instance
  }

  private async detectPlatform() {
    this.platform = Capacitor?.isNativePlatform?.() ? 'native' : 'web'
    console.log('[NotificationManager] Platform detected:', this.platform)
  }

  private async detectAndroidVersion() {
    try {
      if (this.platform === 'native') {
        // Check if Device plugin is available
        if (Capacitor.isPluginAvailable('Device')) {
          const { Device } = await import('@capacitor/device')
          const deviceInfo = await Device.getInfo()
          this.androidVersion = parseInt(deviceInfo.osVersion || '0')
        } else {
          // Fallback: try to detect Android version from user agent
          const userAgent = navigator.userAgent
          const androidMatch = userAgent.match(/Android\s+(\d+)/)
          if (androidMatch && androidMatch[1]) {
            this.androidVersion = parseInt(androidMatch[1])
          }
        }
      }
      console.log('[NotificationManager] Android version detected:', this.androidVersion)
    } catch (error) {
      console.error('[NotificationManager] Error detecting Android version:', error)
    }
  }

  public async getPermissionInfo(): Promise<NotificationPermissionInfo> {
    const status = await this.getCurrentPermissionStatus()
    const canRequest = await this.canRequestPermission()
    const needsDialog = this.needsPermissionDialog()

    return {
      status,
      platform: this.platform,
      androidVersion: this.androidVersion,
      canRequest,
      needsDialog
    }
  }

  public async getCurrentPermissionStatus(): Promise<'granted' | 'denied' | 'default' | 'unknown' | 'not_supported'> {
    try {
      // First, check localStorage as primary source of truth for saved status
      const localStatus = localStorage.getItem('kariz_notification_permission')
      
      // For native platform, use Capacitor PushNotifications API
      if (this.platform === 'native' && Capacitor.isNativePlatform()) {
        try {
          if (Capacitor.isPluginAvailable('PushNotifications')) {
            const perm = await PushNotifications.checkPermissions()
            console.log('[NotificationManager] Capacitor permission status:', perm.receive)
            
            // Map Capacitor permission to our status
            let status: 'granted' | 'denied' | 'default'
            if (perm.receive === 'granted') {
              status = 'granted'
            } else if (perm.receive === 'denied') {
              status = 'denied'
            } else {
              status = 'default'
            }
            
            // Update localStorage to match Capacitor status
            if (status === 'granted') {
              localStorage.setItem('kariz_notification_permission', 'granted')
            } else if (status === 'denied') {
              localStorage.setItem('kariz_notification_permission', 'denied')
            }
            
            return status
          } else {
            console.warn('[NotificationManager] PushNotifications plugin not available')
            // If we had a denied status before, maintain it
            if (localStatus === 'denied') {
              return 'denied'
            }
            return 'default'
          }
        } catch (error) {
          console.error('[NotificationManager] Error getting Capacitor permission status:', error)
          // If we had a denied status before, maintain it
          if (localStatus === 'denied') {
            return 'denied'
          }
          // Otherwise, treat as default - user can still request permission
          return 'default'
        }
      } else if ('Notification' in window) {
        // For web platform, use browser API
        const browserPermission = Notification.permission
        console.log('[NotificationManager] Web permission status:', browserPermission)
        
        // Validate browser permission
        if (browserPermission === 'granted' || browserPermission === 'denied' || browserPermission === 'default') {
          // Update localStorage to match browser status
          if (browserPermission === 'granted') {
            localStorage.setItem('kariz_notification_permission', 'granted')
          } else if (browserPermission === 'denied') {
            localStorage.setItem('kariz_notification_permission', 'denied')
          }
          return browserPermission as any
        }
        
        // If browser permission is invalid, treat as default
        return 'default'
      } else {
        // Notifications not supported
        return 'not_supported'
      }
    } catch (error) {
      console.error('[NotificationManager] Error getting permission status:', error)
      // Check localStorage as fallback
      try {
        const localStatus = localStorage.getItem('kariz_notification_permission')
        if (localStatus === 'granted') {
          return 'granted'
        }
        if (localStatus === 'denied') {
          return 'denied'
        }
        // If no saved status and error occurred, default to 'default' so user can still try
        return 'default'
      } catch (localError) {
        console.error('[NotificationManager] Error checking localStorage:', localError)
        // Last resort: return default so user can try requesting
        return 'default'
      }
    }
  }

  public async canRequestPermission(): Promise<boolean> {
    if (this.platform === 'native' && Capacitor.isNativePlatform()) {
      // For native platform, check Capacitor permissions
      try {
        if (Capacitor.isPluginAvailable('PushNotifications')) {
          const perm = await PushNotifications.checkPermissions()
          // Can request if not already granted or denied permanently
          return perm.receive !== 'granted' && perm.receive !== 'denied'
        }
        return true // If plugin not available, allow trying
      } catch (error) {
        console.error('[NotificationManager] Error checking if can request:', error)
        return true // Allow trying on error
      }
    } else if ('Notification' in window) {
      // For web platform, only allow for 'default' status
      return Notification.permission === 'default'
    }
    return false
  }

  public needsPermissionDialog(): boolean {
    // Check if permission was already granted
    const permissionStatus = localStorage.getItem('kariz_notification_permission')
    if (permissionStatus === 'granted') {
      return false
    }

    if (this.platform === 'native' && this.androidVersion >= 13) {
      // For Android 13+ on native platform, always show dialog if not granted
      return true
    } else if (this.platform === 'web' && 'Notification' in window) {
      // For web platform, check browser permission
      const browserPermission = Notification.permission
      if (browserPermission === 'granted') {
        return false
      }
      
      if (browserPermission === 'denied') {
        // Check if we should show again based on visit count
        const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0')
        const visitCount = parseInt(localStorage.getItem('kariz_visit_count') || '0') + 1
        localStorage.setItem('kariz_visit_count', visitCount.toString())
        
        // Show dialog every 3 visits for denied permissions
        return visitCount % 3 === 0
      }
      
      // For 'default' or 'unknown' status, show dialog
      return true
    }

    // If we can't determine, check if permission was denied before
    if (permissionStatus === 'denied') {
      const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0')
      const visitCount = parseInt(localStorage.getItem('kariz_visit_count') || '0') + 1
      localStorage.setItem('kariz_visit_count', visitCount.toString())
      
      // Show dialog every 5 visits for denied permissions
      return visitCount % 5 === 0
    }

    // First time user or unknown status, show dialog
    return true
  }

  public async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    try {
      if (this.platform === 'native' && Capacitor.isNativePlatform()) {
        // For native platform, use Capacitor PushNotifications API
        console.log('[NotificationManager] Requesting notification permission via Capacitor')
        return this.requestCapacitorPermission()
      } else if ('Notification' in window) {
        // For web platform, use browser API
        console.log('[NotificationManager] Requesting web notification permission')
        return this.requestBrowserPermission()
      } else {
        throw new Error('Notifications not supported in this environment')
      }
    } catch (error) {
      console.error('[NotificationManager] Error requesting permission:', error)
      throw error
    }
  }

  private async requestCapacitorPermission(): Promise<'granted' | 'denied' | 'default'> {
    try {
      if (!Capacitor.isPluginAvailable('PushNotifications')) {
        throw new Error('PushNotifications plugin not available')
      }

      console.log('[NotificationManager] Requesting permission via PushNotifications.requestPermissions()')
      const result = await PushNotifications.requestPermissions()
      console.log('[NotificationManager] Capacitor permission request result:', result.receive)
      
      let status: 'granted' | 'denied' | 'default'
      if (result.receive === 'granted') {
        status = 'granted'
        localStorage.setItem('kariz_notification_permission', 'granted')
        // Dispatch custom event for permission granted
        try {
          window.dispatchEvent(new CustomEvent('notificationPermissionGranted', { detail: 'granted' }))
          console.log('[NotificationManager] notificationPermissionGranted event dispatched successfully')
        } catch (eventError) {
          console.error('[NotificationManager] Error dispatching notificationPermissionGranted event:', eventError)
        }
      } else if (result.receive === 'denied') {
        status = 'denied'
        localStorage.setItem('kariz_notification_permission', 'denied')
        const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0') + 1
        localStorage.setItem('kariz_notification_denied_count', deniedCount.toString())
      } else {
        status = 'default'
      }
      
      return status
    } catch (error) {
      console.error('[NotificationManager] Error requesting Capacitor permission:', error)
      throw error
    }
  }

  private async requestBrowserPermission(): Promise<'granted' | 'denied' | 'default'> {
    try {
      const permission = await Notification.requestPermission()
      console.log('[NotificationManager] Browser permission request result:', permission)
      
      if (permission === 'granted') {
        localStorage.setItem('kariz_notification_permission', 'granted')
      } else if (permission === 'denied') {
        localStorage.setItem('kariz_notification_permission', 'denied')
        const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0') + 1
        localStorage.setItem('kariz_notification_denied_count', deniedCount.toString())
      }
      
      return permission as any
    } catch (error) {
      console.error('[NotificationManager] Error requesting browser permission:', error)
      throw error
    }
  }

  public async openNotificationSettings(): Promise<void> {
    try {
      if (this.platform === 'native' && Capacitor.isNativePlatform()) {
        // Use Capacitor App plugin to open settings
        try {
          const { App } = await import('@capacitor/app')
          await App.openUrl({ url: 'app-settings:' })
          console.log('[NotificationManager] Opened app settings via Capacitor')
          return
        } catch (appError) {
          console.warn('[NotificationManager] Could not open settings via App plugin:', appError)
        }
        
        // Fallback: try Browser plugin
        try {
          const { Browser } = await import('@capacitor/browser')
          // Android settings URI
          await Browser.open({ url: 'android.settings.APP_NOTIFICATION_SETTINGS' })
          console.log('[NotificationManager] Opened settings via Browser plugin')
          return
        } catch (browserError) {
          console.warn('[NotificationManager] Could not open settings via Browser plugin:', browserError)
        }
      }
      
      // Fallback: show instructions
      console.log('[NotificationManager] Native settings not available, showing instructions')
      this.showNotificationSettingsInstructions()
    } catch (error) {
      console.error('[NotificationManager] Error opening notification settings:', error)
      this.showNotificationSettingsInstructions()
    }
  }

  private showNotificationSettingsInstructions(): void {
    const message = 'برای فعال‌سازی نوتیفیکیشن:\n\n1. به تنظیمات گوشی بروید\n2. اپلیکیشن‌ها را انتخاب کنید\n3. کلمه را پیدا کنید\n4. نوتیفیکیشن‌ها را فعال کنید'
    
    // Try to use existing toast system
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(message, 'info')
    } else {
      // Fallback to alert
      alert(message)
    }
  }

  public resetPermissionState(): void {
    localStorage.removeItem('kariz_notification_permission')
    localStorage.removeItem('kariz_notification_denied_count')
    localStorage.removeItem('kariz_visit_count')
    console.log('[NotificationManager] Permission state reset')
  }
}

// Export singleton instance
export const notificationPermissionManager = NotificationPermissionManager.getInstance()

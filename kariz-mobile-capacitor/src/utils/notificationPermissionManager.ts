import { Capacitor } from '@capacitor/core'

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
    const canRequest = this.canRequestPermission()
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
      if (this.platform === 'native' && this.androidVersion >= 13) {
        // For Android 13+ on native platform, check native permission status
        if ((window as any).AndroidInterface && typeof (window as any).AndroidInterface.getNotificationPermissionStatus === 'function') {
          try {
            const status = (window as any).AndroidInterface.getNotificationPermissionStatus()
            console.log('[NotificationManager] Native permission status:', status)
            
            // Also check localStorage as a backup
            const localStatus = localStorage.getItem('kariz_notification_permission')
            if (status === 'granted' || localStatus === 'granted') {
              return 'granted'
            }
            
            return status as any
          } catch (error) {
            console.error('[NotificationManager] Error getting native permission status:', error)
            // Fallback to localStorage
            const localStatus = localStorage.getItem('kariz_notification_permission')
            if (localStatus === 'granted') {
              return 'granted'
            }
            return 'unknown'
          }
        } else {
          console.warn('[NotificationManager] AndroidInterface not available')
          // Check localStorage as fallback
          const localStatus = localStorage.getItem('kariz_notification_permission')
          if (localStatus === 'granted') {
            return 'granted'
          }
          return 'unknown'
        }
      } else if ('Notification' in window) {
        // For web or older Android versions, use browser API
        const browserPermission = Notification.permission
        console.log('[NotificationManager] Browser permission status:', browserPermission)
        
        // Also check localStorage as a backup
        const localStatus = localStorage.getItem('kariz_notification_permission')
        if (browserPermission === 'granted' || localStatus === 'granted') {
          return 'granted'
        }
        
        return browserPermission as any
      } else {
        // Check localStorage as last resort
        const localStatus = localStorage.getItem('kariz_notification_permission')
        if (localStatus === 'granted') {
          return 'granted'
        }
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
      } catch (localError) {
        console.error('[NotificationManager] Error checking localStorage:', localError)
      }
      return 'unknown'
    }
  }

  public canRequestPermission(): boolean {
    if (this.platform === 'native' && this.androidVersion >= 13) {
      // For Android 13+ on native platform, always allow request
      return true
    } else if ('Notification' in window) {
      // For web or older Android versions, only allow for 'default' status
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
      if (this.platform === 'native' && this.androidVersion >= 13) {
        // For Android 13+ on native platform, use native permission request
        console.log('[NotificationManager] Requesting native notification permission for Android 13+')
        return this.requestNativePermission()
      } else if ('Notification' in window) {
        // For web or older Android versions, use browser API
        console.log('[NotificationManager] Requesting browser notification permission')
        return this.requestBrowserPermission()
      } else {
        throw new Error('Notifications not supported in this environment')
      }
    } catch (error) {
      console.error('[NotificationManager] Error requesting permission:', error)
      throw error
    }
  }

  private async requestNativePermission(): Promise<'granted' | 'denied' | 'default'> {
    return new Promise((resolve, reject) => {
      if (!(window as any).AndroidInterface || typeof (window as any).AndroidInterface.requestNotificationPermission !== 'function') {
        reject(new Error('AndroidInterface.requestNotificationPermission not available'))
        return
      }

      // Set up one-time event listener for permission result
      const handlePermissionResult = (result: string) => {
        console.log('[NotificationManager] Native permission result received:', result)
        
        // Clean up event listeners
        if ((window as any).__notificationPermissionCleanup) {
          (window as any).__notificationPermissionCleanup()
        }
        delete (window as any).onNotificationPermissionResult
        
        if (result === 'granted') {
          localStorage.setItem('kariz_notification_permission', 'granted')
          // Dispatch custom event for permission granted
          try {
            window.dispatchEvent(new CustomEvent('notificationPermissionGranted', { detail: 'granted' }))
            console.log('[NotificationManager] notificationPermissionGranted event dispatched successfully')
          } catch (eventError) {
            console.error('[NotificationManager] Error dispatching notificationPermissionGranted event:', eventError)
          }
          resolve('granted')
        } else if (result === 'denied') {
          localStorage.setItem('kariz_notification_permission', 'denied')
          const deniedCount = parseInt(localStorage.getItem('kariz_notification_denied_count') || '0') + 1
          localStorage.setItem('kariz_notification_denied_count', deniedCount.toString())
          resolve('denied')
        } else {
          resolve('default')
        }
      }

      // Set up global function for Android to call
      ;(window as any).onNotificationPermissionResult = handlePermissionResult

      // Set up custom event listener
      const handlePermissionEvent = (event: CustomEvent) => {
        handlePermissionResult(event.detail)
      }

      window.addEventListener('notificationPermissionResult', handlePermissionEvent as EventListener)
      
      // Store cleanup function
      ;(window as any).__notificationPermissionCleanup = () => {
        window.removeEventListener('notificationPermissionResult', handlePermissionEvent as EventListener)
        delete (window as any).onNotificationPermissionResult
      }

      // Call native permission request
      try {
        (window as any).AndroidInterface.requestNotificationPermission()
        console.log('[NotificationManager] Native permission request sent')
      } catch (error) {
        // Clean up on error
        if ((window as any).__notificationPermissionCleanup) {
          (window as any).__notificationPermissionCleanup()
        }
        reject(error)
      }
    })
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

  public openNotificationSettings(): void {
    try {
      if (this.platform === 'native' && (window as any).AndroidInterface && typeof (window as any).AndroidInterface.openNotificationSettings === 'function') {
        // console.log('[NotificationManager] Opening native notification settings...')
        (window as any).AndroidInterface.openNotificationSettings()
      } else {
        // Fallback: show instructions
        console.log('[NotificationManager] Native settings not available, showing instructions')
        this.showNotificationSettingsInstructions()
      }
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

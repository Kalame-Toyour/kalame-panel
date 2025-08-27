import { PushNotifications } from '@capacitor/push-notifications'
import { Device } from '@capacitor/device'
import { FirebaseMessaging, type TokenReceivedEvent, type NotificationActionPerformedEvent, type NotificationReceivedEvent } from '@capacitor-firebase/messaging'
// Browser plugin is optional; if unavailable, fall back to window.open
import { api } from '../utils/api'
import { getAuth } from '../hooks/useAuth'
import { Capacitor } from '@capacitor/core'

// Helper function to check if we need to request notification permissions
export async function shouldRequestNotificationPermissions(): Promise<boolean> {
  try {
    if (!Capacitor?.isNativePlatform?.()) {
      return false // Not native platform
    }
    
    const deviceInfo = await Device.getInfo()
    const androidVersion = parseInt(deviceInfo.osVersion || '0')
    
    console.log('[MobilePush] Android version detected:', androidVersion)
    
    // For Android < 13 (API < 33), we don't need to request POST_NOTIFICATIONS permission
    // The system will automatically grant notification permissions
    return androidVersion >= 13
  } catch (e) {
    console.warn('[MobilePush] Could not detect Android version, assuming permission needed:', e)
    return true // Assume we need permissions if we can't detect version
  }
}

export async function initMobilePushRegistration() {
  try {
    console.log('[MobilePush] init start')
    if (!Capacitor?.isNativePlatform?.()) {
      console.log('[MobilePush] Skip init: not running on native platform')
      return
    }
    
    const auth = getAuth?.()
    if (!auth?.accessToken) {
      // Not logged in, do not request permission or register
      console.log('[MobilePush] Skip init: not authenticated')
      return
    }

    console.log('[MobilePush] User authenticated, proceeding with push setup')

    // Step 1: Check if we need to request notification permissions
    const needsPermissionRequest = await shouldRequestNotificationPermissions()
    console.log('[MobilePush] Needs permission request:', needsPermissionRequest)

    // Step 2: Handle permissions only if needed
    if (needsPermissionRequest) {
      try {
        // Check if permission was already granted via our custom dialog
        const permissionStatus = localStorage.getItem('kariz_notification_permission')
        console.log('[MobilePush] Local permission status:', permissionStatus)
        
        if (permissionStatus === 'granted') {
          console.log('[MobilePush] Permission already granted via custom dialog, proceeding with push setup')
        } else {
          // First check browser notification permission
          if ('Notification' in window) {
            const browserPermission = Notification.permission
            console.log('[MobilePush] Browser notification permission:', browserPermission)
            
            if (browserPermission === 'granted') {
              console.log('[MobilePush] Browser permission already granted, proceeding with push setup')
            } else if (browserPermission === 'denied') {
              console.warn('[MobilePush] Browser notification permission denied, cannot proceed')
              return
            } else {
              console.log('[MobilePush] Browser permission status:', browserPermission + ', will request via Capacitor')
            }
          }

          // Check Capacitor push notification permissions
          const perm = await PushNotifications.checkPermissions()
          console.log('[MobilePush] Capacitor push permission status:', perm.receive)
          
          if (perm.receive === 'granted') {
            console.log('[MobilePush] Capacitor permission already granted')
          } else {
            console.log('[MobilePush] Capacitor permission not granted, requesting...')
            const req = await PushNotifications.requestPermissions()
            console.log('[MobilePush] Capacitor permission request result:', req.receive)
            
            if (req.receive !== 'granted') {
              console.warn('[MobilePush] Capacitor notification permission denied by user')
              return
            }
          }
        }
      } catch (e) {
        console.error('[MobilePush] Error checking/requesting Capacitor permissions:', e)
        return
      }
    } else {
      console.log('[MobilePush] Skipping permission request for older Android version')
    }

    // Step 3: Register with OS push service
    try {
      await PushNotifications.register()
      console.log('[MobilePush] PushNotifications.register() successful')
    } catch (e) {
      console.error('[MobilePush] PushNotifications.register() failed:', e)
      // Continue anyway as this might not be critical
    }

    // Step 4: Request Firebase permissions (this handles Android 13+ POST_NOTIFICATIONS)
    if (needsPermissionRequest) {
      try {
        console.log('[MobilePush] Requesting Firebase permissions for Android 13+...')
        await FirebaseMessaging.requestPermissions()
        console.log('[MobilePush] FirebaseMessaging.requestPermissions() successful')
      } catch (e) {
        console.warn('[MobilePush] FirebaseMessaging.requestPermissions failed:', e)
        // Continue anyway as this might not be critical
      }
    } else {
      console.log('[MobilePush] Skipping Firebase permission request for older Android version')
    }

    // Step 5: Get FCM token
    let fcmToken: string | undefined
    try {
      console.log('[MobilePush] Attempting to get FCM token...')
      const tokenResult = await FirebaseMessaging.getToken()
      fcmToken = tokenResult.token
      console.log('[MobilePush] FCM token received, length:', fcmToken?.length || 0)
    } catch (e) {
      console.error('[MobilePush] Failed to get FCM token:', e)
      // Try alternative method
      try {
        const tokenResult = await FirebaseMessaging.getToken()
        fcmToken = tokenResult.token
        console.log('[MobilePush] FCM token received via alternative method, length:', fcmToken?.length || 0)
      } catch (e2) {
        console.error('[MobilePush] Alternative FCM token method also failed:', e2)
        return
      }
    }

    if (!fcmToken) {
      console.warn('[MobilePush] No FCM token received')
      return
    }

    // Step 6: Register token with server
    try {
      await registerTokenWithServer(fcmToken, auth.accessToken)
      console.log('[MobilePush] Token registered with server successfully')
    } catch (e) {
      console.error('[MobilePush] Failed to register token with server:', e)
      return
    }

    // Step 7: Set up listeners
    // Token refresh
    FirebaseMessaging.addListener('tokenReceived', (event: TokenReceivedEvent) => {
      console.log('[MobilePush] FCM token refreshed:', event.token)
      // Re-register with server
      registerTokenWithServer(event.token, auth.accessToken)
        .then(() => console.log('[MobilePush] Refreshed token registered with server'))
        .catch(err => console.error('[MobilePush] Failed to register refreshed token:', err))
    })

    // Notification received while app is in foreground
    FirebaseMessaging.addListener('notificationReceived', (event: NotificationReceivedEvent) => {
      console.log('[MobilePush] Notification received in foreground:', event.notification)
      // You can show a custom in-app notification here
    })

    // Notification action performed (user tapped notification)
    FirebaseMessaging.addListener('notificationActionPerformed', (event: NotificationActionPerformedEvent) => {
      console.log('[MobilePush] Notification action performed:', event.actionId)
      // Handle notification tap action
    })

    console.log('[MobilePush] ✅ Push notification setup completed successfully')
    
    // Update localStorage to indicate successful setup
    localStorage.setItem('kariz_notification_permission', 'granted')
    localStorage.setItem('kariz_push_setup_completed', 'true')
    
  } catch (error) {
    console.error('[MobilePush] ❌ Push notification setup failed:', error)
    
    // Update localStorage to indicate failed setup
    localStorage.setItem('kariz_push_setup_completed', 'false')
    
    throw error
  }
}

async function registerTokenWithServer(token: string, accessToken: string) {
  try {
    const deviceInfo = await Device.getInfo()
    const languageCode = await Device.getLanguageCode()
    
    const payload = {
      platform: 'android' as const,
      provider: 'fcm' as const,
      token,
      device: {
        platform: deviceInfo.platform,
        model: deviceInfo.model,
        osVersion: deviceInfo.osVersion,
        language: languageCode.value,
        manufacturer: deviceInfo.manufacturer,
        isVirtual: deviceInfo.isVirtual,
        webViewVersion: deviceInfo.webViewVersion
      }
    }

    console.log('[MobilePush] Registering token with server:', {
      platform: payload.platform,
      provider: payload.provider,
      tokenLength: token.length,
      deviceInfo: payload.device
    })

    const response = await api.registerPushDevice(payload, accessToken)
    console.log('[MobilePush] Token registration successful')
    return response
  } catch (error) {
    console.error('[MobilePush] Token registration failed:', error)
    throw error
  }
}



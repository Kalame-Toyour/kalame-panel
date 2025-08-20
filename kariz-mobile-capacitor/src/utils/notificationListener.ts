import { Capacitor } from '@capacitor/core';

// Interface for Notification Listener plugin
interface NotificationListenerPlugin {
  startNotificationListener(): Promise<void>;
  stopNotificationListener(): Promise<void>;
  onNotificationReceived(callback: (code: string) => void): void;
  removeAllListeners(): void;
  isNotificationAccessEnabled(): Promise<boolean>;
  requestNotificationAccess(): Promise<void>;
}

// Mock implementation for web
class MockNotificationListener implements NotificationListenerPlugin {
  private listeners: ((code: string) => void)[] = [];

  async startNotificationListener(): Promise<void> {
    console.log('[NotificationListener] Mock: Notification listener started (web platform)');
  }

  async stopNotificationListener(): Promise<void> {
    console.log('[NotificationListener] Mock: Notification listener stopped (web platform)');
  }

  onNotificationReceived(callback: (code: string) => void): void {
    this.listeners.push(callback);
    console.log('[NotificationListener] Mock: Notification listener added (web platform)');
  }

  removeAllListeners(): void {
    this.listeners = [];
    console.log('[NotificationListener] Mock: All listeners removed (web platform)');
  }

  async isNotificationAccessEnabled(): Promise<boolean> {
    return true; // Mock always returns true
  }

  async requestNotificationAccess(): Promise<void> {
    console.log('[NotificationListener] Mock: Requesting notification access (web platform)');
  }

  // Method to simulate notification for testing
  simulateNotification(code: string): void {
    this.listeners.forEach(callback => callback(code));
  }
}

// Real implementation for native platforms using Android Notification Listener
class NativeNotificationListener implements NotificationListenerPlugin {
  private listeners: ((code: string) => void)[] = [];
  private isListening = false;

  async startNotificationListener(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        console.log('[NotificationListener] Native: Starting notification listener...');

        // Use Android Notification Listener API directly
        if (typeof window !== 'undefined' && (window as any).AndroidInterface) {
          await this.startCustomNotificationListener();
        } else {
          console.log('[NotificationListener] Native: No custom Android interface, using fallback');
          this.fallbackToMock();
        }
      }
    } catch (error) {
      console.error('[NotificationListener] Native: Failed to start notification listener:', error);
      this.fallbackToMock();
    }
  }

  private async startCustomNotificationListener(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).AndroidInterface?.startNotificationListener) {
        await (window as any).AndroidInterface.startNotificationListener();
        this.isListening = true;

        // Set up listener for notifications received
        this.setupNotificationListener();

        console.log('[NotificationListener] Native: Custom notification listener started successfully');
      } else {
        throw new Error('Custom Android interface not available');
      }
    } catch (error) {
      console.error('[NotificationListener] Native: Custom notification listener failed:', error);
      this.fallbackToMock();
    }
  }

  private setupNotificationListener(): void {
    // Listen for notifications received from Android
    if (typeof window !== 'undefined') {
      (window as any).onNotificationReceived = (code: string) => {
        console.log('[NotificationListener] Native: Notification received from Android:', code);
        this.notifyListeners(code);
      };
    }
  }

  async stopNotificationListener(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && this.isListening) {
        if (typeof window !== 'undefined' && (window as any).AndroidInterface?.stopNotificationListener) {
          await (window as any).AndroidInterface.stopNotificationListener();
        }

        // Remove global listener
        if (typeof window !== 'undefined') {
          delete (window as any).onNotificationReceived;
        }

        this.isListening = false;
        console.log('[NotificationListener] Native: Notification listener stopped');
      }
    } catch (error) {
      console.error('[NotificationListener] Native: Failed to stop notification listener:', error);
    }
  }

  onNotificationReceived(callback: (code: string) => void): void {
    this.listeners.push(callback);
  }

  removeAllListeners(): void {
    this.listeners = [];
  }

  async isNotificationAccessEnabled(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && (window as any).AndroidInterface?.isNotificationAccessEnabled) {
        return await (window as any).AndroidInterface.isNotificationAccessEnabled();
      }
      return false;
    } catch (error) {
      console.error('[NotificationListener] Native: Error checking notification access:', error);
      return false;
    }
  }

  async requestNotificationAccess(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).AndroidInterface?.requestNotificationAccess) {
        await (window as any).AndroidInterface.requestNotificationAccess();
      }
    } catch (error) {
      console.error('[NotificationListener] Native: Error requesting notification access:', error);
    }
  }

  private notifyListeners(code: string): void {
    if (code) {
      console.log('[NotificationListener] Code extracted:', code);
      this.listeners.forEach(callback => callback(code));
    }
  }

  private fallbackToMock(): void {
    console.log('[NotificationListener] Native: Falling back to mock implementation');
    const mock = new MockNotificationListener();
    this.startNotificationListener = mock.startNotificationListener.bind(mock);
    this.stopNotificationListener = mock.stopNotificationListener.bind(mock);
    this.onNotificationReceived = mock.onNotificationReceived.bind(mock);
    this.removeAllListeners = mock.removeAllListeners.bind(mock);
    this.isNotificationAccessEnabled = mock.isNotificationAccessEnabled.bind(mock);
    this.requestNotificationAccess = mock.requestNotificationAccess.bind(mock);
  }
}

// Create instance based on platform
const notificationListener: NotificationListenerPlugin = Capacitor.isNativePlatform()
  ? new NativeNotificationListener()
  : new MockNotificationListener();

export default notificationListener;

// Export types for external use
export type { NotificationListenerPlugin };

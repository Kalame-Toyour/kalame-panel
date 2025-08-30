import { Capacitor } from '@capacitor/core';

/**
 * Fixed back button handler for Capacitor
 * This should NOT interfere with normal app navigation
 */
export class BackButtonHandler {
  private static instance: BackButtonHandler;
  private isInitialized = false;
  private onBackPressCallback: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): BackButtonHandler {
    if (!BackButtonHandler.instance) {
      BackButtonHandler.instance = new BackButtonHandler();
    }
    return BackButtonHandler.instance;
  }

  /**
   * Initialize back button handling
   * This should only handle hardware back button, not interfere with app navigation
   */
  public init(onBackPress: () => void): void {
    if (this.isInitialized) return;
    
    this.onBackPressCallback = onBackPress;
    
    if (Capacitor.isNativePlatform()) {
      // Use native Android back button handling via window events
      document.addEventListener('backbutton', this.handleBackButton, false);
      (window as any).addEventListener?.('backbutton', this.handleBackButton, false);

      this.isInitialized = true;
      console.log('[BackButtonHandler] Initialized successfully - only handling hardware back button');
    }
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    if (Capacitor.isNativePlatform()) {
      // Remove event listeners
      document.removeEventListener('backbutton', this.handleBackButton, false);
      (window as any).removeEventListener?.('backbutton', this.handleBackButton, false);
    }
    this.isInitialized = false;
  }

  private handleBackButton = (e: Event) => {
    console.log('[BackButtonHandler] Hardware back button pressed');
    e.preventDefault();
    if (this.onBackPressCallback) {
      this.onBackPressCallback();
    }
  }
}

export const backButtonHandler = BackButtonHandler.getInstance();

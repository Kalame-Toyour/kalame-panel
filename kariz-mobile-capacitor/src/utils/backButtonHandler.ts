import { Capacitor } from '@capacitor/core';

/**
 * Fixed back button handler for Capacitor
 * This should NOT interfere with normal app navigation
 */
export class BackButtonHandler {
  private static instance: BackButtonHandler;
  private isInitialized = false;

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
    
    if (Capacitor.isNativePlatform()) {
      // Only listen for hardware back button events
      // DO NOT intercept keyboard backspace or browser back button
      document.addEventListener('keydown', (e) => {
        // Only handle hardware back button (Escape key on some devices)
        // DO NOT handle Backspace key as it interferes with text input
        if (e.key === 'Escape') {
          e.preventDefault();
          onBackPress();
        }
        // Remove Backspace handling - let the app handle it normally
      });

      // DO NOT intercept popstate - let the app handle browser navigation
      // window.addEventListener('popstate', (e) => {
      //   e.preventDefault();
      //   onBackPress();
      // });

      this.isInitialized = true;
      console.log('[BackButtonHandler] Initialized successfully - only handling hardware back button');
    }
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.isInitialized = false;
  }
}

export const backButtonHandler = BackButtonHandler.getInstance();

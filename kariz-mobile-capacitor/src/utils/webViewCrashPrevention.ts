/**
 * WebView Crash Prevention Utility
 * This utility helps prevent WebView crashes by managing memory and resources
 */

export class WebViewCrashPrevention {
  private static instance: WebViewCrashPrevention;
  private isInitialized = false;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;
  private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = [];

  private constructor() {}

  public static getInstance(): WebViewCrashPrevention {
    if (!WebViewCrashPrevention.instance) {
      WebViewCrashPrevention.instance = new WebViewCrashPrevention();
    }
    return WebViewCrashPrevention.instance;
  }

  /**
   * Initialize crash prevention
   */
  public init(): void {
    if (this.isInitialized) return;

    try {
      // Set up memory monitoring
      this.setupMemoryMonitoring();

      // Set up event cleanup
      this.setupEventCleanup();

      // Set up page visibility monitoring
      this.setupPageVisibilityMonitoring();

      // Set up error boundary
      this.setupErrorBoundary();

      this.isInitialized = true;
      console.log('[WebViewCrashPrevention] Initialized successfully');
    } catch (error) {
      console.error('[WebViewCrashPrevention] Error initializing:', error);
    }
  }

  /**
   * Set up memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      this.memoryMonitorInterval = setInterval(() => {
        try {
          const memory = (window.performance as any).memory;
          const usedHeap = memory.usedJSHeapSize;
          const heapLimit = memory.jsHeapSizeLimit;
          const usagePercent = (usedHeap / heapLimit) * 100;

          if (usagePercent > 80) {
            console.warn('[WebViewCrashPrevention] High memory usage:', usagePercent.toFixed(1) + '%');
            this.triggerMemoryCleanup();
          }

          if (usagePercent > 90) {
            console.error('[WebViewCrashPrevention] Critical memory usage:', usagePercent.toFixed(1) + '%');
            this.emergencyCleanup();
          }
        } catch (error) {
          console.error('[WebViewCrashPrevention] Memory monitoring error:', error);
        }
      }, 5000); // Check every 5 seconds
    }
  }

  /**
   * Set up event cleanup
   */
  private setupEventCleanup(): void {
    // Monitor for memory leaks in event listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
      const result = originalAddEventListener.call(this, type, listener, options);
      
      // Track event listeners
      WebViewCrashPrevention.getInstance().trackEventListener(this, type, listener);
      
      return result;
    };

    EventTarget.prototype.removeEventListener = function(type: string, listener: EventListener, options?: boolean | EventListenerOptions) {
      const result = originalRemoveEventListener.call(this, type, listener, options);
      
      // Untrack event listeners
      WebViewCrashPrevention.getInstance().untrackEventListener(this, type, listener);
      
      return result;
    };
  }

  /**
   * Set up page visibility monitoring
   */
  private setupPageVisibilityMonitoring(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('[WebViewCrashPrevention] Page hidden, cleaning up resources');
          this.cleanupOnPageHidden();
        } else {
          console.log('[WebViewCrashPrevention] Page visible, resuming monitoring');
        }
      });
    }
  }

  /**
   * Set up error boundary
   */
  private setupErrorBoundary(): void {
    if (typeof window !== 'undefined') {
      // Global error handler
      window.addEventListener('error', (event) => {
        console.error('[WebViewCrashPrevention] Global error caught:', event.error);
        this.handleError(event.error);
      });

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        console.error('[WebViewCrashPrevention] Unhandled promise rejection:', event.reason);
        this.handleError(event.reason);
      });
    }
  }

  /**
   * Track event listener
   */
  public trackEventListener(element: EventTarget, event: string, handler: EventListener): void {
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Untrack event listener
   */
  public untrackEventListener(element: EventTarget, event: string, handler: EventListener): void {
    this.eventListeners = this.eventListeners.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  }

  /**
   * Trigger memory cleanup
   */
  private triggerMemoryCleanup(): void {
    try {
      // Clear console
      if (typeof console !== 'undefined' && 'clear' in console) {
        console.clear();
      }

      // Force garbage collection if available
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
      }

      console.log('[WebViewCrashPrevention] Memory cleanup completed');
    } catch (error) {
      console.error('[WebViewCrashPrevention] Memory cleanup error:', error);
    }
  }

  /**
   * Emergency cleanup
   */
  private emergencyCleanup(): void {
    try {
      // Remove all tracked event listeners
      this.eventListeners.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          console.error('[WebViewCrashPrevention] Error removing event listener:', error);
        }
      });
      this.eventListeners = [];

      // Clear memory
      this.triggerMemoryCleanup();

      console.log('[WebViewCrashPrevention] Emergency cleanup completed');
    } catch (error) {
      console.error('[WebViewCrashPrevention] Emergency cleanup error:', error);
    }
  }

  /**
   * Cleanup on page hidden
   */
  private cleanupOnPageHidden(): void {
    try {
      // Clear intervals
      if (this.memoryMonitorInterval) {
        clearInterval(this.memoryMonitorInterval);
        this.memoryMonitorInterval = null;
      }

      // Trigger cleanup
      this.triggerMemoryCleanup();
    } catch (error) {
      console.error('[WebViewCrashPrevention] Page hidden cleanup error:', error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    try {
      console.error('[WebViewCrashPrevention] Handling error:', error);
      
      // If it's a memory-related error, trigger cleanup
      if (error && error.message && error.message.includes('memory')) {
        this.triggerMemoryCleanup();
      }
    } catch (cleanupError) {
      console.error('[WebViewCrashPrevention] Error handling error:', cleanupError);
    }
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    try {
      // Clear memory monitor
      if (this.memoryMonitorInterval) {
        clearInterval(this.memoryMonitorInterval);
        this.memoryMonitorInterval = null;
      }

      // Remove all event listeners
      this.eventListeners.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          console.error('[WebViewCrashPrevention] Error removing event listener:', error);
        }
      });
      this.eventListeners = [];

      // Trigger final cleanup
      this.triggerMemoryCleanup();

      this.isInitialized = false;
      console.log('[WebViewCrashPrevention] Cleanup completed');
    } catch (error) {
      console.error('[WebViewCrashPrevention] Cleanup error:', error);
    }
  }
}

export const webViewCrashPrevention = WebViewCrashPrevention.getInstance();

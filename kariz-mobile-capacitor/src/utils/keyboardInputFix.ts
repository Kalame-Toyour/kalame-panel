import { Capacitor } from '@capacitor/core';

/**
 * Comprehensive keyboard input fix for Capacitor mobile apps
 * Ensures all keyboard languages (especially English) work properly
 */
export class KeyboardInputFix {
  private static instance: KeyboardInputFix;
  private isInitialized = false;
  private inputElements = new Set<HTMLInputElement | HTMLTextAreaElement>();

  private constructor() {}

  public static getInstance(): KeyboardInputFix {
    if (!KeyboardInputFix.instance) {
      KeyboardInputFix.instance = new KeyboardInputFix();
    }
    return KeyboardInputFix.instance;
  }

  /**
   * Initialize keyboard input fixes
   */
  public init(): void {
    if (this.isInitialized || !Capacitor.isNativePlatform()) return;

    console.log('[KeyboardInputFix] Initializing keyboard input fixes...');

    // Fix for Android WebView keyboard input issues
    this.fixAndroidKeyboardInput();
    
    // Fix for iOS keyboard input issues
    this.fixIOSKeyboardInput();
    
    // General input method fixes
    this.fixInputMethodEditors();
    
    // Prevent keyboard event interference
    this.preventKeyboardEventInterference();

    this.isInitialized = true;
    console.log('[KeyboardInputFix] Keyboard input fixes initialized successfully');
  }

  /**
   * Register an input element for enhanced keyboard handling
   */
  public registerInput(element: HTMLInputElement | HTMLTextAreaElement): void {
    if (!element || this.inputElements.has(element)) return;

    this.inputElements.add(element);
    this.enhanceInputElement(element);
    
    // Clean up when element is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === element) {
            this.unregisterInput(element);
            observer.disconnect();
          }
        });
      });
    });
    
    if (element.parentNode) {
      observer.observe(element.parentNode, { childList: true });
    }
  }

  /**
   * Unregister an input element
   */
  public unregisterInput(element: HTMLInputElement | HTMLTextAreaElement): void {
    this.inputElements.delete(element);
  }

  /**
   * Fix Android WebView keyboard input issues
   */
  private fixAndroidKeyboardInput(): void {
    // Android WebView sometimes doesn't fire input events properly
    // This is especially common with English keyboards
    
    // Force input events to fire
    document.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      if (this.isInputElement(target)) {
        // Ensure input events fire for all key presses
        setTimeout(() => {
          const inputEvent = new Event('input', { bubbles: true });
          target.dispatchEvent(inputEvent);
        }, 0);
      }
    }, true);

    // Fix for composition events not firing
    document.addEventListener('keyup', (e) => {
      const target = e.target as HTMLElement;
      if (this.isInputElement(target)) {
        // Force composition end for certain keys
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
          const compositionEvent = new CompositionEvent('compositionend', {
            bubbles: true,
            data: ''
          });
          target.dispatchEvent(compositionEvent);
        }
      }
    }, true);
  }

  /**
   * Fix iOS keyboard input issues
   */
  private fixIOSKeyboardInput(): void {
    // iOS Safari sometimes has issues with input events
    
    // Ensure proper input handling on iOS
    document.addEventListener('beforeinput', (e) => {
      const target = e.target as HTMLElement;
      if (this.isInputElement(target)) {
        // Force a re-render to ensure the input is properly handled
        setTimeout(() => {
          const changeEvent = new Event('change', { bubbles: true });
          target.dispatchEvent(changeEvent);
        }, 0);
      }
    }, true);
  }

  /**
   * Fix Input Method Editor (IME) issues
   */
  private fixInputMethodEditors(): void {
    // Handle IME composition properly for all languages
    
    let isComposing = false;
    
    document.addEventListener('compositionstart', (e) => {
      isComposing = true;
      const target = e.target as HTMLElement;
      if (this.isInputElement(target)) {
        target.setAttribute('data-composing', 'true');
      }
    }, true);

    document.addEventListener('compositionend', (e) => {
      isComposing = false;
      const target = e.target as HTMLElement;
      if (this.isInputElement(target)) {
        target.removeAttribute('data-composing');
        // Force input event after composition
        setTimeout(() => {
          const inputEvent = new Event('input', { bubbles: true });
          target.dispatchEvent(inputEvent);
        }, 0);
      }
    }, true);

    // Handle input during composition
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (this.isInputElement(target) && !isComposing) {
        // Ensure the input is properly processed
        setTimeout(() => {
          const changeEvent = new Event('change', { bubbles: true });
          target.dispatchEvent(changeEvent);
        }, 10);
      }
    }, true);
  }

  /**
   * Prevent keyboard event interference from other handlers
   */
  private preventKeyboardEventInterference(): void {
    // Ensure input elements get priority for keyboard events
    
    document.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      if (this.isInputElement(target)) {
        // Stop propagation for input-related keys to prevent interference
        if (this.isInputKey(e.key)) {
          e.stopImmediatePropagation();
        }
      }
    }, true); // Use capture phase for priority
  }

  /**
   * Enhance a specific input element
   */
  private enhanceInputElement(element: HTMLInputElement | HTMLTextAreaElement): void {
    // Add enhanced event handling
    
    // Ensure proper focus handling
    element.addEventListener('focus', () => {
      // Force keyboard to show properly
      element.style.transform = 'translateZ(0)';
      
      // Ensure proper input method
      if (Capacitor.getPlatform() === 'android') {
        element.setAttribute('inputmode', 'text');
      }
    });

    // Ensure proper blur handling
    element.addEventListener('blur', () => {
      element.style.transform = '';
    });

    // Enhanced input handling
    let lastValue = element.value;
    const checkValueChange = () => {
      if (element.value !== lastValue) {
        lastValue = element.value;
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
      }
    };

    // Check for value changes frequently
    const interval = setInterval(() => {
      if (document.contains(element)) {
        checkValueChange();
      } else {
        clearInterval(interval);
        this.unregisterInput(element);
      }
    }, 100);

    // Handle paste events properly
    element.addEventListener('paste', (e) => {
      setTimeout(() => {
        checkValueChange();
      }, 0);
    });

    // Handle cut events properly
    element.addEventListener('cut', (e) => {
      setTimeout(() => {
        checkValueChange();
      }, 0);
    });
  }

  /**
   * Check if an element is an input element
   */
  private isInputElement(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  }

  /**
   * Check if a key is an input-related key
   */
  private isInputKey(key: string): boolean {
    // Keys that should be handled by input elements
    const inputKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'Enter', ' '
    ];
    
    // Also include all printable characters
    return inputKeys.includes(key) || 
           (key.length === 1 && /[\w\s]/.test(key));
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.inputElements.clear();
    this.isInitialized = false;
  }
}

export const keyboardInputFix = KeyboardInputFix.getInstance();

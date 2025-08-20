import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  viewportHeight: number;
  offsetTop: number;
}

export function useKeyboard() {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    viewportHeight: window.innerHeight,
    offsetTop: 0
  });

  const [initialViewportHeight, setInitialViewportHeight] = useState(window.innerHeight);

  const updateKeyboardState = useCallback((newState: Partial<KeyboardState>) => {
    setKeyboardState(prev => ({ ...prev, ...newState }));
  }, []);

  const handleViewportChange = useCallback(() => {
    if (!window.visualViewport) return;

    const currentHeight = window.visualViewport.height;
    const currentTop = window.visualViewport.offsetTop;
    
    // Calculate keyboard height using visualViewport API for precise positioning
    const rawKeyboardHeight = initialViewportHeight - currentHeight;
    // Use more conservative bounds to prevent overflow issues
    const keyboardHeight = Math.max(0, Math.min(rawKeyboardHeight, initialViewportHeight * 0.6)); // Max 60% of viewport
    const isVisible = keyboardHeight > 60; // Lower threshold for better detection
    
    // For app repositioning, use the visualViewport offsetTop
    // This ensures the entire app moves up when keyboard opens
    const appKeyboardHeight = isVisible ? currentTop : 0;
    
    updateKeyboardState({
      isVisible,
      height: appKeyboardHeight,
      viewportHeight: currentHeight,
      offsetTop: currentTop
    });

    console.log('Keyboard state updated:', {
      isVisible,
      keyboardHeight: appKeyboardHeight,
      viewportHeight: currentHeight,
      offsetTop: currentTop,
      initialViewportHeight,
      rawKeyboardHeight,
      calculation: `Using visualViewport.offsetTop: ${currentTop}`
    });
  }, [initialViewportHeight, updateKeyboardState]);

  const handleResize = useCallback(() => {
    // Fallback for devices without visualViewport
    const currentHeight = window.innerHeight;
    const rawKeyboardHeight = Math.max(0, initialViewportHeight - currentHeight);
    const keyboardHeight = Math.min(rawKeyboardHeight, initialViewportHeight * 0.6); // Max 60% of viewport
    const isVisible = keyboardHeight > 60; // Consistent with viewport handler
    
    // For fallback, use the calculated keyboard height
    const appKeyboardHeight = isVisible ? keyboardHeight : 0;
    
    updateKeyboardState({
      isVisible,
      height: appKeyboardHeight,
      viewportHeight: currentHeight,
      offsetTop: 0
    });
  }, [initialViewportHeight, updateKeyboardState]);

  const scrollToInput = useCallback((element: HTMLElement | null) => {
    if (!element || !Capacitor.isNativePlatform()) return;

    // Use visualViewport if available
    if (window.visualViewport) {
      const rawKeyboardHeight = initialViewportHeight - window.visualViewport.height;
      const keyboardHeight = Math.min(rawKeyboardHeight, initialViewportHeight * 0.6);
      const isKeyboardVisible = keyboardHeight > 60;
      
      if (isKeyboardVisible) {
        // When keyboard is visible, the app is repositioned, so scroll to center of visible area
        const targetTop = element.offsetTop - (window.visualViewport.height / 2);
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      } else {
        // When keyboard is hidden, scroll to center of viewport
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    } else {
      // Fallback scroll
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [initialViewportHeight]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Set initial viewport height
    setInitialViewportHeight(window.visualViewport?.height || window.innerHeight);

    // Use visualViewport API if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    // Fallback to window resize
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleViewportChange();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleViewportChange, handleResize]);

  return {
    ...keyboardState,
    scrollToInput,
    updateKeyboardState
  };
}

/**
 * Mobile Theme Utilities
 * Handles mobile-specific theme detection and management
 */

export interface MobileThemeInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  supportsDarkMode: boolean;
  systemPrefersDark: boolean;
  webViewType: 'capacitor' | 'browser' | 'unknown';
}

/**
 * Detect mobile device and theme capabilities
 */
export function detectMobileThemeCapabilities(): MobileThemeInfo {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
  
  // Check if device supports dark mode
  const supportsDarkMode = window.matchMedia && 
    (window.matchMedia('(prefers-color-scheme: dark)').matches || 
     window.matchMedia('(prefers-color-scheme: light)').matches);
  
  // Check system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Detect WebView type
  let webViewType: 'capacitor' | 'browser' | 'unknown' = 'unknown';
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    webViewType = 'capacitor';
  } else if (isMobile) {
    webViewType = 'browser';
  }
  
  return {
    isMobile,
    isAndroid,
    isIOS,
    supportsDarkMode,
    systemPrefersDark,
    webViewType
  };
}

/**
 * Force theme application on mobile devices
 */
export function forceMobileTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  const body = document.body;
  
  // Remove existing theme attributes
  root.removeAttribute('data-theme');
  body.removeAttribute('data-theme');
  
  // Set new theme attributes
  root.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);
  
  // Force color scheme for WebView compatibility
  root.style.colorScheme = theme;
  body.style.colorScheme = theme;
  
  // Add/remove theme classes
  root.classList.remove('light', 'dark');
  body.classList.remove('light', 'dark');
  
  root.classList.add(theme);
  body.classList.add(theme);
  
  console.log(`[MobileThemeUtils] Forced theme: ${theme}`);
}

/**
 * Enhanced theme detection for mobile devices
 */
export function getMobileSystemTheme(): 'light' | 'dark' {
  const capabilities = detectMobileThemeCapabilities();
  
  if (!capabilities.isMobile) {
    // Desktop fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Mobile-specific detection
  if (capabilities.supportsDarkMode) {
    return capabilities.systemPrefersDark ? 'dark' : 'light';
  }
  
  // Fallback for older mobile devices
  try {
    // Check if we can access system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
  } catch (error) {
    console.warn('[MobileThemeUtils] Could not detect system theme, defaulting to light');
    return 'light';
  }
}

/**
 * Initialize mobile theme detection
 */
export function initializeMobileTheme(): void {
  const capabilities = detectMobileThemeCapabilities();
  
  if (capabilities.isMobile) {
    console.log('[MobileThemeUtils] Mobile device detected:', {
      isAndroid: capabilities.isAndroid,
      isIOS: capabilities.isIOS,
      supportsDarkMode: capabilities.supportsDarkMode,
      systemPrefersDark: capabilities.systemPrefersDark,
      webViewType: capabilities.webViewType
    });
    
    // Set initial theme based on system preference
    const systemTheme = getMobileSystemTheme();
    forceMobileTheme(systemTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newTheme = getMobileSystemTheme();
      forceMobileTheme(newTheme);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Legacy support
      mediaQuery.addListener(handleChange);
    }
  }
}

/**
 * Check if current theme matches system preference
 */
export function isThemeMatchingSystem(): boolean {
  const capabilities = detectMobileThemeCapabilities();
  if (!capabilities.isMobile) return true;
  
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const systemTheme = getMobileSystemTheme();
  
  return currentTheme === systemTheme;
}

/**
 * Sync theme with system preference
 */
export function syncThemeWithSystem(): void {
  const capabilities = detectMobileThemeCapabilities();
  if (!capabilities.isMobile) return;
  
  const systemTheme = getMobileSystemTheme();
  forceMobileTheme(systemTheme);
  
  console.log(`[MobileThemeUtils] Synced theme with system: ${systemTheme}`);
}

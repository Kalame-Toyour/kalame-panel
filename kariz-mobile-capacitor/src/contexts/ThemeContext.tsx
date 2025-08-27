import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system'); // Default to system for mobile
  const [isDark, setIsDark] = useState(false);

  // Enhanced theme detection for mobile devices
  const detectSystemTheme = (): 'light' | 'dark' => {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, use more aggressive dark mode detection
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Additional mobile-specific checks
      const hasDarkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const hasLightModeQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      // If device explicitly supports dark mode, trust the preference
      if (hasDarkModeQuery.matches || hasLightModeQuery.matches) {
        return prefersDark ? 'dark' : 'light';
      }
      
      // Fallback: check for common mobile dark mode indicators
      const isDarkMode = prefersDark || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      return isDarkMode ? 'dark' : 'light';
    }
    
    // Desktop fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Check if system prefers dark mode
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply theme to document with enhanced mobile support
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const applyTheme = () => {
      let resolvedTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        // Only respect system preference when theme is set to 'system'
        resolvedTheme = detectSystemTheme();
        console.log('[ThemeContext] System theme detected:', resolvedTheme);
      } else {
        // When user manually selects a theme, respect their choice
        resolvedTheme = theme;
        console.log('[ThemeContext] User selected theme:', resolvedTheme);
      }
      
      console.log('[ThemeContext] Applying theme:', resolvedTheme, 'Original theme setting:', theme, 'System prefers dark:', systemPrefersDark);
      setIsDark(resolvedTheme === 'dark');
      
      // Remove all theme classes first
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the appropriate theme class
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        
        // Force dark mode on mobile devices
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // Additional mobile-specific dark mode enforcement
          root.style.colorScheme = 'dark';
          body.style.colorScheme = 'dark';
          
          // Force dark mode for WebView compatibility
          root.setAttribute('data-theme', 'dark');
          body.setAttribute('data-theme', 'dark');
        }
        
        console.log('[ThemeContext] Dark mode classes added');
      } else {
        root.classList.add('light');
        body.classList.add('light');
        
        // Force light mode on mobile devices
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          root.style.colorScheme = 'light';
          body.style.colorScheme = 'light';
          
          // Force light mode for WebView compatibility
          root.setAttribute('data-theme', 'light');
          body.setAttribute('data-theme', 'light');
        }
        
        console.log('[ThemeContext] Light mode classes added');
      }
    };

    applyTheme();

    // Enhanced system theme change listener for mobile
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        console.log('[ThemeContext] System theme changed, reapplying...');
        applyTheme();
      }
    };

    // Use both modern and legacy event listeners for better mobile support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy support for older mobile browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Legacy cleanup
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Load theme from localStorage on mount with mobile optimization
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        // For mobile devices, default to system theme
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          setTheme('system');
          localStorage.setItem('theme', 'system');
        }
      }
    } catch (error) {
      console.error('[ThemeContext] Error loading theme from localStorage:', error);
      // Fallback to system theme on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        setTheme('system');
      }
    }
  }, []);

  // Save theme to localStorage
  const handleSetTheme = (newTheme: Theme) => {
    console.log('[ThemeContext] Setting theme to:', newTheme);
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('[ThemeContext] Error saving theme to localStorage:', error);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 
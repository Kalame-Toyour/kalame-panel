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
  const [theme, setTheme] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const applyTheme = () => {
      let resolvedTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolvedTheme = theme;
      }
      
      console.log('Applying theme:', resolvedTheme);
      setIsDark(resolvedTheme === 'dark');
      
      // Remove all theme classes first
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the appropriate theme class
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        console.log('Dark mode classes added');
      } else {
        root.classList.add('light');
        body.classList.add('light');
        console.log('Light mode classes added');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
  }, []);

  // Save theme to localStorage
  const handleSetTheme = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
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
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn p-2 rounded-lg transition-all duration-200 border border-white/20 dark:border-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-800"
      title={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-800 drop-shadow-sm" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-300 drop-shadow-sm" />
      )}
    </button>
  );
}
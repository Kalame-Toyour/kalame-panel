import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ isCollapsed }: { isCollapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('sidebar');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex flex-row items-center justify-between ${
        isCollapsed ? 'mr-0 px-1' : 'mr-0 pr-0'
      } transition-colors hover:rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700`}
    >
      <div className="w-full">
        <div className="flex flex-row items-center">
          {theme === 'light'
            ? (
                <Moon className="size-6 dark:text-gray-200" />
              )
            : (
                <Sun className="size-6 dark:text-gray-200" />
              )}
          {!isCollapsed && (
            <span className="mx-4 dark:text-gray-200">
              {theme === 'light' ? `${t('darkmode')}` : `${t('lightmode')}`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

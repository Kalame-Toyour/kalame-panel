import { usePathname, useRouter } from '@/libs/i18nNavigation';
import { Globe, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';

type LanguageSwitcherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
};

const LanguageSwitcherModal = ({ isOpen, onClose }: LanguageSwitcherModalProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const modalRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div ref={modalRef} className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">{t('selectLanguage')}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="dark:text-gray-300">
            <X className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {languages.map(language => (
            <Button
              key={language.code}
              variant={locale === language.code ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${
                locale === language.code
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400'
                  : 'dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => switchLanguage(language.code)}
            >
              <span className="mr-2 text-xl">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              {locale === language.code && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">✓</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LanguageSwitcherButton = ({ isCollapsed, onClick }: { isCollapsed: boolean; onClick: () => void }) => {
  const t = useTranslations('sidebar');

  return (
    <div
      role="button"
      tabIndex={0} // make the element focusable
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick();
        }
      }}
      className={`flex ${
        isCollapsed ? 'justify-center' : 'flex-row justify-between'
      }  cursor-pointer items-center rounded-lg transition-colors hover:rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700`}
    >
      {!isCollapsed && (
        <div className="flex flex-row items-center">
          <Globe size={24} className="dark:text-gray-200" />
          <span className="mx-4 dark:text-gray-200">{t('language')}</span>
        </div>
      )}
      {isCollapsed && <Globe size={24} className="dark:text-gray-200" />}
    </div>
  );
};

export default LanguageSwitcherModal;

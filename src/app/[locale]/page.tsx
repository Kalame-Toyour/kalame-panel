'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { Download } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import LanguageSwitcherModal from './components/LanguageSwitcher';
import { AnimatedBackground } from './components/Layout/AnimatedBackground';
import { FAQSection } from './components/Layout/FAQSection';
import { Navigation } from './components/Layout/Navigation';
import { StatsSection } from './components/Layout/StatsSection';
import { TypingAnimation } from './components/Layout/TypingAnimation';
import './styles/landing.css';

const LandingPage = () => {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const t = useTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = () => {
    startLoading();
    router.push('/app');
  };

  useEffect(() => {
    return () => {
      stopLoading();
    };
  }, [pathname, stopLoading]);

  useEffect(() => {
    document.documentElement.style.setProperty('--scrollbar-color', '#FDE68A');
    document.documentElement.style.setProperty('--scrollbar-hover-color', '#FCD34D');
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="custom-scrollbar flex min-h-screen flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatedBackground />
      <Navigation
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setIsLanguageModalOpen={setIsLanguageModalOpen}
      />
      <main className="mainbg relative grow px-4 dark:bg-gray-900 md:px-36 md:pt-16">
        {/* Main content components */}
        <div className="inset-0 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            {/* Images - Shown first on mobile, second on desktop */}
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <img
                    src="https://cdn.coingraam.com/images/ai-assistant-pic.png"
                    alt="AI Art Example 1"
                    className="mx-auto w-4/5 rounded-2xl transition-transform hover:scale-[1.02] dark:opacity-90"
                  />
                </div>
              </div>
            </div>

            {/* Text Content - Shown second on mobile, first on desktop */}
            <div className="order-2 lg:order-1">
              <h1 className="py-4 text-3xl font-bold text-blue-700 dark:text-blue-400 md:text-5xl">
                {t('hero.title')}
              </h1>
              <div className="mt-2">
                <TypingAnimation texts={t.raw('hero.typing')} />
              </div>
              <p className="mt-4 text-lg text-gray-700 dark:text-gray-200 md:text-xl">
                {t('hero.subtitle')}
              </p>
              <button
                onClick={handleNavigation}
                className="mt-8 flex items-center justify-center space-x-2 rounded-full bg-blue-600 px-8 py-3 text-white transition-all hover:scale-105 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md"
              >
                {t('hero.tryForFree')}
              </button>
              {/* <div className={`mt-8 flex flex-col space-y-4 sm:flex-row ${isRTL ? 'sm:space-x-reverse' : 'sm:space-x-4'} sm:space-y-0`}>
                <button className={`flex items-center justify-center ${isRTL ? 'space-x-reverse' : 'space-x-2'} rounded-lg bg-gray-100 px-6 py-2 text-blue-700 border border-blue-200 transition-all hover:scale-105 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700`}>
                  <Download size={20} />
                  <span>{t('hero.downloadBazaar')}</span>
                </button>
                <button className={`flex items-center justify-center ${isRTL ? 'space-x-reverse' : 'space-x-2'} rounded-lg bg-gray-100 px-6 py-2 text-blue-700 border border-blue-200 transition-all hover:scale-105 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700`}>
                  <Download size={20} />
                  <span>{t('hero.downloadGooglePlay')}</span>
                </button>
              </div> */}
            </div>
          </div>
        </div>
        {/* <StatsSection />
        <FAQSection /> */}
      </main>
      <LanguageSwitcherModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isCollapsed={false}
      />
    </div>
  );
};

export default LandingPage;

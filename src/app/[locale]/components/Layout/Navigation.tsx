'use client';

import { Menu, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { LanguageSwitcherButton } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { useDynamicContent } from '@/utils/dynamicContent';

type NavigationProps = {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setIsLanguageModalOpen: (isOpen: boolean) => void;
};

export const Navigation: React.FC<NavigationProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setIsLanguageModalOpen,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const content = useDynamicContent();

  useEffect(() => {
    // Check if user is logged in by checking session data
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (session && session.user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  const navigation = [
    { name: t('nav.pricing'), href: '#' },
    { name: t('nav.about'), href: '#' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 border-b border-gray-200/50 bg-white/70 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/70" />

      <nav className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-3">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={content.logo}
                  alt="logo"
                  className="w-12 transition-all duration-500 ease-out group-hover:rotate-6 group-hover:scale-110"
                />
              </div>
              <span className={`relative bg-clip-text text-2xl font-extrabold text-transparent transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-amber-500 after:to-amber-600 after:transition-all after:duration-300 group-hover:after:w-full dark:from-amber-400 dark:to-amber-500 ${
                content.brandName === 'کلمه'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}>
                {content.brandName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden items-center gap-1 md:flex">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative rounded-full px-5 py-2 text-base font-semibold tracking-wide text-gray-700 transition-colors hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400"
              >
                {item.name}
                <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-amber-500/0 via-amber-500/70 to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            ))}
          </div> */}

          {/* Actions Section */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-gray-200/50 bg-gray-100/50 p-1.5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50">
              <ThemeToggle isCollapsed />
              <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
              <LanguageSwitcherButton
                isCollapsed
                onClick={() => setIsLanguageModalOpen(true)}
              />
            </div>

            {isLoggedIn
              ? (
                  <Link href="/">
                    <button className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 dark:from-amber-600 dark:to-amber-700 dark:hover:shadow-amber-600/20">
                      <Settings className="size-4 transition-transform group-hover:scale-110" />
                      <span>{t('nav.dashboard')}</span>
                    </button>
                  </Link>
                )
              : (
                  <Link href="/auth">
                    <button className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 dark:from-amber-600 dark:to-amber-700 dark:hover:shadow-amber-600/20">
                      {t('hero.tryForFree')}
                    </button>
                  </Link>
                )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen
                ? (
                    <X className="size-6 text-gray-700 dark:text-gray-300" />
                  )
                : (
                    <Menu className="size-6 text-gray-700 dark:text-gray-300" />
                  )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full mx-4 mt-2 rounded-2xl border border-gray-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/90">
            <div className="space-y-3">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-4 py-2 text-sm font-semibold tracking-wide text-gray-700 transition-colors hover:bg-gray-100/50 hover:text-amber-600 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-amber-400"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200/50 pt-2 dark:border-gray-700/50">
                {isLoggedIn
                  ? (
                      <Link href="/dashboard">
                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 dark:from-amber-600 dark:to-amber-700 dark:hover:shadow-amber-600/20">
                          <Settings className="size-4" />
                          <span>{t('nav.dashboard')}</span>
                        </button>
                      </Link>
                    )
                  : (
                      <Link href="/auth">
                        <button className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 dark:from-amber-600 dark:to-amber-700 dark:hover:shadow-amber-600/20">
                          {t('hero.tryForFree')}
                        </button>
                      </Link>
                    )}
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <ThemeToggle isCollapsed />
                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
                <LanguageSwitcherButton
                  isCollapsed
                  onClick={() => setIsLanguageModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

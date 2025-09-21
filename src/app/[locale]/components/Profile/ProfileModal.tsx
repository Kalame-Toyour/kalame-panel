'use client';

import {
  ChevronLeft,
  LogOut,
  X,
  Moon,
  Sun,
  Mic,
  Star,
  ImageIcon,
  BookText,
  LogIn,
  CreditCard,
  Download,
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
// Remove useUserInfo import as it's no longer needed
import LanguageSwitcherModal from '../LanguageSwitcher';
import LogoutDialog from '../LogoutDialog';
import ChatHistorySidebar from '../Chat/ChatHistorySidebar';
import { useTheme } from '../ThemeProvider';
import fetchWithAuth from '../utils/fetchWithAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { isUserPremium, getUserAccountTypeText } from '@/utils/premiumUtils';
import { useUserInfoContext } from '../../contexts/UserInfoContext';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogin?: (email: string, password: string) => Promise<void>;
};

type NavigationItem = {
  icon: React.ReactNode;
  text: string;
  path: string;
};

type Chat = {
  id: string;
  date: string | number | Date;
  title?: string;
  text?: string;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { user } = useAuth();
  const { localUserInfo } = useUserInfoContext();
  // Remove updateUserInfo as it's no longer needed in this component
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Remove unnecessary userInfo update when modal opens
  // UserInfo is now cached and updated only when needed

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const waveStyle = {
    display: 'inline-block',
    animation: 'wave 1.5s infinite',
    transformOrigin: '70% 70%',
  };

  const refreshChatHistory = async () => {
    if (!user?.id) return;
    setIsChatHistoryLoading(true);
    try {
      const res = await fetchWithAuth(`/api/chat?userID=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data.chats)) {
        setChatHistory(
          data.chats.map((c: { code: string; insert_time: string; title?: string }) => ({
            id: c.code,
            date: c.insert_time,
            title: c.title || undefined,
            text: '',
          }))
        );
      }
    } catch {
      setChatHistory([]);
    } finally {
      setIsChatHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      refreshChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]); // Refresh when modal opens or user changes

  const isRouteActive = (itemPath: string) => {
    // pathname from usePathname() is like "/image" or "/text-to-voice/some-sub-path"
    // itemPath from featureNavigationItems is like "image" or "text-to-voice"

    // Normalize pathname: remove leading slash if present to match itemPath format
    const normalizedPathname = pathname.startsWith('/') ? pathname.substring(1) : pathname;

    if (itemPath === '') { // Should not happen with current featureNavigationItems
      return normalizedPathname === '' || normalizedPathname.startsWith('?chat=');
    }

    // Check for exact match or if it's a sub-route
    return normalizedPathname === itemPath || normalizedPathname.startsWith(`${itemPath}/`);
  };

  const handleFeatureNavigation = (path: string) => {
    const fullPath = `/${locale}/${path}`;
    router.push(fullPath);
    onClose();
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut({ redirect: false });
      router.push(`/${locale}/auth`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLoginClick = () => {
    onClose();
    router.push(`/${locale}/auth`);
  };

  const handleDownloadApp = () => {
    // Static URL for app download - you can change this to your actual app store links
    const downloadUrl = 'https://play.google.com/store/apps/details?id=com.kalame.app';
    window.open(downloadUrl, '_blank');
    onClose();
  };

  const featureNavigationItems: NavigationItem[] = [
    { icon: <ImageIcon />, text: 'ساخت تصویر', path: 'image' },
    { icon: <Mic />, text: 'تبدیل متن به گفتار', path: 'text-to-voice' },
    { icon: <Star />, text: 'ارتقا بسته', path: 'pricing' },
    // { icon: <BookText />, text: 'تبدیل گفتار به متن', path: 'voice-to-text' }, // Assuming this should also be without leading slash for consistency
  ];

  if (!isOpen && typeof window === 'undefined') return null; // Keep this for SSR, AnimatePresence handles client-side

  const modalVariants = {
    hidden: {
      x: locale === 'fa' ? '100%' : '-100%',
      opacity: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.2 },
    },
    visible: {
      x: '0%',
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.2 },
    },
    exit: {
      x: locale === 'fa' ? '100%' : '-100%',
      opacity: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.2 },
    },
  };

  return (
    <>
      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
              onClick={onClose}
            />
            <motion.div
              key="profile-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`fixed inset-y-0 ${locale === 'fa' ? 'right-0' : 'left-0'} z-50 w-full max-w-sm bg-white shadow-xl dark:bg-gray-800 md:hidden flex flex-col justify-between`}
              dir={locale === 'fa' ? 'rtl' : 'ltr'}
            >
              {/* Header - Different for authenticated and non-authenticated users */}
              <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-primary text-white">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 text-white hover:bg-white/20 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <h1 className="text-lg font-semibold">
                    {user ? (
                      <>
                        سلام {user.name}!
                        <span style={waveStyle} className="ml-1 rtl:mr-1 inline-block">👋</span>
                      </>
                    ) : (
                      'منوی اصلی'
                    )}
                  </h1>
                </div>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                >
                  {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                </button>
              </header>

              <div className="flex-1 h-[calc(100%-64px)] flex flex-col overflow-y-auto p-3 pb-24"> {/* pb-24 for profile bar */}
                {/* Feature Navigation Items - Placed at the top */}
                <div className="mb-3 space-y-1.5">
                  {featureNavigationItems.map((item) => {
                    const isActive = isRouteActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleFeatureNavigation(item.path)}
                        className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 border transition-colors text-right text-sm font-medium
                          ${isActive
                            ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border-blue-500 dark:border-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                          }
                        `}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { className: `w-5 h-5 ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}` })}
                        <span>{item.text}</span>
                        <ChevronLeft size={18} className={`mr-auto ${locale === 'fa' ? '' : 'rotate-180'} ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                      </button>
                    );
                  })}
                </div>

                {/* New Chat Button - Only show for authenticated users */}
                {user && (
                  <div className="my-4 text-center">
                    <button
                      onClick={() => {
                        router.push(`/${locale}`);
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new Event('clear-chat-messages'));
                        }
                        onClose();
                      }}
                      className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
                    >
                      + گفت‌وگوی جدید
                    </button>
                  </div>
                )}

                {/* Chat History Section - Only show for authenticated users */}
                {user && (
                  <div className="flex-grow mb-3 border-t border-b dark:border-gray-700 py-2 -mx-3 px-3">
                    <ChatHistorySidebar
                      chatHistory={chatHistory}
                      isLoading={isChatHistoryLoading}
                      onChatSelect={onClose} // Close modal on chat select
                      activeChatId={searchParams?.get('chat') || ''} // Extract chat ID from URL parameters
                    />
                    {!isChatHistoryLoading && chatHistory.length === 0 && (
                      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        هیچ گفتگویی وجود ندارد
                      </div>
                    )}
                  </div>
                )}

                {/* Footer items: Language and Logout - Restored to simpler style */}
                {/* Removed old footer items */}
              </div>
              
              {/* Fixed Bottom Bar - Different for authenticated and non-authenticated users */}
              {user ? (
                // Profile Bar for authenticated users
                <div className="fixed bottom-0 z-50 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between gap-3 shadow-2xl w-full max-w-sm" style={{left: locale === 'fa' ? 'auto' : '0', right: locale === 'fa' ? '0' : 'auto'}}>
                  <button
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onClick={() => setProfileMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={profileMenuOpen}
                    tabIndex={0}
                  >
                    <img
                      src={user.image || 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'}
                      alt="آواتار کاربر"
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                    <div className="flex flex-col flex-1 min-w-0 text-right">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{user.name}</span>
                      <span className={`text-xs truncate ${
                        localUserInfo && isUserPremium(localUserInfo) 
                          ? 'text-amber-600 dark:text-amber-400 font-semibold' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {localUserInfo ? getUserAccountTypeText(localUserInfo) : 'اکانت رایگان'}
                      </span>
                    </div>
                  </button>
                  {profileMenuOpen && (
                    <div ref={profileMenuRef} className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-3 px-0 min-w-[210px] animate-fade-in flex flex-col gap-1 mx-4">
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" onClick={() => { setProfileMenuOpen(false); onClose(); router.push(`/${locale}/transactions`) }}>
                        <CreditCard size={18} className="text-purple-500" />
                        لیست تراکنش‌ها
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" onClick={() => { setProfileMenuOpen(false); onClose(); router.push(`/${locale}/about`) }}>
                        <BookText size={18} className="text-blue-500" />
                        درباره ما
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" onClick={() => { setProfileMenuOpen(false); onClose(); router.push(`/${locale}/help`) }}>
                        <BookText size={18} className="text-purple-500" />
                        راهنما
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" onClick={() => { setProfileMenuOpen(false); handleDownloadApp(); }}>
                        <Download size={18} className="text-green-500" />
                        دانلود اپلیکیشن
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" onClick={() => { setProfileMenuOpen(false); handleLogoutConfirm(); }}>
                        <LogOut size={18} className="" />
                        خروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Login Button for non-authenticated users
                <div className="fixed bottom-0 z-50 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-2xl w-full max-w-sm" style={{left: locale === 'fa' ? 'auto' : '0', right: locale === 'fa' ? '0' : 'auto'}}>
                  <button
                    onClick={handleLoginClick}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                  >
                    <LogIn size={20} />
                    <span>ورود / ثبت‌نام</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {showLanguageModal && (
        <LanguageSwitcherModal
          isOpen={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          isCollapsed={false} // Added missing prop
        />
      )}
      {isLogoutDialogOpen && (
        <LogoutDialog
          isOpen={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
};

export default ProfileModal;

import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  History,
  Sun,
  Moon,
  MessageCircle,
  Image as ImageIcon,
  Mic,
  BookText,
  LogIn,
  Star,
  CreditCard,
  Download,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LogoutDialog from '../LogoutDialog';
import { useTheme } from '../ThemeProvider';
import ChatHistorySidebar from '../Chat/ChatHistorySidebar';
import fetchWithAuth from '../utils/fetchWithAuth';
import { isUserPremium, getUserAccountTypeText } from '@/utils/premiumUtils';
import { useUserInfoContext } from '../../contexts/UserInfoContext';
import './sidebar.css';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  toggleProfile: () => void;
  isAuthenticated: boolean;
  isCollapsed: boolean;
};

type NavigationItem = {
  icon: React.ReactNode;
  text: string;
  path: string;
  isUpgrade?: boolean;
};

type Chat = {
  id: string;
  date: string | number | Date;
  title?: string;
  text?: string;
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  toggleCollapse,
  isCollapsed,
}) => {
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-80';
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('sidebar');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { localUserInfo } = useUserInfoContext();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get('chat') || '';
  const prevChatIdRef = useRef<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
    refreshChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Only refresh chat history when a new chat is created (urlChatId changes from '' to a value)
  useEffect(() => {
    if (!prevChatIdRef.current && urlChatId) {
      refreshChatHistory();
    }
    prevChatIdRef.current = urlChatId;
  }, [urlChatId]);

  const isRouteActive = (path: string) => {
    // pathname from usePathname() is like "/", "/image", or "/image/some-id"
    // path argument is like "/", "/image", "/text-to-voice"

    if (path === '/') { // Main chat page
      // Matches "/" or "/?chat=some_id"
      return pathname === '/' || pathname.startsWith('/?chat=');
    }

    // For feature paths like "/image", "/text-to-voice"
    // Matches "/image" or "/image/some-sub-path"
    return pathname === path || pathname.startsWith(`${path}/`);
  };



  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut({ redirect: false });
      router.push(`/${locale}/auth`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handler for starting a new chat
  const handleNewChat = () => {
    // Navigate to main page first
    router.push(`/${locale}`);
    
    // Dispatch reset event after navigation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('reset-chat-completely', { 
        detail: { 
          timestamp: Date.now(),
          reason: 'new-chat-requested'
        } 
      }));
    }, 50);
  };

  // Handler for selecting a chat from history
  const handleSelectChat = () => {};

  // Handler for navigation to feature pages
  const handleFeatureNavigation = (path: string) => {
    const fullPath = `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
    router.push(fullPath);
    toggleSidebar();
  };

  const handleUpgradeClick = () => {
    router.push(`/${locale}/pricing`);
    toggleSidebar();
  };

  const handleDownloadApp = () => {
    // Static URL for app download - you can change this to your actual app store links
    const downloadUrl = 'https://play.google.com/store/apps/details?id=com.kalame.app';
    window.open(downloadUrl, '_blank');
    setProfileMenuOpen(false);
  };

  const featureNavigationItems: NavigationItem[] = [
    { icon: <ImageIcon />, text: 'ساخت تصویر', path: '/image' },
    { icon: <Mic />, text: 'تبدیل متن به گفتار', path: '/text-to-voice' },
    { icon: <Star />, text: 'ارتقا بسته', path: '/pricing' },
    // { icon: <BookText />, text: 'تبدیل گفتار به متن', path: '/voice-to-text' },
  ];

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
      <div
        className={`inset-y-0 hidden md:fixed md:block ${sidebarWidth} bg-white/80 dark:bg-gray-900/80 shadow-xl border-r border-gray-200 dark:border-gray-800 backdrop-blur-lg transition-all duration-500 ease-in-out
       ${isOpen ? 'translate-x-0' : 'translate-x-full'}
       ${locale === 'fa' ? 'right-0' : 'left-0'}
       z-50 md:translate-x-0`}
        dir={`${locale === 'fa' ? 'rtl' : 'ltr'}`}
      >
        <div className="flex h-full flex-col">
 
          {/* Header: Logo (open) یا آیکون‌ها (بسته) */}
          {isCollapsed ? (
            <div className={`flex flex-col items-center pt-6 pb-2 gap-3${!isChatHistoryLoading ? ' border-b dark:border-gray-700' : ''}`}>
              <button
                onClick={toggleCollapse}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title={t('about')}
                style={{ marginBottom: 0 }}
              >
                <PanelLeftClose size={26} className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'} dark:text-gray-200`} />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title={t('lightmode')}
              >
                {theme === 'light' ? <Moon size={24} className="dark:text-gray-200" /> : <Sun size={24} className="dark:text-gray-200" />}
              </button>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <img
                    src="/kalame-logo.png"
                    alt="logo"
                    className="w-12 rounded-2xl transition-transform hover:scale-110 hover:shadow-lg duration-200"
                  />
                  <span className="mx-2 text-2xl font-bold text-primary dark:text-primary select-none">{t('home')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400"
                    title={t('lightmode')}
                  >
                    {theme === 'light' ? <Moon size={20} className="dark:text-gray-200" /> : <Sun size={20} className="dark:text-gray-200" />}
                  </button>
                  <button
                    onClick={toggleCollapse}
                    className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400"
                    title={t('about')}
                  >
                    <PanelLeftOpen size={20} className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'} dark:text-gray-200`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Greeting at the very top */}
          {/* {!isCollapsed && (
            <div className="flex flex-row items-center justify-start gap-2 px-4 pt-2 pb-2">
              <span style={waveStyle} aria-label="waving hand" role="img" className="text-2xl select-none">👋</span>
              <h2 className="text-xl font-bold dark:text-gray-200">سلام {user?.name}</h2>
            </div>
          )} */}

          {/* آیکون هیستوری وقتی سایدبار بسته است */}
          {isCollapsed && (
            <div className={`flex flex-col items-center pt-4 pb-2 gap-2${!isChatHistoryLoading ? ' border-b dark:border-gray-700' : ''}`}>
              <button
                onClick={handleNewChat}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title="گفت‌وگوی جدید"
              >
                <MessageCircle size={24} className="text-black dark:text-gray-200" />
              </button>
              <button
                onClick={handleNewChat}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title="ساخت تصویر"
              >
                <ImageIcon size={24} className="text-black dark:text-gray-200" />
              </button>
              <button
                onClick={handleNewChat}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title="تبدیل متن به گفتار"
              >
                <Mic size={24} className="text-black dark:text-gray-200" />
              </button>
              <button
                onClick={handleNewChat}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title="تبدیل گفتار به متن"
              >
                <BookText size={24} className="text-black dark:text-gray-200" />
              </button>
              <button
                onClick={handleUpgradeClick}
                className="rounded-lg p-2 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-700 bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md"
                title="ارتقا بسته"
              >
                <Star size={24} className="text-white" />
              </button>
              <button
                onClick={toggleCollapse}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title="تاریخچه گفتگوها"
              >
                <History size={24} className="text-black dark:text-gray-200" />
              </button>
            </div>
          )}

          {/* New Chat Button and Feature Navigation Buttons */}
          {!isCollapsed && (
            <div className="mb-2 px-4 pt-2">
              <button
                onClick={handleNewChat}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.03] focus:ring-2 focus:ring-blue-400 transition-all text-sm font-semibold mb-4 shadow-md"
              >
                + گفت‌وگوی جدید
              </button>
              {/* Feature Navigation Buttons */}
              <div className="space-y-2 mb-4">
                {featureNavigationItems.map((item) => (
                  item.isUpgrade ? (
                    <></>
                  ) : (
                    <button
                      key={item.path}
                      onClick={() => handleFeatureNavigation(item.path)}
                      className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 border border-transparent dark:border-transparent transition-all text-right font-medium text-xs md:text-sm
                        ${isRouteActive(item.path)
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-200 shadow-md scale-[1.03]'
                          : 'bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:scale-[1.03]'}
                        focus:ring-2 focus:ring-blue-400 focus:outline-none duration-150`}
                    >
                      {React.cloneElement(item.icon as React.ReactElement, { className: `w-5 h-5 md:w-6 md:h-6 ${isRouteActive(item.path) ? 'text-blue-500' : 'text-blue-400'} transition-colors` })}
                      <span className="truncate">{item.text}</span>
                    </button>
                  )
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            </div>
          )}

          {/* Main Content: Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* User Info, New Chat Button, and Chat History - Hidden when collapsed */}
            {!isCollapsed && (
              <div className="mb-2">
                <div className="rounded-xl bg-white/70 dark:bg-gray-900/70 shadow-sm p-2">
                  <ChatHistorySidebar
                    chatHistory={chatHistory}
                    onChatSelect={handleSelectChat}
                    isLoading={isChatHistoryLoading}
                    activeChatId={urlChatId}
                  />
                  {/* پیام اگر هیچ تاریخچه‌ای نبود */}
                  {!isChatHistoryLoading && chatHistory.length === 0 && (
                    <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                      هنوز هیچ گفت‌وگویی ندارید
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown or Login Button */}
          <div className="border-t p-4 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 relative">
            {isAuthLoading ? (
              // Skeleton loading for authentication state
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </div>
            ) : user ? (
              // User is authenticated
              <div className="relative" ref={profileMenuRef}>
                {isCollapsed ? (
                  // Collapsed state - show only small profile icon
                  <div className="flex flex-col items-center gap-2">
                    <button
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={user.name || 'پروفایل کاربر'}
                    >
                      <img
                        src={user.image || 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'}
                        alt="آواتار کاربر"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                      />
                    </button>
                  </div>
                ) : (
                  // Expanded state - show full profile with dropdown
                  <>
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
                      <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-3 px-0 min-w-[210px] animate-fade-in flex flex-col gap-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"   onClick={() => {
                          setProfileMenuOpen(false)
                          router.push(`/${locale}/transactions`)
                        }}>
                          <CreditCard size={18} className="text-purple-500" />
                          لیست تراکنش‌ها
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"   onClick={() => {
                          setProfileMenuOpen(false)
                          router.push(`/${locale}/about`)
                        }}>
                          <BookText size={18} className="text-blue-500" />
                          درباره ما
                        </button>
                        {/* <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all" onClick={() => router.push(`/${locale}/settings`)}>
                          <MessageCircle size={18} className="text-green-500" />
                          تنظیمات
                        </button> */}
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"   onClick={() => {
                          setProfileMenuOpen(false)
                          router.push(`/${locale}/help`)
                        }}>
                          <Star size={18} className="text-yellow-500" />
                          راهنما
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all" onClick={handleDownloadApp}>
                          <Download size={18} className="text-green-500" />
                          دانلود اپلیکیشن
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" onClick={handleLogoutClick}>
                          <LogOut size={18} className="" />
                          خروج
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // User is not authenticated
              <div className="flex items-center justify-center">
                {isCollapsed ? (
                  // Collapsed state - show only login icon
                  <button
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="ورود به حساب"
                    onClick={() => router.push(`/${locale}/auth`)}
                  >
                    <LogIn size={24} className="text-blue-500 dark:text-blue-400" />
                  </button>
                ) : (
                  // Expanded state - show full login button
                  <button
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    onClick={() => router.push(`/${locale}/auth`)}
                  >
                    <LogIn size={20} />
                    <span className="font-bold text-sm">ورود به حساب</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Sidebar;
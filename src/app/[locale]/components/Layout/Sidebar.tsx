import {
  ChevronLeft,
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
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get('chat') || '';
  const prevChatIdRef = useRef<string>('');

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

  const handleNavigation = (path: string) => {
    if (path) {
      const fullPath = path === '/' ? `/${locale}` : `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
      router.push(fullPath);
      toggleSidebar();
    }
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
    router.push(`/${locale}`);
    // if (typeof window !== 'undefined') {
    //   window.history.replaceState({}, '', `/app`);
      window.dispatchEvent(new Event('clear-chat-messages'));
    // }
  };

  // Handler for selecting a chat from history
  const handleSelectChat = () => {};

  // Handler for navigation to feature pages
  const handleFeatureNavigation = (path: string) => {
    const fullPath = `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
    router.push(fullPath);
    toggleSidebar();
  };

  const featureNavigationItems: NavigationItem[] = [
    { icon: <ImageIcon />, text: 'ساخت تصویر', path: '/image' },
    { icon: <Mic />, text: 'تبدیل متن به گفتار', path: '/text-to-voice' },
    { icon: <BookText />, text: 'تبدیل گفتار به متن', path: '/voice-to-text' },
  ];

  // Add CSS for waving hand animation
  const waveStyle = {
    display: 'inline-block',
    animation: 'wave 1.5s infinite',
    transformOrigin: '70% 70%',
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
      <div
        className={`inset-y-0 hidden font-sans md:fixed md:block ${sidebarWidth} bg-white shadow-lg transition-all duration-500 ease-in-out dark:bg-gray-800
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
            <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700">
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <img
                    src="/kalame-logo.png"
                    alt="logo"
                    className="w-12 rounded-2xl transition-transform hover:scale-105"
                  />
                  <span className="mx-2 text-2xl font-bold text-primary dark:text-primary">
                    {t('home')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={t('lightmode')}
                  >
                    {theme === 'light' ? <Moon size={20} className="dark:text-gray-200" /> : <Sun size={20} className="dark:text-gray-200" />}
                  </button>
                  <button
                    onClick={toggleCollapse}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={t('about')}
                  >
                    <PanelLeftOpen size={20} className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'} dark:text-gray-200`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Greeting at the very top */}
          {!isCollapsed && (
            <div className="flex flex-row items-center justify-start gap-2 px-4 pt-2 pb-2">
              <span style={waveStyle} aria-label="waving hand" role="img" className="text-2xl select-none">👋</span>
              <h2 className="text-xl font-bold dark:text-gray-200">سلام {user?.name}</h2>
            </div>
          )}

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
                className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors text-base font-semibold mb-4"
              >
                + گفت‌وگوی جدید
              </button>
              {/* Feature Navigation Buttons */}
              <div className="space-y-2">
                {featureNavigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleFeatureNavigation(item.path)}
                    className={`flex items-center gap-3 w-full rounded-lg px-4 py-2 border border-transparent dark:border-transparent transition-colors text-right font-medium
                      ${isRouteActive(item.path)
                        ? 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                        : 'bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { className: `w-6 h-6 ${isRouteActive(item.path) ? 'text-blue-500' : 'text-blue-500'}` })}
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content: Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* User Info, New Chat Button, and Chat History - Hidden when collapsed */}
            {!isCollapsed && (
              <div className="mb-2">
                <div>
                  <ChatHistorySidebar
                    chatHistory={chatHistory}
                    onChatSelect={handleSelectChat}
                    isLoading={isChatHistoryLoading}
                    activeChatId={urlChatId}
                  />
                  {/* پیام اگر هیچ تاریخچه‌ای نبود */}
                  {!isChatHistoryLoading && chatHistory.length === 0 && (
                    <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      هیچ تاریخچه‌ای ندارید
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Section */}
          <div className="border-t p-4 dark:border-gray-700">
            <div
              className={`group relative flex h-12 items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } cursor-pointer rounded-lg p-2 transition-colors ${user ? 'text-red-800 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-gray-700' : 'text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'}`}
              onClick={user ? handleLogoutClick : () => router.push(`/${locale}/auth`)}
              title={isCollapsed ? (user ? t('logout') : 'ورود به حساب') : undefined}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (user) handleLogoutClick();
                  else router.push(`/${locale}/auth`);
                }
              }}
            >
              {!isCollapsed && (
                <div className="flex flex-row items-center">
                  {user ? (
                    <LogOut className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={24} />
                  ) : (
                    <LogIn className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={24} />
                  )}
                  <span className={`mx-4 rtl:mx-2 font-medium ${user ? '' : 'text-blue-500'}`}>{user ? t('logout') : 'ورود به حساب'}</span>
                </div>
              )}
              {isCollapsed && (
                user ? (
                  <LogOut className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={24} />
                ) : (
                  <LogIn className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={24} />
                )
              )}
              {!isCollapsed && <ChevronLeft size={24} className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} />}
            </div>
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
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
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcherModal, { LanguageSwitcherButton } from '../LanguageSwitcher';
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
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
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
    if (path === '/app') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.includes(path) || pathname === `/${locale}${path}`;
  };

  const handleNavigation = (path: string) => {
    if (path) {
      const fullPath = path === '/app' ? `/${locale}` : `/${locale}${path}`;
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
    router.push(`/app`);
    // if (typeof window !== 'undefined') {
    //   window.history.replaceState({}, '', `/app`);
      window.dispatchEvent(new Event('clear-chat-messages'));
    // }
  };

  // Handler for selecting a chat from history
  const handleSelectChat = () => {};

  const navigationItems: NavigationItem[] = [
    { icon: <ImageIcon size={24} className="dark:text-gray-200" />, text: 'ساخت تصویر', path: '/app/image' },
    // { icon: <Newspaper size={24} className="dark:text-gray-200" />, text: t('blog'), path: '/app/blog' },
  ];

  return (
    <>
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
                onClick={toggleCollapse}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                title="تاریخچه گفتگوها"
              >
                <History size={24} className="text-black dark:text-gray-200" />
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* User Info, New Chat Button, and Chat History - Hidden when collapsed */}
            {!isCollapsed && (
              <div className="mb-2">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h2 className="text-xl font-bold dark:text-gray-200">سلام {user?.name}</h2>
                  <button
                    onClick={handleNewChat}
                    className="ml-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors text-sm"
                  >
                    + گفت‌وگوی جدید
                  </button>
                </div>
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

            {/* Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <div
                  key={index}
                  className={`group relative flex h-12 items-center ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    isRouteActive(item.path)
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-gray-700'
                  } cursor-pointer rounded-lg transition-colors`}
                  onClick={() => handleNavigation(item.path)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleNavigation(item.path);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={item.text}
                  title={isCollapsed ? item.text : undefined}
                >
                  {!isCollapsed && (
                    <div className="flex flex-row items-center">
                      {item.icon}
                      <span className={`mx-6 ${
                        isRouteActive(item.path)
                          ? 'font-medium text-blue-600 dark:text-blue-400'
                          : 'dark:text-gray-200'
                      }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  )}
                  {isCollapsed && item.icon}
                  {!isCollapsed && (
                    <ChevronLeft
                      size={20}
                      className={`${isRouteActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'dark:text-gray-200'}
                      ${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`}
                    />
                  )}
                </div>
              ))}

              {/* Separator Line */}
              {/* {!isCollapsed && <div className="my-4 border-t dark:border-gray-700" />} */}

              {/* Theme and Language Buttons */}
              {/* <div
                className={`group relative flex h-12 items-center ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                } cursor-pointer rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-gray-700`}
                onClick={() => setIsLanguageModalOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setIsLanguageModalOpen(true);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t('selectLanguage')}
                title={isCollapsed ? t('selectLanguage') : undefined}
              >
                {!isCollapsed
                  ? (
                      <div className="flex w-full flex-row items-center">
                        <LanguageSwitcherButton isCollapsed={isCollapsed} onClick={() => setIsLanguageModalOpen(true)} />
                      </div>
                    )
                  : (
                      <LanguageSwitcherButton isCollapsed={isCollapsed} onClick={() => setIsLanguageModalOpen(true)} />
                    )}
                {!isCollapsed && (
                  <ChevronLeft
                    size={20}
                    className={`dark:text-gray-200 ${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`}
                  />
                )}
              </div> */}
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t p-4 dark:border-gray-700">
            <div
              className={`group relative flex h-12 items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } cursor-pointer rounded-lg p-2 text-red-800 transition-colors hover:bg-slate-100 dark:text-red-400 dark:hover:bg-gray-700`}
              onClick={handleLogoutClick}
              title={isCollapsed ? t('logout') : undefined}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleLogoutClick();
                }
              }}
            >
              {!isCollapsed && (
                <div className="flex flex-row items-center">
                  <LogOut className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={24} />
                  <span className="mx-4">{t('logout')}</span>
                </div>
              )}
              {isCollapsed && <LogOut className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={24} />}
              {!isCollapsed && <ChevronLeft size={24} className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} />}
            </div>
          </div>
        </div>
      </div>
      {/* <LanguageSwitcherModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isCollapsed={isCollapsed}
      /> */}
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Sidebar;

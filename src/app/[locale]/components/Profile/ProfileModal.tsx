'use client';

import {
  ChevronLeft,
  Globe,
  LogOut,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcherModal from '../LanguageSwitcher';
import LogoutDialog from '../LogoutDialog';
import ChatHistorySidebar from '../Chat/ChatHistorySidebar';
import { useTheme } from '../ThemeProvider';
import { ImageIcon } from 'lucide-react';
import fetchWithAuth from '../utils/fetchWithAuth';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogin?: (email: string, password: string) => Promise<void>;
};

type Chat = {
  id: string;
  date: string | number | Date;
  title?: string;
  text?: string;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('sidebar');
  const { user } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  // Fetch chat history (same as Sidebar)
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

  React.useEffect(() => {
    refreshChatHistory();
  }, [user?.id]);

  React.useEffect(() => {
    const handler = () => {
      refreshChatHistory();
    };
    window.addEventListener('chat-history-refresh', handler);
    return () => {
      window.removeEventListener('chat-history-refresh', handler);
    };
  }, []);

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

  const navigationItems = [
    { icon: <ImageIcon size={24} className="text-gray-800 dark:text-gray-200" />, text: 'ساخت تصویر', path: '/app/image' },
  ]; 

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out md:hidden md:w-1/3 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'rgba(0,0,0,0.25)' }}
        dir={locale === 'fa' ? 'rtl' : 'ltr'}
      >
        <header className="sticky top-0 z-10 flex flex-row-reverse items-center justify-between p-4 bg-primary text-white shadow-md rounded-t-2xl">
        <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="rounded-lg p-2 transition-colors hover:bg-blue-700 flex items-center gap-1"
              title={theme === 'light' ? 'تم تاریک' : 'تم روشن'}
            >
              {theme === 'light' ? <Moon size={20} className="dark:text-gray-200" /> : <Sun size={20} className="dark:text-gray-200" />}
              <span className="text-sm">{theme === 'light' ? 'تم تاریک' : 'تم روشن'}</span>
            </button>
          <div className="flex items-center gap-2">
          <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-blue-700"
            >
              <X size={24} />
            </button>
            <h1 className="mr-3 text-2xl font-bold">سلام {user?.name}</h1>

          </div>
        </header>
        <div className="h-[calc(100%-64px)] flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
          {/* New Chat Button */}
          <div className="mb-4 flex flex-row items-center justify-center mx-auto px-6">
            <button
              onClick={() => {
                router.push(`/app`);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('clear-chat-messages'));
                }
                onClose();
              }}
              className="rounded-lg bg-blue-500 px-10 py-2 text-white hover:bg-blue-600 transition-colors text-sm font-bold"
            >
              + گفت‌وگوی جدید
            </button>
          </div>
          {/* Chat History Section */}
          <div className="mb-6">
            <ChatHistorySidebar
              chatHistory={chatHistory}
              isLoading={isChatHistoryLoading}
              onChatSelect={onClose}
            />
            {/* Show message if no chat history */}
            {!isChatHistoryLoading && chatHistory.length === 0 && (
              <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                هیچ تاریخچه‌ای ندارید
              </div>
            )}
          </div>
          {/* Navigation, Language, Logout - each in its own row */}
          <div className="flex flex-col gap-2">
            {navigationItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-700 shadow-sm"
                  onClick={() => {
                      router.push(`/${locale}${item.path}`);
                      onClose();
                  }}
                  type="button"
                >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                    <ChevronLeft size={24} className={locale === 'fa' ? '' : 'rotate-180'} />
                </button>
            ))}
            {/* <button
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-700 shadow-sm"
              onClick={() => setShowLanguageModal(true)}
              type="button"
            >
              <div className="flex items-center gap-4">
                <Globe size={24} />
                <span>{t('language')}</span>
              </div>
              <ChevronLeft size={24} className={locale === 'fa' ? '' : 'rotate-180'} />
            </button> */}
            <button
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-white dark:bg-gray-900 text-red-800 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-gray-700 shadow-sm"
              onClick={handleLogoutClick}
            >
              <div className="flex items-center gap-4">
                  <LogOut className={locale === 'fa' ? '' : 'rotate-180'} />
                  <span>{t('logout')}</span>
                </div>
                <ChevronLeft size={24} className={locale === 'fa' ? '' : 'rotate-180'} />
            </button>
          </div>
        </div>
      </div>
      <LanguageSwitcherModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        isCollapsed={false}
      />
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default ProfileModal;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LogOut,
  X,
  Sun,
  Moon,
  Image as ImageIcon,
  Mic,
  BookText,
  LogIn,
  Star,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../hooks/useAuth';
import { useUserInfoContext } from '../contexts/UserInfoContext';
import { api } from '../utils/api';
import { isUserPremium, getUserAccountTypeText } from '../utils/premiumUtils';
import dayjs from 'dayjs';
import jalaliday from 'jalali-plugin-dayjs';
import 'dayjs/locale/fa';

// Import sidebar styles
import '../styles/sidebar.css';

// Configure dayjs with Persian locale
dayjs.extend(jalaliday);
dayjs.locale('fa');

type Chat = {
  id: string;
  insert_time: string;
  last_change_time?: string | null;
  message_count: number;
  status: string;
  title?: string | null;
  user_id: number;
  code?: string; // Add 'code' field from API
  chatCode?: string; // Add chatCode field
};

interface ChatResponse {
  id: string;
  insert_time: string;
  last_change_time?: string | null;
  message_count: number;
  status: string;
  title?: string | null;
  user_id: number;
  code?: string;
  chatCode?: string;
}

interface ChatsResponse {
  chats: ChatResponse[];
}

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  onChatSelect?: (chatId: string, chatCode?: string) => void;
  onNewChat?: () => void;
  currentChatId?: string | null;
  refreshChatHistory?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  isAuthenticated,
  onChatSelect,
  onNewChat,
  currentChatId,
  refreshChatHistory,
}) => {
  const { theme, setTheme } = useTheme();
  const { navigate } = useRouter();
  const { user, logout } = useAuth();
  const { localUserInfo } = useUserInfoContext();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const logoutDialogRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadChatHistory = useCallback(async () => {
    if (!user?.id || !user?.accessToken) {
      console.log('No user ID or access token available');
      return;
    }
    
    setIsLoadingChats(true);
    try {
      const response = await api.getWithAuth(`/chats?userID=${user.id}`, user.accessToken);
      console.log('Chat history response:', response);
      
      // Handle different response formats
      let chats: Chat[] = [];
      if (response && Array.isArray(response)) {
        chats = response.map((chat: ChatResponse) => ({
          ...chat,
          chatCode: chat.code || chat.chatCode || chat.id // Extract 'code' field or fallback
        }));
      } else if (response && typeof response === 'object' && 'chats' in response && Array.isArray((response as unknown as ChatsResponse).chats)) {
        chats = (response as unknown as ChatsResponse).chats.map((chat: ChatResponse) => ({
          ...chat,
          chatCode: chat.code || chat.chatCode || chat.id // Extract 'code' field or fallback
        }));
      } else {
        chats = [];
      }

      console.log('Processed chats with chatCode:', chats.map(chat => ({ 
        id: chat.id, 
        code: chat.code, 
        chatCode: chat.chatCode 
      })));
      
      // Sort chats by insert_time (newest first) to ensure new chats appear at the top
      const sortedChats = chats.sort((a, b) => {
        const timeA = new Date(a.insert_time).getTime();
        const timeB = new Date(b.insert_time).getTime();
        return timeB - timeA; // Newest first
      });
      
      console.log('[Sidebar] Setting sorted chat history, newest first');
      console.log('[Sidebar] First few chats:', sortedChats.slice(0, 3).map(chat => ({
        id: chat.id,
        code: chat.code,
        chatCode: chat.chatCode,
        insert_time: chat.insert_time,
        title: chat.title
      })));
      
      setChatHistory(sortedChats);
      
      // If we have a currentChatId, check if it's in the new history
      if (currentChatId && sortedChats.length > 0) {
        const currentChatInHistory = sortedChats.some(chat => 
          chat.id === currentChatId || chat.chatCode === currentChatId || chat.code === currentChatId
        );
        
        if (currentChatInHistory) {
          console.log('[Sidebar] Current chat found in refreshed history:', currentChatId);
        } else {
          console.log('[Sidebar] Current chat not found in refreshed history, might need another refresh:', currentChatId);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([]);
    } finally {
      setIsLoadingChats(false);
    }
  }, [user?.id, user?.accessToken, currentChatId]);

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

  useEffect(() => {
    if (!showLogoutDialog) return;
    function handleClickOutside(event: MouseEvent) {
      if (logoutDialogRef.current && !logoutDialogRef.current.contains(event.target as Node)) {
        setShowLogoutDialog(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogoutDialog]);

  // Handle click outside sidebar to close it
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleSidebar();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleSidebar]);

  // Load chat history when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadChatHistory();
    } else {
      setChatHistory([]);
    }
  }, [isAuthenticated, user]);

  // Force reload chat history when user changes
  useEffect(() => {
    if (user?.id && user?.accessToken) {
      console.log('[Sidebar] User changed, loading chat history');
      loadChatHistory();
    }
  }, [user?.id, user?.accessToken, loadChatHistory]);

  // Additional effect to force refresh when currentChatId changes
  useEffect(() => {
    if (currentChatId && user?.id && user?.accessToken) {
      console.log('[Sidebar] Current chat ID changed, forcing chat history refresh:', currentChatId);
      
      // Force refresh after a short delay to ensure we get the latest data
      const timer = setTimeout(() => {
        console.log('[Sidebar] Forcing chat history refresh for current chat:', currentChatId);
        loadChatHistory();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentChatId, user?.id, user?.accessToken, loadChatHistory]);

  // Force reload chat history when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Add a small delay to ensure user state is fully loaded
      const timer = setTimeout(() => {
        loadChatHistory();
      }, 100);
      return () => clearTimeout(timer);
    }
    
    // Return empty cleanup function when conditions are not met
    return () => {};
  }, [isAuthenticated, user]);

  // Force reload chat history when user changes
  useEffect(() => {
    if (user?.id && user?.accessToken) {
      loadChatHistory();
    }
  }, [user?.id, user?.accessToken]);

  // Refresh chat history when refreshChatHistory prop changes (triggered from parent)
  useEffect(() => {
    if (refreshChatHistory && user?.id && user?.accessToken) {
      console.log('[Sidebar] Refreshing chat history from parent trigger');
      // Force reload chat history immediately
      loadChatHistory();
      
      // Also reload after a short delay to ensure we get the latest data
      const timer = setTimeout(() => {
        console.log('[Sidebar] Additional delayed refresh from parent trigger');
        loadChatHistory();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [refreshChatHistory, user?.id, user?.accessToken, loadChatHistory]);

  // When chat history is updated, check if we need to highlight a new chat
  useEffect(() => {
    if (chatHistory.length > 0 && currentChatId) {
      console.log('[Sidebar] Chat history updated, checking for current chat:', currentChatId);
      console.log('[Sidebar] Available chats:', chatHistory.map(chat => ({ 
        id: chat.id, 
        chatCode: chat.chatCode, 
        code: chat.code,
        insert_time: chat.insert_time 
      })));
      
      // Find if the current chat exists in the updated history
      const currentChatExists = chatHistory.some(chat => 
        chat.id === currentChatId || chat.chatCode === currentChatId || chat.code === currentChatId
      );
      
      if (currentChatExists) {
        console.log('[Sidebar] Current chat found in updated history');
        // Find the matching chat for additional info
        const matchingChat = chatHistory.find(chat => 
          chat.id === currentChatId || chat.chatCode === currentChatId || chat.code === currentChatId
        );
        if (matchingChat) {
          console.log('[Sidebar] Matching chat details:', matchingChat);
          
          // Auto-scroll to the active chat if it's a new chat
          setTimeout(() => {
            const activeChatElement = document.querySelector('.active-chat');
            if (activeChatElement) {
              activeChatElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
              });
              console.log('[Sidebar] Scrolled to active chat');
            }
          }, 100);
        }
      } else {
        console.log('[Sidebar] Current chat not found in updated history, might be a new chat');
        console.log('[Sidebar] This could mean the chat was just created and needs to be added to the list');
        
        // If current chat is not found, it might be a newly created chat
        // Force a refresh to ensure we get the latest data
        if (refreshChatHistory) {
          console.log('[Sidebar] Forcing refresh to get newly created chat');
          setTimeout(() => {
            refreshChatHistory();
          }, 500);
        }
      }
    }
  }, [chatHistory, currentChatId, refreshChatHistory]);

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
    toggleSidebar();
  };

  const handleFeatureNavigation = (path: string) => {
    console.log('Navigate to:', path);
    if (path === '/pricing') {
      navigate('pricing');
    } else if (path === '/image') {
      navigate('image');
    } else if (path === '/text-to-voice') {
      navigate('text-to-voice');
    } else if (path === '/about') {
      navigate('about');
    } else if (path === '/help') {
      navigate('help');
    }
    toggleSidebar();
  };


  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setProfileMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      // Don't toggle sidebar after logout
      // toggleSidebar(); // Remove this line
    } catch {
      // Handle logout error silently
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const handleChatSelect = (chatId: string, chatCode?: string) => {
    if (onChatSelect) {
      onChatSelect(chatId, chatCode);
    } else {
      // Fallback: Navigate to chat
      navigate('chat');
      toggleSidebar();
    }
  };

  // Helper function to parse dates robustly
  const parseDate = (dateInput: string | number | Date): dayjs.Dayjs => {
    let parsedDate: dayjs.Dayjs;
    
    if (typeof dateInput === 'string') {
      // Try multiple parsing strategies for strings
      if (dateInput.includes('T') || dateInput.includes('Z')) {
        // ISO format
        parsedDate = dayjs(dateInput);
      } else if (dateInput.includes('-')) {
        // Date string format
        parsedDate = dayjs(dateInput);
      } else {
        // Try as timestamp string
        const timestamp = parseInt(dateInput);
        if (!isNaN(timestamp)) {
          if (timestamp > 1000000000000) {
            parsedDate = dayjs(timestamp);
          } else {
            parsedDate = dayjs(timestamp * 1000);
          }
        } else {
          parsedDate = dayjs(dateInput);
        }
      }
    } else if (typeof dateInput === 'number') {
      // Handle numeric timestamps
      if (dateInput > 1000000000000) {
        parsedDate = dayjs(dateInput);
      } else {
        parsedDate = dayjs(dateInput * 1000);
      }
    } else {
      // Date object
      parsedDate = dayjs(dateInput);
    }
    
    // If still invalid, try alternative formats
    if (!parsedDate.isValid()) {
      // Try as ISO string
      parsedDate = dayjs(dateInput as string);
      
      // If still invalid, use current date
      if (!parsedDate.isValid()) {
        parsedDate = dayjs();
      }
    }
    
    return parsedDate;
  };

  // Group chats by date like in web version
  const groupChatsByDate = (chats: Chat[]) => {
    const now = dayjs();
    const grouped: { [key: string]: Chat[] } = {};



    chats.forEach((chat) => {

      
      const date = parseDate(chat.insert_time);
      


      const diffDays = now.startOf('day').diff(date.startOf('day'), 'day');
      let groupKey = '';
            
      if (diffDays === 0) {
        groupKey = 'امروز';
      } else if (diffDays === 1) {
        groupKey = 'دیروز';
      } else if (diffDays <= 7) {
        groupKey = 'هفت روز گذشته';
      } else if (diffDays <= 30) {
        groupKey = 'ماه گذشته';
      } else {
        // Use Persian month and year
        groupKey = `${date.locale('fa').format('MMMM YYYY')}`;
      }
            
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey]!.push(chat);
    });

    return grouped;
  };

  const groupedChats = groupChatsByDate(chatHistory);
  const staticOrder = ['امروز', 'دیروز', 'هفت روز گذشته', 'ماه گذشته'];
  const monthKeys = Object.keys(groupedChats)
    .filter(k => !staticOrder.includes(k))
    .sort((a, b) => {
      const aDate = dayjs(a + ' 01', { jalali: true, locale: 'fa' });
      const bDate = dayjs(b + ' 01', { jalali: true, locale: 'fa' });
      return bDate.valueOf() - aDate.valueOf();
    });
  const orderedKeys = [...staticOrder.filter(k => groupedChats[k]), ...monthKeys];

  return (
    <>
      <div
        className={`inset-y-0 fixed w-80 bg-white/95 dark:bg-gray-900/95 shadow-xl border-r border-gray-200 dark:border-gray-700 backdrop-blur-lg sidebar-main
       ${isOpen ? 'sidebar-open' : 'sidebar-closed'}
       right-0
       z-50`}
        dir="rtl"
        ref={sidebarRef}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <img
                  src="/kalamelogo.png"
                  alt="logo"
                  className="w-12 rounded-2xl hover:scale-110 hover:shadow-lg"
                />
                <span className="mx-2 text-2xl font-bold text-primary dark:text-blue-400 select-none">کلمه</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleThemeToggle}
                  className="sidebar-theme-toggle rounded-lg p-2 transition-all duration-300 ease-out hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400 bg-transparent dark:bg-transparent"
                  title="تغییر تم"
                >
                  {theme === 'light' ? <Moon size={20} className="text-gray-600 dark:text-gray-200" /> : <Sun size={20} className="text-gray-600 dark:text-gray-200" />}
                </button>
                <button
                  onClick={toggleSidebar}
                  className="sidebar-theme-toggle rounded-lg p-2 transition-all duration-300 ease-out hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400"
                  title="بستن"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-200" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-2 px-4 pt-2">
            <button
              onClick={handleNewChat}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.03] focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-out text-sm font-semibold mb-4 shadow-md"
            >
              + گفت‌وگوی جدید
            </button>
            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleFeatureNavigation('/image')}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out text-right font-medium text-xs md:text-sm bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-100 hover:scale-[1.03] focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400 transition-colors" />
                <span className="truncate">ساخت تصویر</span>
              </button>
              <button
                onClick={() => handleFeatureNavigation('/text-to-voice')}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out text-right font-medium text-xs md:text-sm bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-100 hover:scale-[1.03] focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <Mic className="w-5 h-5 md:w-6 md:h-6 text-blue-400 transition-colors" />
                <span className="truncate">تبدیل متن به گفتار</span>
              </button>
              <button
                onClick={() => handleFeatureNavigation('/pricing')}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out text-right font-medium text-xs md:text-sm bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-100 hover:scale-[1.03] focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <Star className="w-5 h-5 md:w-6 md:h-6 text-blue-400 transition-colors" />
                <span className="truncate">ارتقا بسته</span>
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-2">
              <h2 className="border-b border-gray-200 dark:border-gray-700 p-2 text-base font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">گفت‌وگوهای اخیر</h2>
              
              {isLoadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-sm p-2 border border-gray-200 dark:border-gray-700">
                  <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                    هنوز هیچ گفت‌وگویی ندارید
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {orderedKeys.map(groupKey => (
                    <div key={groupKey} className="mb-4">
                      <h3 className="sticky -top-4 bg-gray-100 dark:bg-gray-900 rounded-t-lg px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300">
                        {groupKey}
                      </h3>
                      <ul>
                        {[...(groupedChats[groupKey] ?? [])]
                          .sort((a, b) => Number(new Date(b.insert_time)) - Number(new Date(a.insert_time)))
                          .map((chat) => {
                            // Check if this chat is the current active chat
                            const isActiveChat = currentChatId === chat.id || 
                                               currentChatId === chat.code || 
                                               currentChatId === chat.chatCode;
                            
                            return (
                              <li key={chat.id}>
                                <button
                                  onClick={() => {
                                    console.log('Chat button clicked:', { 
                                      id: chat.id, 
                                      code: chat.code, 
                                      chatCode: chat.chatCode,
                                      isActive: isActiveChat 
                                    });
                                    handleChatSelect(chat.id, chat.chatCode);
                                  }}
                                  className={`w-full px-4 py-2 text-left rounded transition-all duration-300 ease-out truncate focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                                    isActiveChat 
                                      ? 'active-chat active bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                                      : ''
                                  }`}
                                >
                                  <p className="truncate text-gray-900 dark:text-gray-100 font-medium text-sm text-right">
                                    {chat.title || 'بدون عنوان'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                    {(() => {
                                      const displayDate = parseDate(chat.insert_time);
                                      return displayDate.isValid() ? displayDate.locale('fa').format('HH:mm') : '--:--';
                                    })()}
                                  </p>
                                </button>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 relative">
            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-all duration-300 ease-out hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                  tabIndex={0}
                >
                  <img
                    src={user.image || "https://cdn-icons-png.flaticon.com/512/3237/3237472.png"}
                    alt="آواتار کاربر"
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                  <div className="flex flex-col flex-1 min-w-0 text-right">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {user.name || 'کاربر'}
                    </span>
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
                  <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-3 px-0 min-w-[210px] animate-fade-in flex flex-col gap-1">
                    <button onClick={() => handleFeatureNavigation('/about')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 ease-out">
                      <BookText size={18} className="text-blue-500" />
                      درباره ما
                    </button>
                    <button onClick={() => handleFeatureNavigation('/help')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 ease-out">
                      <Star size={18} className="text-yellow-500" />
                      راهنما
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button 
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 ease-out"
                    >
                      <LogOut size={18} className="" />
                      خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    navigate('auth');
                    toggleSidebar();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 ease-out focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <LogIn size={20} />
                  <span className="font-bold text-sm">ورود به حساب</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div 
            ref={logoutDialogRef}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in"
            dir="rtl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  خروج از حساب کاربری
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  آیا قصد خروج از حساب کاربری خود را دارید؟
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ease-out font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 ease-out"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 
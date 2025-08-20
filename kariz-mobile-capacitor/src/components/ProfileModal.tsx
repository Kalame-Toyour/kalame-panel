import React, { useState, useEffect, useRef } from 'react';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
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
  const [chatHistory] = useState<Chat[]>([]);
  const [isChatHistoryLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Mock user for demo
  const user = {
    id: '1',
    name: 'کاربر',
    email: 'user@example.com',
    image: 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'
  };

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

  const featureNavigationItems: NavigationItem[] = [
    { icon: <span>🖼️</span>, text: 'ساخت تصویر', path: 'image' },
    { icon: <span>🎤</span>, text: 'تبدیل متن به گفتار', path: 'text-to-voice' },
    { icon: <span>⭐</span>, text: 'ارتقا بسته', path: 'pricing' },
  ];

  const handleFeatureNavigation = (path: string) => {
    console.log('Navigate to:', path);
    onClose();
  };

  const handleLogoutConfirm = async () => {
    console.log('Logout confirmed');
    onClose();
  };

  const handleLoginClick = () => {
    onClose();
    console.log('Navigate to auth');
  };

  if (!isOpen) return null;

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
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden transition-opacity duration-300"
            onClick={onClose}
          />
          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl dark:bg-gray-800 md:hidden flex flex-col justify-between transform transition-transform duration-300 ease-in-out"
            dir="rtl"
          >
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-white hover:bg-white/20 transition-colors"
                >
                  ✕
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
                className="profile-theme-toggle rounded-full p-2 text-white hover:bg-white/20 transition-colors"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </header>

            <div className="flex-1 h-[calc(100%-64px)] flex flex-col overflow-y-auto p-3 pb-24">
              {/* Feature Navigation Items */}
              <div className="mb-3 space-y-1.5">
                {featureNavigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleFeatureNavigation(item.path)}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 border transition-colors text-right text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                  >
                    {item.icon}
                    <span>{item.text}</span>
                    <span className="mr-auto">›</span>
                  </button>
                ))}
              </div>

              {/* New Chat Button */}
              {user && (
                <div className="my-4 text-center">
                  <button
                    onClick={() => {
                      console.log('New chat');
                      onClose();
                    }}
                    className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    + گفت‌وگوی جدید
                  </button>
                </div>
              )}

              {/* Chat History Section */}
              {user && (
                <div className="flex-grow mb-3 border-t border-b dark:border-gray-700 py-2 -mx-3 px-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">تاریخچه گفت‌وگوها</div>
                  {!isChatHistoryLoading && chatHistory.length === 0 && (
                    <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      هیچ گفتگویی وجود ندارد
                    </div>
                  )}
                  {isChatHistoryLoading && (
                    <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      در حال بارگذاری...
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Section */}
              <div className="border-t dark:border-gray-700 pt-3">
                {user ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 transition-colors text-right text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      onClick={() => setProfileMenuOpen((v) => !v)}
                    >
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="flex-1 text-right">{user.name}</span>
                      <span className="text-gray-400">›</span>
                    </button>
                    {profileMenuOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                        <button
                          className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            console.log('Settings');
                          }}
                        >
                          تنظیمات
                        </button>
                        <button
                          className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogoutConfirm();
                          }}
                        >
                          خروج
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    onClick={handleLoginClick}
                  >
                    ورود به حساب
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProfileModal; 
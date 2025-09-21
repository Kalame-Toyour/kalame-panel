import React, { useEffect, useRef } from 'react';
import { User, Sparkles, ArrowLeft } from 'lucide-react';

interface PurchaseAuthNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const PurchaseAuthNotification: React.FC<PurchaseAuthNotificationProps> = ({ 
  isVisible, 
  onClose, 
  onLogin 
}) => {
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
      <div
        ref={notificationRef}
        className="w-full max-w-md mx-auto animate-slide-up"
      >
        {/* Main content */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-xl">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ورود به حساب کاربری
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                برای خرید پکیج
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
              برای خرید پکیج و استفاده از امکانات ویژه، لطفاً ابتدا وارد حساب کاربری خود شوید.
            </p>
            
            {/* Features list */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  امکانات ویژه اعضا:
                </span>
              </div>
              <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>دسترسی به پکیج‌های اشتراک</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>تولید محتوای نامحدود</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>پشتیبانی اختصاصی</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onLogin}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>ورود / ثبت نام</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseAuthNotification;

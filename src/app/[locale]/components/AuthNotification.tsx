'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ArrowLeft } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface AuthNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
  customMessage?: string;
  customTitle?: string;
  customFeatures?: string[];
}

const AuthNotification: React.FC<AuthNotificationProps> = ({ 
  isVisible, 
  onClose, 
  onLogin, 
  customMessage,
  customTitle,
  customFeatures 
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

  // Default values
  const title = customTitle || 'ورود به حساب کاربری';
  const message = customMessage || 'برای گفت‌وگو با هوش مصنوعی کلمه و استفاده از تمامی امکانات، لطفاً وارد حساب کاربری خود شوید.';
  const features = customFeatures || [
    'دسترسی نامحدود به چت',
    'ذخیره تاریخچه گفت‌وگوها',
    'امکانات پیشرفته'
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            ref={notificationRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto"
          >
                      {/* Main content */}
            <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-xl">
              {/* Header with icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {title}
                  </h3>

                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Features list */}
              <div className="mb-6 space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons - mobile responsive */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-3 md:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  بعداً
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogin}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  <span>ورود / ثبت‌نام</span>
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthNotification; 
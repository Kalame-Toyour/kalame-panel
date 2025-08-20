import React from 'react';

// Platform-agnostic imports
const isWeb = typeof window !== 'undefined' && window.navigator?.userAgent?.includes('Mozilla');
const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator?.userAgent || '');

// Conditional imports based on platform
let Motion: any = null;
let AnimatePresence: any = null;
let X: any = null;

if (isWeb) {
  // Web-specific imports
  try {
    const framerMotion = require('framer-motion');
    Motion = framerMotion.motion;
    AnimatePresence = framerMotion.AnimatePresence;
  } catch (e) {
    // Fallback for mobile
  }
  
  try {
    const lucideReact = require('lucide-react');
    X = lucideReact.X;
  } catch (e) {
    // Fallback
    X = () => <span>✕</span>;
  }
} else {
  // Mobile fallbacks
  X = () => <span>✕</span>;
}

interface AuthNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
  customTitle?: string;
  customMessage?: string;
  customFeatures?: string[];
}

const AuthNotification: React.FC<AuthNotificationProps> = ({
  isVisible,
  onClose,
  onLogin,
  customTitle = 'ورود به حساب کاربری',
  customMessage = 'برای گفت‌وگو با هوش مصنوعی کلمه و استفاده از تمامی امکانات، لطفاً وارد حساب کاربری خود شوید.',
  customFeatures = [
    'دسترسی نامحدود به چت',
    'ذخیره تاریخچه گفت‌وگوها',
    'امکانات پیشرفته'
  ]
}) => {
  if (!isVisible) return null;

  const ModalContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {customTitle}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {customMessage}
        </p>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            مزایای عضویت:
          </h3>
          <ul className="space-y-2">
            {customFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onLogin}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            ورود / ثبت‌نام
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            بعداً
          </button>
        </div>
      </div>
    </div>
  );

  // Web version with animations
  if (isWeb && Motion && AnimatePresence) {
    return (
      <AnimatePresence>
        {isVisible && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md mx-auto"
            >
              <ModalContent />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile version without animations
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ModalContent />
      </div>
    </>
  );
};

export default AuthNotification; 
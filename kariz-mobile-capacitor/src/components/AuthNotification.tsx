import React from 'react';
import { X } from 'lucide-react';

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

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full mx-2 shadow-2xl transform transition-all duration-300 scale-100 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
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
          <div className="p-5">
            <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed text-sm">
              {customMessage}
            </p>

            {/* Features */}
            <div className="mb-5">
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
            <div className="flex flex-col gap-3">
              <button
                onClick={onLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                ورود / ثبت‌نام
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                بعداً
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthNotification;
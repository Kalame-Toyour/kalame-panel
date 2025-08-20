import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NoInternetProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function NoInternet({ onRetry, isRetrying = false }: NoInternetProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-700 dark:via-gray-900 dark:to-gray-800 p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {/* Icon Container */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <WifiOff size={48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Wifi size={16} className="text-white" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
          اتصال اینترنت برقرار نیست
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed animate-fade-in delay-200">
          برای استفاده از کلمه، دستیار هوشمند شما، نیاز به اتصال اینترنت دارید.
          <br />
          لطفاً اتصال خود را بررسی کنید.
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isRetrying ? (
            <>
              <RefreshCw size={20} className="mr-2 animate-spin" />
              در حال بررسی...
            </>
          ) : (
            <>
              <RefreshCw size={20} className="mr-2 group-hover:animate-spin" />
              تلاش مجدد
            </>
          )}
        </button>

        {/* Tips */}
        {/* <div className="mt-8 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 animate-fade-in delay-400">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            نکات مفید:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-right">
            <li>• Wi-Fi یا داده موبایل خود را بررسی کنید</li>
            <li>• از اتصال پایدار اینترنت اطمینان حاصل کنید</li>
            <li>• در صورت نیاز، دستگاه را ریستارت کنید</li>
          </ul>
        </div> */}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"></div>
      <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-400 dark:bg-cyan-500 rounded-full animate-bounce animation-delay-1000"></div>
      <div className="absolute bottom-32 left-20 w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce animation-delay-2000"></div>
    </div>
  );
} 
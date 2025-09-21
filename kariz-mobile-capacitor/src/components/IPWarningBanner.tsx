import React from 'react';
import { AlertTriangle, X, Shield, Globe, RefreshCw } from 'lucide-react';

interface IPWarningBannerProps {
  isVisible: boolean;
  onClose: () => void;
  onRecheck: () => void;
  country?: string;
  isRechecking?: boolean;
}

export default function IPWarningBanner({ 
  isVisible, 
  onClose, 
  onRecheck,
  country,
  isRechecking = false
}: IPWarningBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg animate-slide-down">
      <div className="px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-white text-sm">
                  هشدار پرداخت
                </h3>
              </div>
              
              <p className="text-white/90 text-xs leading-relaxed">
                برای خرید و استفاده از خدمات، لطفاً فیلترشکن خود را خاموش کنید.
                {country && country !== 'IR' && (
                  <span className="block mt-1">
                    موقعیت فعلی شما: <span className="font-semibold">{country}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-white/80 text-xs">
              <Globe className="w-3 h-3" />
              <span>ایران</span>
            </div>
            
            <button
              onClick={onRecheck}
              disabled={isRechecking}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg backdrop-blur-sm transition-colors text-white text-xs font-medium"
            >
              {isRechecking ? (
                <div className="flex items-center gap-1">
                  <RefreshCw className="animate-spin w-3 h-3" />
                  <span>در حال بررسی...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>بررسی مجدد</span>
                </div>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
              aria-label="بستن"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-40">
        <div className="h-full w-1/4 bg-white animate-slide-right" />
      </div>
    </div>
  );
}

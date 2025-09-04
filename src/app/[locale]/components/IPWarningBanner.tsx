'use client'

import { AlertTriangle, X, Shield, Globe, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface IPWarningBannerProps {
  isVisible: boolean
  onClose: () => void
  onRecheck: () => void
  country?: string
  isRTL: boolean
  isRechecking?: boolean
}

export default function IPWarningBanner({ 
  isVisible, 
  onClose, 
  onRecheck,
  country, 
  isRTL,
  isRechecking = false
}: IPWarningBannerProps) {
  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="size-4 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="size-4 text-white" />
                  <h3 className="font-semibold text-white text-base">
                    {isRTL ? 'هشدار پرداخت' : 'Payment Warning'}
                  </h3>
                </div>
                
                <p className="text-white/90 text-xs leading-relaxed">
                  {isRTL ? (
                    <>
                      برای خرید و استفاده از خدمات، لطفاً فیلترشکن خود را خاموش کنید. 
                      {country && country !== 'IR' && (
                        <span className="block mt-1">
                          موقعیت فعلی شما: <span className="font-semibold">{country}</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      To purchase and use our services, please turn off your VPN. 
                      {country && country !== 'IR' && (
                        <span className="block mt-1">
                          Your current location: <span className="font-semibold">{country}</span>
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-white/80 text-xs">
                <Globe className="size-3" />
                <span>{isRTL ? 'ایران' : 'Iran'}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRecheck}
                disabled={isRechecking}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg backdrop-blur-sm transition-colors text-white text-xs font-medium"
              >
                {isRechecking ? (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="animate-spin size-3" />
                    <span>{isRTL ? 'در حال بررسی...' : 'Checking...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="size-3" />
                    <span>{isRTL ? 'بررسی مجدد' : 'Check Again'}</span>
                  </div>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                aria-label={isRTL ? 'بستن' : 'Close'}
              >
                <X className="size-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Animated border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-40">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="h-full w-1/4 bg-white"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

import React from 'react'
import { X, Crown, Zap, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  modelName?: string
  mode?: 'text' | 'image'
}

export function PremiumUpgradeModal({ isOpen, onClose, modelName, mode = 'text' }: PremiumUpgradeModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  const features = mode === 'image' ? [
    {
      icon: <Crown className="w-5 h-5 text-yellow-100" />,
      title: 'مدل‌های تولید تصویر پیشرفته',
      description: 'دسترسی به بهترین مدل‌های هوش مصنوعی برای تولید تصویر'
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-100" />,
      title: 'کیفیت بالاتر',
      description: 'تولید تصاویر با کیفیت 4K و جزئیات فوق‌العاده'
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-100" />,
      title: 'سبک‌های متنوع',
      description: 'دسترسی به طیف وسیعی از سبک‌های هنری و تکنیک‌ها'
    }
  ] : [
    {
      icon: <Crown className="w-5 h-5 text-yellow-100" />,
      title: 'دسترسی به مدل‌های پیشرفته',
      description: 'استفاده از پیشرفته‌ترین مدل‌های هوش مصنوعی'
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-100" />,
      title: 'سرعت بالاتر',
      description: 'پاسخ‌های سریع‌تر و اولویت در پردازش'
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-100" />,
      title: 'امکانات ویژه',
      description: 'دسترسی به ابزارهای حرفه‌ای و پیشرفته'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
             style={{ 
               position: 'fixed',
               top: 0,
               left: 0,
               right: mode === 'image' ? 0 : (window.innerWidth < 768 ? -100 : -200),
               bottom: 0,
               width: '100vw',
               height: '100vh'
             }}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: mode === 'image' ? 0 : (window.innerWidth < 768 ? -100 : -200),
               bottom: 0,
               width: '100vw',
               height: '100vh'
             }}
          >
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-auto"
              style={{
                maxWidth: 'min(400px, calc(100vw - 2rem))',
                minWidth: '300px'
              }}>
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <Crown className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {mode === 'image' ? 'ارتقا برای تولید تصویر پیشرفته' : 'ارتقا به نسخه پیشرفته'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mode === 'image' ? 'برای استفاده از مدل‌های تولید تصویر پیشرفته' : 'برای استفاده از این قابلیت'}
                    </p>
                  </div>
                </div>
                
                {modelName && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {mode === 'image' 
                        ? `برای استفاده از مدل تولید تصویر ${modelName} نیاز به اشتراک پیشرفته دارید.`
                        : `برای استفاده از مدل ${modelName} نیاز به اشتراک پیشرفته دارید.`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="px-6 pb-4">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  ارتقا به پیشرفته
                </motion.button>
                
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors mt-2"
                >
                  بعداً
                </button>
              </div>

              {/* Close Icon */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

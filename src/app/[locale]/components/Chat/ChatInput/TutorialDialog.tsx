'use client';

import React from 'react';
import { X, Zap, Globe, Lightbulb, Sparkles, Clock, DollarSign } from 'lucide-react';
import { Button } from '../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'reasoning' | 'webSearch';
}

function TutorialDialog({ isOpen, onClose, type }: TutorialDialogProps) {
  const content = {
    reasoning: {
      title: 'قابلیت استدلال',
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      description: 'با فعال کردن این قابلیت، هوش مصنوعی مراحل تفکر و استدلال خود را قبل از ارائه پاسخ نهایی نمایش می‌دهد.',
      benefits: [
        'درک بهتر فرآیند تصمیم‌گیری AI',
        'شفافیت بیشتر در پاسخ‌ها',
        'امکان بررسی منطق استدلال',
        'یادگیری بهتر از طریق مشاهده تفکر'
      ],
      example: 'مثال: "ابتدا باید مفهوم را بررسی کنم... سپس به تحلیل می‌پردازم... در نهایت نتیجه گیری می‌کنم"',
      costNote: 'توجه: استفاده از این قابلیت باعث افزایش هزینه و زمان پاسخ‌دهی می‌شود.'
    },
    webSearch: {
      title: 'جست‌وجو در وب',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      description: 'با فعال کردن این قابلیت، هوش مصنوعی اطلاعات به‌روز را از اینترنت جست‌جو کرده و در پاسخ خود استفاده می‌کند.',
      benefits: [
        'دسترسی به اطلاعات به‌روز',
        'پاسخ‌های دقیق‌تر و معتبرتر',
        'اطلاعات اخیر و رویدادهای جاری',
        'منابع قابل اعتماد و تأیید شده'
      ],
      example: 'مثال: "بر اساس آخرین اخبار... طبق آمار منتشر شده... براساس منابع معتبر"',
      costNote: 'توجه: استفاده از این قابلیت باعث افزایش هزینه و زمان پاسخ‌دهی می‌شود.'
    }
  };

  const currentContent = content[type];

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
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md  bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    {currentContent.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {currentContent.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      قابلیت جدید
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentContent.description}
                </p>
              </div>

              {/* Benefits */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    مزایای استفاده:
                  </span>
                </div>
                <ul className="space-y-2">
                  {currentContent.benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Example */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    نمونه:
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 italic">
                  {currentContent.example}
                </div>
              </div>

              {/* Cost Warning */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <DollarSign className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    نکته مهم:
                  </span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300">
                  {currentContent.costNote}
                </div>
              </div>

              {/* Close Button */}
              <div className="px-6 pb-6">
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  متوجه شدم
                </Button>
              </div>

              {/* Close Icon - Moved to left side */}
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
  );
}

export default TutorialDialog; 
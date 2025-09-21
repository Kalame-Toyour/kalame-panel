import React from 'react';
import { X, Crown, Zap, Star } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName?: string;
  mode?: 'text' | 'image';
}

export function PremiumUpgradeModal({ isOpen, onClose, modelName, mode = 'text' }: PremiumUpgradeModalProps) {
  const { navigate } = useRouter();

  const handleUpgrade = () => {
    onClose();
    navigate('pricing');
  };

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
  ];

  if (!isOpen) return null;


  const ModalContent = () => (
    <div className="relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{
        maxWidth: 'min(400px, calc(100vw - 2rem))',
        minWidth: '300px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'white',
        color: 'black',
        width: '100%',
        display: 'block'
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
          {features.map((feature) => (
            <div
              key={feature.title}
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
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <button
          onClick={handleUpgrade}
          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5" />
          ارتقا به پیشرفته
        </button>
        
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
  );

  // Simple modal without complex animations to avoid hook issues
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-md mx-auto"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}
      >
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <ModalContent />
        </div>
      </div>
    </div>
  );
}

'use client';

import { Crown, Sparkles, Zap, Star, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../components/ThemeToggle';

const features = [
  {
    icon: Zap,
    title: 'دسترسی نامحدود',
    description: 'استفاده بدون محدودیت از تمامی مدل‌های هوش مصنوعی'
  },
  {
    icon: Sparkles,
    title: 'پردازش سریع‌تر',
    description: 'اولویت بالا در پردازش درخواست‌ها'
  },
  {
    icon: Star,
    title: 'امکانات ویژه',
    description: 'دسترسی به جدیدترین مدل‌ها و قابلیت‌های پیشرفته'
  },
  {
    icon: Crown,
    title: 'پشتیبانی اختصاصی',
    description: 'پشتیبانی ۲۴ ساعته و مشاوره تخصصی'
  }
];

const plans = [
  {
    name: 'ماهانه',
    price: '۲۹۹,۰۰۰',
    period: 'ماه',
    description: 'برای کاربران فعال',
    popular: false
  },
  {
    name: 'سه‌ماهه',
    price: '۷۹۹,۰۰۰',
    period: '۳ ماه',
    description: 'محبوب‌ترین انتخاب',
    popular: true,
    discount: '۱۰٪ تخفیف'
  },
  {
    name: 'سالانه',
    price: '۲,۹۹۹,۰۰۰',
    period: 'سال',
    description: 'بهترین قیمت',
    popular: false,
    discount: '۱۵٪ تخفیف'
  }
];

export default function PremiumPage() {
  const router = useRouter();

  const handleSubscribe = (planName: string) => {
    // Handle subscription logic here
    console.log('Subscribing to:', planName);
    // You can redirect to payment gateway or show payment modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </button>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Crown className="size-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              کلمه پرمیوم
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            تجربه کاملی از هوش مصنوعی با امکانات حرفه‌ای و دسترسی نامحدود
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 w-fit mb-4">
                <feature.icon className="size-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            پلان‌های اشتراک
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all ${
                  plan.popular
                    ? 'border-amber-400 shadow-xl scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      محبوب‌ترین
                    </div>
                  </div>
                )}
                
                {plan.discount && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      {plan.discount}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {plan.description}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {plan.price}
                    <span className="text-lg text-gray-600 dark:text-gray-400"> تومان</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    هر {plan.period}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Check className="size-4 text-green-500" />
                    <span className="text-sm">دسترسی نامحدود</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Check className="size-4 text-green-500" />
                    <span className="text-sm">پردازش سریع</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Check className="size-4 text-green-500" />
                    <span className="text-sm">امکانات ویژه</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Check className="size-4 text-green-500" />
                    <span className="text-sm">پشتیبانی اختصاصی</span>
                  </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  انتخاب پلان
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ or additional info can be added here */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400">
            سوالی دارید؟ با{' '}
            <a href="mailto:support@kalame.chat" className="text-amber-500 hover:text-amber-600 font-medium">
              تیم پشتیبانی
            </a>{' '}
            در تماس باشید
          </p>
        </motion.div>
      </div>
    </div>
  );
}

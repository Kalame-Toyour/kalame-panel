'use client';

import { Check, Crown, Sparkles, Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

import LanguageSwitcherModal from '../components/LanguageSwitcher';

import { Tabs, TabsContent } from '../components/ui/tabs';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import PurchaseAuthNotification from '../components/PurchaseAuthNotification';


interface Package {
  ID: number
  code: number
  title: string
  price: number
  discount_percent: number
  short_desc: string
  description: string
  token_number: number
  status: string
  text_service_num: number
  image_service_num: number
  tts_service_num: number
  stt_service_num: number
}



interface FaqItem {
  ID: number
  title: string
  desc: string
  status: string
}

interface PackagesApiResponse {
  packages: Package[]
  faq: FaqItem[]
}

const features = [

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

export default function PricingPage() {
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const router = useRouter();
  const { user } = useAuth();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [packages, setPackages] = useState<Package[] | null>(null);

  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [showAuthNotification, setShowAuthNotification] = useState(false);

  useEffect(function fetchPackages() {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    fetch('/api/packages')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch packages');
        const data: PackagesApiResponse = await res.json();
        if (isMounted) {
          setPackages(data.packages);
          setFaq(data.faq);
        }
      })
      .catch(() => {
        if (isMounted) setHasError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthRedirect = () => {
    setShowAuthNotification(false);
    setTimeout(() => {
      router.push('/auth');
    }, 300);
  };

  const handleCloseNotification = () => {
    setShowAuthNotification(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mt-12 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowRight className="size-4" />
          {isRTL ? 'بازگشت' : 'Back'}
        </button>
      </div>

      <PurchaseAuthNotification 
        isVisible={showAuthNotification} 
        onClose={handleCloseNotification}
        onLogin={handleAuthRedirect}
      />

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
              {isRTL ? 'انتخاب پکیج' : 'Choose Your Plan'}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {isRTL 
              ? 'تجربه کاملی از هوش مصنوعی با امکانات حرفه‌ای و دسترسی نامحدود'
              : 'Get the complete AI experience with professional features and unlimited access'
            }
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
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
            {isRTL ? 'پلان‌های اشتراک' : 'Subscription Plans'}
          </h2>

          <Tabs defaultValue="monthly" className="w-full">
            {/* <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">{isRTL ? 'ماهانه' : 'Monthly'}</TabsTrigger>
              <TabsTrigger value="yearly">{isRTL ? 'سالانه (۲۰٪ تخفیف)' : 'Yearly (Save 20%)'}</TabsTrigger>
            </TabsList> */}

            <TabsContent value="monthly" className="space-y-4">
              <div dir='rtl' className="grid md:grid-cols-2  gap-6">
                {isLoading && (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <PricingCardSkeleton key={i} />
                    ))}
                  </>
                )}
                {!isLoading && !hasError && packages && packages.map((pkg, idx) => (
                  <motion.div
                    key={pkg.ID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * idx }}
                    whileHover={{ y: -5 }}
                    className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all ${
                      idx === 1
                        ? 'border-amber-400 shadow-xl scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {idx === 1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          {isRTL ? 'محبوب‌ترین' : 'Most Popular'}
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {pkg.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {pkg.short_desc}
                      </p>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {pkg.price.toLocaleString('fa-IR')}
                        <span className="text-lg text-gray-600 dark:text-gray-400"> تومان</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {pkg.token_number.toLocaleString('fa-IR')} {isRTL ? 'توکن' : 'tokens'}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {pkg.description.split('\n').filter(Boolean).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Check className="size-4 text-green-500" />
                          <span className="text-sm text-right">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        // Check if user is logged in
                        if (!user) {
                          setShowAuthNotification(true);
                          return;
                        }
                        
                        setBuyingId(pkg.ID)
                        try {
                          const res = await fetch('/api/payment-request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ packageID: pkg.ID })
                          })
                          const data = await res.json()
                          if (res.ok && data.payment) {
                            window.location.href = data.payment
                          } else {
                            toast.error(data.error || 'خطا در دریافت لینک پرداخت')
                          }
                        } catch {
                          toast.error('خطا در ارتباط با سرور پرداخت')
                        } finally {
                          setBuyingId(null)
                        }
                      }}
                      disabled={buyingId === pkg.ID}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        idx === 1
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {buyingId === pkg.ID ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          <span>{isRTL ? 'در حال انتقال به درگاه...' : 'Redirecting to payment...'}</span>
                        </div>
                      ) : (
                        isRTL ? 'خرید این پکیج' : 'Buy this package'
                      )}
                    </motion.button>
                  </motion.div>
                ))}
                {!isLoading && hasError && (
                  <div className="col-span-2 text-center text-red-500 py-8">
                    {isRTL ? 'خطا در دریافت اطلاعات پکیج‌ها' : 'Failed to load packages.'}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4">
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {isRTL ? 'پلان سالانه به زودی اضافه خواهد شد' : 'Yearly plans coming soon'}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>



        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-center mt-4 mb-8 text-gray-900 dark:text-white">
            {isRTL ? 'سوالات متداول' : 'Frequently Asked Questions'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading && (
              <>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-32" />
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-32" />
              </>
            )}
            {!isLoading && !hasError && faq && faq.filter(f => f.status === 'Active').map((item) => (
              <div key={item.ID} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
            {!isLoading && hasError && (
              <div className="col-span-2 text-center text-red-500 py-8">
                {isRTL ? 'خطا در دریافت سوالات متداول' : 'Failed to load FAQ.'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'سوالی دارید؟ با ' : 'Still have questions? Contact our '}
            <a 
              href="https://t.me/Kalame_support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-600 font-medium"
            >
              {isRTL ? 'تیم پشتیبانی' : 'support team'}
            </a>
            {isRTL ? ' در تماس باشید' : ' for more information'}
          </p>
        </motion.div>
      </div>
      
      <LanguageSwitcherModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isCollapsed={false}
      />
    </div>
  );
}

function PricingCardSkeleton() {
  return (
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="text-center mb-6">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
      </div>
      <div className="text-center mb-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
      <div className="space-y-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
        ))}
      </div>
      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl" />
    </div>
  )
}

'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Skeleton } from '../components/ui/skeleton';
import LanguageSwitcherModal from '../components/LanguageSwitcher';
import { AnimatedBackground } from '../components/Layout/AnimatedBackground';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent } from '../components/ui/tabs';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast'

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

interface UsageHelp {
  ID: number
  packages_id: number
  title: string
  usage: number
}

interface FaqItem {
  ID: number
  title: string
  desc: string
  status: string
}

interface PackagesApiResponse {
  packages: Package[]
  usageHelp: UsageHelp[]
  faq: FaqItem[]
}

export default function PricingPage() {
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [usageHelp, setUsageHelp] = useState<UsageHelp[] | null>(null);
  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
          setUsageHelp(data.usageHelp);
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

  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col overflow-visible min-h-full"
  >
    <div
      className={`custom-scrollbar flex min-h-screen flex-col overflow-y-auto ${
        isRTL ? 'font-iran-sans' : 'font-poppins'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatedBackground />

      <main className="mainbg relative grow px-2 dark:bg-gray-900 md:px-36 md:pt-10">
        <div className="container flex flex-col items-center">
          <h1
            className={`mb-10 bg-gradient-to-l from-amber-500 to-pink-600 bg-clip-text text-center text-4xl font-bold text-transparent dark:from-amber-400 dark:to-pink-500 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'انتخاب پکیج' : 'Choose Your Plan'}
          </h1>
          {/* <p
            className={`mb-8 text-center text-lg text-gray-600 dark:text-gray-300 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'با گزینه‌های قیمت‌گذاری مبتنی بر توکن ما شروع کنید' : 'Get started with our flexible token-based pricing options'}
          </p> */}

          <Tabs defaultValue="monthly" className="w-full">
            {/* <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">{isRTL ? 'ماهانه' : 'Monthly'}</TabsTrigger>
              <TabsTrigger value="yearly">{isRTL ? 'سالانه (۲۰٪ تخفیف)' : 'Yearly (Save 20%)'}</TabsTrigger>
            </TabsList> */}

            <TabsContent value="monthly" className="space-y-4">
              <div className="mt-2 grid gap-8 md:grid-cols-2">
                {isLoading && (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <PricingCardSkeleton key={i} />
                    ))}
                  </>
                )}
                {!isLoading && !hasError && packages && packages.map((pkg, idx) => (
                  <PricingCard
                    key={pkg.ID}
                    index={idx}
                    title={pkg.title}
                    price={pkg.price.toLocaleString('fa-IR') + ' تومان'}
                    description={pkg.short_desc}
                    features={pkg.description.split('\n').filter(Boolean)}
                    tokenInfo={{ monthly: pkg.token_number }}
                    buttonText={isRTL ? 'خرید این پکیج' : 'Buy this package'}
                    buttonVariant="default"
                  />
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
                <PricingCard
                  title="Free"
                  price="$0"
                  description="Perfect for getting started"
                  features={[
                    '25 Daily Tokens',
                    '750 Monthly Tokens',
                    'Basic AI Chat Assistant',
                    'Market Analysis',
                    'Portfolio Tracking',
                    'Email Support',
                  ]}
                  tokenInfo={{ monthly: 750 }}
                  buttonText="Get Started"
                  buttonVariant="outline"
                />
                <PricingCard
                  title="Pro"
                  price="$191.90"
                  description="For serious crypto traders"
                  features={[
                    '100 Daily Tokens',
                    '3000 Monthly Tokens',
                    'Advanced AI Trading Assistant',
                    'Real-time Market Alerts',
                    'Priority Support',
                    'Custom Trading Strategies',
                    'Portfolio Analytics',
                    'API Access',
                  ]}
                  tokenInfo={{ monthly: 3000 }}
                  buttonText="Upgrade to Pro"
                  buttonVariant="default"
                />
                <PricingCard
                  title="Enterprise"
                  price="$479.90"
                  description="For professional trading teams"
                  features={[
                    'Unlimited Daily Tokens',
                    '10000 Monthly Tokens',
                    'Everything in Pro',
                    'Custom AI Model Training',
                    'Dedicated Account Manager',
                    'Custom API Integration',
                    'Team Collaboration Tools',
                    'Advanced Analytics Dashboard',
                  ]}
                  tokenInfo={{ monthly: 10000 }}
                  buttonText="Contact Sales"
                  buttonVariant="default"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Token Usage Information */}
        <div className="mx-auto max-w-4xl pb-12 pt-8">
          <h2
            className={`mb-6 text-center text-2xl font-bold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
          >
            {isRTL ? 'راهنمای مصرف توکن' : 'Token Usage Guide'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading && (
              <>
                <Card className="p-6 animate-pulse h-40" />
                <Card className="p-6 animate-pulse h-40" />
              </>
            )}
            {!isLoading && !hasError && usageHelp && packages && (
              packages.map((pkg) => (
                <Card key={pkg.ID} className="p-6">
                  <h3 className={`mb-4 text-xl font-semibold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{pkg.title}</h3>
                  <ul className="space-y-2">
                    {usageHelp.filter(u => u.packages_id === pkg.ID).map((u) => (
                      <li key={u.ID} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                         <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{u.usage} {isRTL ? 'توکن' : 'tokens'}</span>
                        <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{u.title}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))
            )}
            {!isLoading && hasError && (
              <div className="col-span-2 text-center text-red-500 py-8">
                {isRTL ? 'خطا در دریافت اطلاعات راهنمای مصرف' : 'Failed to load usage help.'}
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl pb-12">
          <h2
            className={`mb-6 text-center text-2xl font-bold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
          >
            {isRTL ? 'سوالات متداول' : 'Frequently Asked Questions'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading && (
              <>
                <Card className="p-6 animate-pulse h-32" />
                <Card className="p-6 animate-pulse h-32" />
              </>
            )}
            {!isLoading && !hasError && faq && faq.filter(f => f.status === 'Active').map((item) => (
              <Card key={item.ID} className="p-6">
                <h4 className={`mb-4 font-semibold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{item.title}</h4>
                <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'font-iran-sans text-right' : 'font-poppins'}`}>{item.desc}</p>
              </Card>
            ))}
            {!isLoading && hasError && (
              <div className="col-span-2 text-center text-red-500 py-8">
                {isRTL ? 'خطا در دریافت سوالات متداول' : 'Failed to load FAQ.'}
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mx-auto max-w-4xl pb-20 text-center">
          <h3
            className={`mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
          >
            {isRTL ? 'سوالی دارید؟' : 'Still have questions?'}
          </h3>
          <p
            className={`mb-6 text-gray-600 dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
          >
            {isRTL
              ? 'برای اطلاعات بیشتر درباره پلن‌ها و امکانات با تیم پشتیبانی ما تماس بگیرید.'
              : 'Contact our support team for more information about our plans and features.'}
          </p>
          <a
            href="https://t.me/Kalame_support"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 dark:from-blue-700 dark:to-blue-900 dark:hover:from-blue-800 dark:hover:to-blue-950 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
          >
            {isRTL ? 'تماس با پشتیبانی' : 'Contact Support'}
          </a>
        </div>
      </main>
      <LanguageSwitcherModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isCollapsed={false}
      />
    </div>
    </motion.div>
  );
}

interface PricingCardProps {
  index?: number
  title: string
  price: string
  description: string
  features: string[]
  tokenInfo: { monthly: number }
  buttonText: string
  buttonVariant: 'outline' | 'default'
}

function PricingCard({
  index = 0,
  title,
  price,
  description,
  features,
  tokenInfo,
  buttonText,
  buttonVariant,
}: PricingCardProps) {
  const locale = useLocale()
  const isRTL = locale === 'fa'
  // Card emoji: first card ⚡, second card 🔥
  const emoji = index === 1 ? '🔥' : '⚡'

  const getLocalizedTitle = (title: string) => {
    switch (title) {
      case 'Free':
        return isRTL ? 'رایگان' : 'Free'
      case 'Pro':
        return isRTL ? 'حرفه‌ای' : 'Pro'
      case 'Enterprise':
        return isRTL ? 'سازمانی' : 'Enterprise'
      default:
        return title
    }
  }

  function handleBuyClick() {
    toast(isRTL ? 'برای خرید پکیج به پشتیبانی پیام دهید.' : 'Please contact support to purchase a package.')
  }

  return (
    <Card
      className={`relative flex h-full flex-col justify-between p-2 md:p-8 border border-blue-200/40 dark:border-blue-900/40 shadow-xl bg-gradient-to-br from-blue-400/30 via-white/10 to-orange-400/30 dark:from-blue-900/60 dark:via-white/10 dark:to-orange-600/40 rounded-2xl transition-transform hover:scale-[1.02] hover:shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 glass-card ${isRTL ? 'text-right' : 'text-left'}`}
      style={{
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Badge/Emoji */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-orange-400 px-4 py-2 text-lg font-bold text-white shadow-lg border-4 border-white dark:border-gray-900">
          {emoji}
        </span>
      </div>
      <div className="mb-6 text-center mt-6">
        <h3 className={`mb-2 text-2xl font-extrabold tracking-tight dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{getLocalizedTitle(title)}</h3>
        <div className={`mb-2 text-3xl font-bold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{price}</div>
        <p className={`text-muted-foreground dark:text-gray-400 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{description}</p>
      </div>
      {/* Monthly Token Section - visually prominent */}
      <div className="mb-6 flex flex-col items-center justify-center">
        <span className="mb-1 text-sm font-medium text-blue-700 dark:text-orange-200 drop-shadow">{isRTL ? 'تعداد توکن ماهانه' : 'Monthly Tokens'}</span>
        <span className="rounded-xl bg-gradient-to-r from-blue-500 to-orange-400 px-8 py-4 text-3xl font-extrabold text-white shadow-lg border-2 border-white/40 dark:border-gray-900/40 glass-badge">
          {tokenInfo.monthly.toLocaleString(isRTL ? 'fa-IR' : 'en-US')}
        </span>
      </div>
      <ul className="mb-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>{feature}</span>
            <Check className="size-4 text-blue-500 dark:text-orange-400" />
          </li>
        ))}
      </ul>
      <Button
        variant={buttonVariant}
        className={`w-full mt-2 text-lg font-bold py-4 rounded-xl shadow-lg transition-all duration-200 border-0 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 dark:from-blue-700 dark:to-blue-900 dark:hover:from-blue-800 dark:hover:to-blue-950 text-white flex items-center justify-center gap-2 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
        onClick={handleBuyClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h8.04a2 2 0 001.83-1.3L17 13M7 13V6h13" /></svg>
        {buttonText}
      </Button>
    </Card>
  )
}

function PricingCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col justify-between p-6 border rounded-lg bg-white dark:bg-gray-900 shadow animate-pulse">
      <div className="mb-6 text-center">
        <Skeleton className="mx-auto mb-2 h-8 w-24" />
        <Skeleton className="mx-auto mb-2 h-10 w-32" />
        <Skeleton className="mx-auto h-4 w-40" />
      </div>
      <div className="mb-6 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
        <Skeleton className="mx-auto h-4 w-24" />
        <div className="mt-2 flex justify-around">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
      <ul className="mb-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-32 mx-auto" />
        ))}
      </ul>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

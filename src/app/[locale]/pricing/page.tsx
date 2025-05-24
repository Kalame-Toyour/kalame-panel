'use client';

import { Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import LanguageSwitcherModal from '../components/LanguageSwitcher';
import { AnimatedBackground } from '../components/Layout/AnimatedBackground';
import { Navigation } from '../components/Layout/Navigation';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function PricingPage() {
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  return (
    <div
      className={`custom-scrollbar flex min-h-screen flex-col ${
        isRTL ? 'font-iran-sans' : 'font-poppins'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatedBackground />
      <Navigation
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setIsLanguageModalOpen={setIsLanguageModalOpen}
      />
      <main className="mainbg relative grow px-4 dark:bg-gray-900 md:px-36 md:pt-16">
        <div className="container flex flex-col items-center py-20">
          <h1
            className={`mb-4 bg-gradient-to-l from-amber-500 to-pink-600 bg-clip-text text-center text-4xl font-bold text-transparent dark:from-amber-400 dark:to-pink-500 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'انتخاب پلن' : 'Choose Your Plan'}
          </h1>
          <p
            className={`mb-8 text-center text-lg text-gray-600 dark:text-gray-300 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'با گزینه‌های قیمت‌گذاری مبتنی بر توکن ما شروع کنید' : 'Get started with our flexible token-based pricing options'}
          </p>

          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">{isRTL ? 'ماهانه' : 'Monthly'}</TabsTrigger>
              <TabsTrigger value="yearly">{isRTL ? 'سالانه (۲۰٪ تخفیف)' : 'Yearly (Save 20%)'}</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <PricingCard
                  title="Free"
                  price="$0"
                  description={
                    isRTL
                      ? 'مناسب برای شروع'
                      : 'Perfect for getting started'
                  }
                  features={
                    isRTL
                      ? [
                          '۲۵ توکن روزانه',
                          '۷۵۰ توکن ماهانه',
                          'دستیار هوش مصنوعی پایه',
                          'تحلیل بازار',
                          'پیگیری سبد سرمایه',
                          'پشتیبانی ایمیل',
                        ]
                      : [
                          '25 Daily Tokens',
                          '750 Monthly Tokens',
                          'Basic AI Chat Assistant',
                          'Market Analysis',
                          'Portfolio Tracking',
                          'Email Support',
                        ]
                  }
                  tokenInfo={{
                    daily: 25,
                    monthly: 750,
                  }}
                  buttonText={
                    isRTL
                      ? 'شروع کنید'
                      : 'Get Started'
                  }
                  buttonVariant="outline"
                />
                <PricingCard
                  title="Pro"
                  price="$19.99"
                  period="/month"
                  description={
                    isRTL
                      ? 'برای معامله‌گران جدی ارز دیجیتال'
                      : 'For serious crypto traders'
                  }
                  features={
                    isRTL
                      ? [
                          '۱۰۰ توکن روزانه',
                          '۳۰۰۰ توکن ماهانه',
                          'دستیار معاملاتی هوشمند پیشرفته',
                          'هشدارهای بازار در لحظه',
                          'پشتیبانی ویژه',
                          'استراتژی‌های معاملاتی سفارشی',
                          'تحلیل سبد سرمایه',
                          'دسترسی API',
                        ]
                      : [
                          '100 Daily Tokens',
                          '3000 Monthly Tokens',
                          'Advanced AI Trading Assistant',
                          'Real-time Market Alerts',
                          'Priority Support',
                          'Custom Trading Strategies',
                          'Portfolio Analytics',
                          'API Access',
                        ]
                  }
                  tokenInfo={{
                    daily: 100,
                    monthly: 3000,
                  }}
                  buttonText={
                    isRTL
                      ? 'ارتقا به حرفه‌ای'
                      : 'Upgrade to Pro'
                  }
                  buttonVariant="default"
                  popular
                />
                <PricingCard
                  title="Enterprise"
                  price="$49.99"
                  period="/month"
                  description={
                    isRTL
                      ? 'برای تیم‌های معاملاتی حرفه‌ای'
                      : 'For professional trading teams'
                  }
                  features={
                    isRTL
                      ? [
                          'توکن روزانه نامحدود',
                          '۱۰۰۰۰ توکن ماهانه',
                          'تمام امکانات نسخه حرفه‌ای',
                          'آموزش مدل هوش مصنوعی سفارشی',
                          'مدیر اختصاصی حساب',
                          'یکپارچه‌سازی API سفارشی',
                          'ابزارهای همکاری تیمی',
                          'داشبورد تحلیلی پیشرفته',
                        ]
                      : [
                          'Unlimited Daily Tokens',
                          '10000 Monthly Tokens',
                          'Everything in Pro',
                          'Custom AI Model Training',
                          'Dedicated Account Manager',
                          'Custom API Integration',
                          'Team Collaboration Tools',
                          'Advanced Analytics Dashboard',
                        ]
                  }
                  tokenInfo={{
                    daily: 'Unlimited',
                    monthly: 10000,
                  }}
                  buttonText={
                    isRTL
                      ? 'تماس با فروش'
                      : 'Contact Sales'
                  }
                  buttonVariant="default"
                />
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
                  tokenInfo={{
                    daily: 25,
                    monthly: 750,
                  }}
                  buttonText="Get Started"
                  buttonVariant="outline"
                />
                <PricingCard
                  title="Pro"
                  price="$191.90"
                  period="/year"
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
                  tokenInfo={{
                    daily: 100,
                    monthly: 3000,
                  }}
                  buttonText="Upgrade to Pro"
                  buttonVariant="default"
                  popular
                />
                <PricingCard
                  title="Enterprise"
                  price="$479.90"
                  period="/year"
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
                  tokenInfo={{
                    daily: 'Unlimited',
                    monthly: 10000,
                  }}
                  buttonText="Contact Sales"
                  buttonVariant="default"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Token Usage Information */}
        <div className="mx-auto max-w-4xl pb-12">
          <h2
            className={`mb-6 text-center text-2xl font-bold dark:text-gray-100 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'راهنمای مصرف توکن' : 'Token Usage Guide'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3
                className={`mb-4 text-xl font-semibold dark:text-gray-100 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {isRTL ? 'امکانات پایه' : 'Basic Features'}
              </h3>
              <ul className="space-y-2">
                <li className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? 'تحلیل بازار' : 'Market Analysis'}
                  </span>
                  <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? '۵ توکن' : '5 tokens'}
                  </span>
                </li>
                <li className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? 'نمای کلی سبد سرمایه' : 'Portfolio Overview'}
                  </span>
                  <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? '۲ توکن' : '2 tokens'}
                  </span>
                </li>
                <li className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? 'چت پایه با هوش مصنوعی' : 'Basic Chat Query'}
                  </span>
                  <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? '۱ توکن' : '1 token'}
                  </span>
                </li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3
                className={`mb-4 text-xl font-semibold dark:text-gray-100 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {isRTL ? 'امکانات پیشرفته' : 'Advanced Features'}
              </h3>
              <ul className="space-y-2">
                <li className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? 'استراتژی معاملاتی سفارشی' : 'Custom Trading Strategy'}
                  </span>
                  <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? '۱۵ توکن' : '15 tokens'}
                  </span>
                </li>
                <li className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? 'تحلیل پیشرفته بازار' : 'Advanced Market Analysis'}
                  </span>
                  <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? '۱۰ توکن' : '10 tokens'}
                  </span>
                </li>
                <li className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`dark:text-gray-300 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? 'دستیار معاملاتی هوشمند' : 'AI Trading Assistant'}
                  </span>
                  <span className={`font-semibold text-blue-500 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                    {isRTL ? '۸ توکن' : '8 tokens'}
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl pb-12">
          <h2
            className={`mb-6 text-center text-2xl font-bold dark:text-gray-100 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'سوالات متداول' : 'Frequently Asked Questions'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h4 className={`mb-4 font-semibold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                {isRTL ? 'توکن‌ها چگونه کار می‌کنند؟' : 'How do tokens work?'}
              </h4>
              <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'font-iran-sans text-right' : 'font-poppins'}`}>
                {isRTL
                  ? 'توکن‌ها واحد مصرف خدمات ما هستند. هر عملیات تعداد مشخصی توکن مصرف می‌کند. توکن‌های مصرف نشده به ماه بعد منتقل نمی‌شوند.'
                  : 'Tokens are our platforms currency for AI operations. Each operation costs a specific number of tokens. Unused tokens do not roll over to the next month.'}
              </p>
            </Card>
            <Card className="p-6">
              <h4 className={`mb-4 font-semibold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                {isRTL ? 'آیا می‌توانم پلن خود را ارتقا دهم؟' : 'Can I upgrade my plan?'}
              </h4>
              <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'font-iran-sans text-right' : 'font-poppins'}`}>
                {isRTL
                  ? 'بله، شما می‌توانید در هر زمان پلن خود را ارتقا دهید. هزینه‌ها به صورت نسبی محاسبه می‌شوند.'
                  : 'Yes, you can upgrade your plan at any time. The pricing will be prorated based on your current billing cycle.'}
              </p>
            </Card>
            <Card className="p-6">
              <h4 className={`mb-4 font-semibold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                {isRTL ? 'آیا می‌توانم توکن اضافی بخرم؟' : 'Can I buy additional tokens?'}
              </h4>
              <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'font-iran-sans text-right' : 'font-poppins'}`}>
                {isRTL
                  ? 'بله، بسته‌های توکن اضافی در دسترس هستند. با تیم فروش ما تماس بگیرید.'
                  : 'Yes, additional token packages are available. Contact our sales team for more information.'}
              </p>
            </Card>
            <Card className="p-6">
              <h4 className={`mb-4 font-semibold dark:text-gray-100 ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}>
                {isRTL ? 'سیاست بازپرداخت چیست؟' : 'What is the refund policy?'}
              </h4>
              <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'font-iran-sans text-right' : 'font-poppins'}`}>
                {isRTL
                  ? 'ما ۱۴ روز ضمانت بازگشت وجه بدون قید و شرط ارائه می‌دهیم.'
                  : 'We offer a 14-day money-back guarantee with no questions asked.'}
              </p>
            </Card>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mx-auto max-w-4xl pb-20 text-center">
          <h3
            className={`mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'سوالی دارید؟' : 'Still have questions?'}
          </h3>
          <p
            className={`mb-6 text-gray-600 dark:text-gray-300 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL
              ? 'برای اطلاعات بیشتر درباره پلن‌ها و امکانات با تیم پشتیبانی ما تماس بگیرید.'
              : 'Contact our support team for more information about our plans and features.'}
          </p>
          <Button
            variant="default"
            className={`bg-blue-500 px-8 py-6 text-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'تماس با پشتیبانی' : 'Contact Support'}
          </Button>
        </div>
      </main>
      <LanguageSwitcherModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isCollapsed={false}
      />
    </div>
  );
}

type TokenInfo = {
  daily: number | string;
  monthly: number;
};

type PricingCardProps = {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  tokenInfo: TokenInfo;
  buttonText: string;
  buttonVariant: 'outline' | 'default';
  popular?: boolean;
};

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  tokenInfo,
  buttonText,
  buttonVariant,
  popular,
}: PricingCardProps) {
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const emoji = title === 'Free' ? '🌱' : title === 'Pro' ? '🔥' : '⚡';

  const getLocalizedTitle = (title: string) => {
    switch (title) {
      case 'Free':
        return isRTL ? 'رایگان' : 'Free';
      case 'Pro':
        return isRTL ? 'حرفه‌ای' : 'Pro';
      case 'Enterprise':
        return isRTL ? 'سازمانی' : 'Enterprise';
      default:
        return title;
    }
  };

  const getLocalizedPeriod = (period?: string) => {
    if (!period) {
      return '';
    }
    if (period === '/month') {
      return isRTL ? '/ماه' : '/month';
    }
    if (period === '/year') {
      return isRTL ? '/سال' : '/year';
    }
    return period;
  };

  return (
    <Card
      className={`relative flex h-full flex-col justify-between p-6 ${
        popular ? 'border-primary shadow-lg dark:border-blue-500' : ''
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-sm font-medium text-white shadow-lg dark:from-blue-600 dark:to-blue-700 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'محبوب‌ترین 🌟' : 'Most Popular 🌟'}
          </span>
        </div>
      )}
      <div>
        <div className="mb-6 text-center">
          <h3
            className={`mb-2 flex items-center justify-center gap-2 text-2xl font-bold dark:text-gray-100 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            <span>{emoji}</span>
            <span>{getLocalizedTitle(title)}</span>
          </h3>
          <div
            className={`mb-2 text-3xl font-bold dark:text-gray-100 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? `${price.replace('$', '')} دلار` : price}
            <span className={`text-base font-normal text-muted-foreground dark:text-gray-400 ${
              isRTL ? 'font-iran-sans mr-1' : 'font-poppins ml-1'
            }`}
            >
              {getLocalizedPeriod(period)}
            </span>
          </div>
          <p
            className={`text-muted-foreground dark:text-gray-400 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {description}
          </p>
        </div>
        <div className="mb-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-gray-800 dark:to-gray-700">
          <p
            className={`text-center text-sm font-medium text-gray-600 dark:text-gray-300 ${
              isRTL ? 'font-iran-sans' : 'font-poppins'
            }`}
          >
            {isRTL ? 'میزان توکن ✨' : 'Token Allowance ✨'}
          </p>
          <div className="mt-2 flex justify-around">
            <div className="text-center">
              <p
                className={`text-2xl font-bold text-blue-500 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {typeof tokenInfo.daily === 'number' ? tokenInfo.daily.toLocaleString(isRTL ? 'fa-IR' : 'en-US') : tokenInfo.daily}
              </p>
              <p
                className={`text-xs text-gray-500 dark:text-gray-400 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {isRTL ? 'روزانه 📅' : 'Daily 📅'}
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-bold text-blue-500 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {tokenInfo.monthly.toLocaleString(isRTL ? 'fa-IR' : 'en-US')}
              </p>
              <p
                className={`text-xs text-gray-500 dark:text-gray-400 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {isRTL ? 'ماهانه 📆' : 'Monthly 📆'}
              </p>
            </div>
          </div>
        </div>
        <ul className="mb-6 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Check className="size-4 text-blue-500 dark:text-blue-400" />
              <span
                className={`dark:text-gray-300 ${
                  isRTL ? 'font-iran-sans' : 'font-poppins'
                }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant={buttonVariant}
        className={`w-full ${
          buttonVariant === 'default'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800'
            : 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-800'
        } ${isRTL ? 'font-iran-sans' : 'font-poppins'}`}
      >
        {buttonText}
      </Button>
    </Card>
  );
}

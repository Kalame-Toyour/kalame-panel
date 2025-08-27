import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Star, Zap, Crown, Loader2 } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

interface Package {
  ID: number;
  code: number;
  title: string;
  price: number;
  discount_percent: number;
  short_desc: string;
  description: string;
  token_number: number;
  status: string;
  text_service_num: number;
  image_service_num: number;
  tts_service_num: number;
  stt_service_num: number;
}

interface UsageHelp {
  ID: number;
  packages_id: number;
  title: string;
  usage: number;
}

interface FaqItem {
  ID: number;
  title: string;
  desc: string;
  status: string;
}

interface PackagesApiResponse {
  packages: Package[];
  usageHelp: UsageHelp[];
  faq: FaqItem[];
}

export default function PricingPage() {
  const { goBack } = useRouter();
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [usageHelp, setUsageHelp] = useState<UsageHelp[] | null>(null);
  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPackages = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        console.log('📦 Fetching packages from API...');
        const response = await api.get('/packages');
        
        // Type guard to check if response has the expected structure
        if (isMounted && response && typeof response === 'object' && 'packages' in response) {
          const data = response as unknown as PackagesApiResponse;
          console.log('✅ Packages fetched successfully:', data);
          setPackages(data.packages);
          setUsageHelp(data.usageHelp);
          setFaq(data.faq);
        } else {
          console.error('❌ Invalid response structure:', response);
          if (isMounted) {
            setHasError(true);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching packages:', error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBuyPackage = async (packageId: number) => {
    if (!isAuthenticated) {
      // Redirect to auth page or show auth notification
      console.log('User not authenticated, redirecting to auth...');
      // You can implement auth redirect logic here
      return;
    }

    setBuyingId(packageId);
    try {
      console.log('💳 Initiating payment for package:', packageId);
      const response = await api.requestPayment(packageId, user!.accessToken);
      
      if (response.payment) {
        console.log('✅ Payment link received, redirecting...');
        window.location.href = response.payment;
      } else {
        console.error('❌ Payment request failed:', response);
        alert(response.error || 'خطا در دریافت لینک پرداخت');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('خطا در ارتباط با سرور پرداخت');
    } finally {
      setBuyingId(null);
    }
  };

  const getPackageIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Zap className="w-6 h-6" />;
      case 1:
        return <Star className="w-6 h-6" />;
      case 2:
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPackageEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '⚡';
      case 1:
        return '🔥';
      case 2:
        return '👑';
      default:
        return '⚡';
    }
  };

  if (isLoading) {
    return (
      <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header - Fixed */}
        <div className={`flex items-center p-4 border-b ${isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md flex-shrink-0`}>
          <button
            onClick={goBack}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowRight size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
            بسته‌های اشتراک
          </h1>
        </div>

        {/* Loading Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-8">
              <div className={`w-32 h-8 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse mx-auto mb-4`} />
              <div className={`w-64 h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse mx-auto`} />
            </div>

            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg animate-pulse`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <div className="space-y-2">
                        <div className={`w-24 h-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <div className={`w-32 h-8 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className={`flex items-center gap-3`}>
                        <div className={`w-5 h-5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <div className={`w-48 h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      </div>
                    ))}
                  </div>
                  <div className={`w-full h-12 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header - Fixed */}
        <div className={`flex items-center p-4 border-b ${isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md flex-shrink-0`}>
          <button
            onClick={goBack}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowRight size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
            بسته‌های اشتراک
          </h1>
        </div>

        {/* Error Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className={`w-16 h-16 mx-auto rounded-full ${isDark ? 'bg-red-900/20' : 'bg-red-100'} flex items-center justify-center`}>
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              خطا در دریافت اطلاعات
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              متأسفانه در دریافت اطلاعات بسته‌ها مشکلی پیش آمده است.
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`px-6 py-3 rounded-lg font-semibold ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header - Fixed */}
      <div className={`flex items-center p-4 border-b ${isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md flex-shrink-0`}>
        <button
          onClick={goBack}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowRight size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          بسته‌های اشتراک
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              بسته مناسب خود را انتخاب کنید
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              با انتخاب بسته مناسب، از تمام امکانات کلمه بهره‌مند شوید
            </p>
          </div>

          {/* Packages */}
          <div className="space-y-6">
            {packages && packages.map((pkg, index) => (
              <div
                key={pkg.ID}
                className={`relative rounded-2xl p-6 transition-all duration-300 ${
                  index === 1
                    ? `bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl scale-105`
                    : `${isDark ? 'bg-gray-800' : 'bg-white'} text-gray-900 dark:text-gray-100 shadow-lg hover:shadow-xl`
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                      محبوب
                    </span>
                  </div>
                )}

                {/* Package Badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <span className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-lg font-bold text-white shadow-lg border-4 ${
                    index === 1 ? 'bg-gradient-to-r from-blue-500 to-orange-400 border-white' : 
                    `${isDark ? 'bg-gradient-to-r from-blue-500 to-orange-400 border-gray-900' : 'bg-gradient-to-r from-blue-500 to-orange-400 border-white'}`
                  }`}>
                    {getPackageEmoji(index)}
                  </span>
                </div>

                <div className="mb-6 text-center mt-6">
                  <h3 className="text-2xl font-extrabold tracking-tight mb-2">{pkg.title}</h3>
                  <div className="mb-2 text-3xl font-bold">
                    {pkg.price.toLocaleString('fa-IR')} تومان
                  </div>
                  <p className={`text-sm ${index === 1 ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {pkg.short_desc}
                  </p>
                </div>

                {/* Token Info */}
                <div className="mb-6 flex flex-col items-center justify-center">
                  <span className={`mb-1 text-sm font-medium ${index === 1 ? 'text-white/80' : isDark ? 'text-orange-200' : 'text-blue-700'}`}>
                    تعداد توکن ماهانه
                  </span>
                  <span className={`rounded-xl px-8 py-4 text-3xl font-extrabold text-white shadow-lg border-2 ${
                    index === 1 ? 'bg-gradient-to-r from-blue-500 to-orange-400 border-white/40' :
                    `${isDark ? 'bg-gradient-to-r from-blue-500 to-orange-400 border-gray-900/40' : 'bg-gradient-to-r from-blue-500 to-orange-400 border-white/40'}`
                  }`}>
                    {pkg.token_number.toLocaleString('fa-IR')}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.description.split('\n').filter(Boolean).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${index === 1 ? 'text-white' : 'text-green-500'}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyPackage(pkg.ID)}
                  disabled={buyingId === pkg.ID}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    index === 1
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`
                  } ${buyingId === pkg.ID ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {buyingId === pkg.ID ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال انتقال به درگاه...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h8.04a2 2 0 001.83-1.3L17 13M7 13V6h13" />
                      </svg>
                      {pkg.price === 0 ? 'شروع رایگان' : 'انتخاب بسته'}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          {faq && faq.filter(f => f.status === 'Active').length > 0 && (
            <div className="mt-12">
              <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                سوالات متداول
              </h3>
              <div className="space-y-4">
                {faq.filter(f => f.status === 'Active').map((item) => (
                  <div key={item.ID} className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              سوال دیگری دارید؟
            </p>
            <a
              href="https://t.me/Kalame_support"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-6 py-3 rounded-lg font-semibold ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              تماس با پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
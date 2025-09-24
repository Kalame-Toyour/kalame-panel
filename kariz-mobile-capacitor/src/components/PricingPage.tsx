import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { useRouter } from '../contexts/RouterContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useUserInfoContext } from '../contexts/UserInfoContext';
import { api } from '../utils/api';
import { useToast } from './ui/Toast';
import IPWarningBanner from './IPWarningBanner';
import PurchaseAuthNotification from './PurchaseAuthNotification';
import { checkUserLocationComprehensive } from '../services/ipService';

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
  package_name: string;
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
  const { localUserInfo, refreshUserInfo } = useUserInfoContext();
  const { showToast } = useToast();
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [, setUsageHelp] = useState<UsageHelp[] | null>(null);
  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [showIPWarning, setShowIPWarning] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('');
  const [isRecheckingIP, setIsRecheckingIP] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountId, setDiscountId] = useState<number | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Check if user is premium
  const isPremiumUser = localUserInfo?.userType === 'premium';

  // Enhanced dark mode detection with fallback
  const [systemDarkMode, setSystemDarkMode] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDarkMode(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDarkMode(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Use isDark from context, fallback to system preference
  const effectiveIsDark = isDark || systemDarkMode;

  // Debug dark mode detection
  useEffect(() => {
    console.log('🌙 PricingPage Dark Mode Debug:', {
      isDark,
      systemDarkMode,
      systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });
  }, [isDark, systemDarkMode, effectiveIsDark]);

  // Function to determine active package based on user type
  const getActivePackage = () => {
    if (!packages) return null;
    
    if (localUserInfo?.userType === 'premium') {
      return packages.find(pkg => pkg.package_name === 'premium');
    } else {
      return packages.find(pkg => pkg.package_name === 'free');
    }
  };

  // Function to check if a package is the user's active package
  const isActivePackage = (pkg: Package) => {
    const activePackage = getActivePackage();
    return activePackage?.ID === pkg.ID;
  };

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

  // IP Checking Effect
  useEffect(() => {
    let isMounted = true;
    
    async function performIPCheck() {
      try {
        console.log('Starting comprehensive IP check...');
        const result = await checkUserLocationComprehensive();
        
        console.log('IP check result:', result);
        
        if (isMounted) {
          setUserCountry(result.country || '');
          if (!result.isFromIran) {
            console.log('User not from Iran, showing warning');
            setShowIPWarning(true);
          } else {
            console.log('User confirmed from Iran');
          }
        }
      } catch (error) {
        console.error('IP check failed:', error);
        // Don't show warning if we can't check IP to avoid blocking legitimate users
      }
    }
    
    performIPCheck();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle app state changes for user info refresh when returning from payment
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      const handleAppStateChange = async () => {
        console.log('[PricingPage] App became active, refreshing user info...');
        try {
          // Check if user was on payment page (stored in sessionStorage)
          const wasOnPayment = sessionStorage.getItem('kariz_was_on_payment');
          if (wasOnPayment === 'true') {
            console.log('[PricingPage] User returned from payment, showing success message');
            setShowPaymentSuccess(true);
            sessionStorage.removeItem('kariz_was_on_payment');
            
            // Hide success message after 5 seconds
            setTimeout(() => {
              setShowPaymentSuccess(false);
            }, 5000);
          }
          
          // Refresh user info when app becomes active (e.g., returning from payment)
          await refreshUserInfo();
          console.log('[PricingPage] User info refreshed successfully');
        } catch (error) {
          console.error('[PricingPage] Error refreshing user info on app state change:', error);
        }
      };

      // Listen for app state changes
      CapacitorApp.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
        if (isActive) {
          handleAppStateChange();
        }
      });

      return () => {
        CapacitorApp.removeAllListeners();
      };
    }
  }, [refreshUserInfo]);

  const handleAuthRedirect = () => {
    setShowAuthNotification(false);
    // Navigate to auth page - you may need to adjust this based on your routing setup
    goBack(); // or navigate to auth page
  };

  const handleCloseNotification = () => {
    setShowAuthNotification(false);
  };

  const handleCloseIPWarning = () => {
    setShowIPWarning(false);
  };

  const handleRecheckIP = async () => {
    setIsRecheckingIP(true);
    try {
      console.log('Starting IP recheck...');
      const result = await checkUserLocationComprehensive();
      
      console.log('IP recheck result:', result);
      
      setUserCountry(result.country || '');
      if (result.isFromIran) {
        setShowIPWarning(false);
        showToast('موقعیت شما تأیید شد! حالا می‌توانید خرید کنید.', 'success');
      } else {
        showToast('هنوز از ایران دسترسی ندارید. لطفاً فیلترشکن را خاموش کنید.', 'error');
      }
    } catch (error) {
      console.error('IP recheck failed:', error);
      showToast('خطا در بررسی موقعیت', 'error');
    } finally {
      setIsRecheckingIP(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      showToast('لطفاً کد تخفیف را وارد کنید', 'error');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthNotification(true);
      return;
    }

    setIsApplyingDiscount(true);
    
    try {
      console.log('🎫 Applying discount code:', discountCode);
      
      const response = await api.checkDiscount(discountCode, user!.accessToken);
      
      console.log('Discount response received:', response);
      
      if (response.success) {
        // Check if discount is 100% (package activation)
        if (response.discount_percent === 100) {
          showToast(response.message || 'پکیج شما فعال شد!', 'success');
          // Refresh user info to update package status
          try {
            await refreshUserInfo();
          } catch (error) {
            console.error('Failed to refresh user info:', error);
          }
        } else {
          setIsDiscountActive(true);
          setDiscountPercent(response.discount_percent || 0);
          setDiscountId(response.discountId || null);
          console.log('Applied discount:', {
            percent: response.discount_percent,
            id: response.discountId,
            message: response.message
          });
          showToast(response.message || `کد تخفیف با موفقیت اعمال شد! ${response.discount_percent}% تخفیف`, 'success');
        }
      } else {
        console.log('Discount application failed:', response);
        showToast(response.message || 'کد تخفیف نامعتبر است', 'error');
      }
    } catch (error) {
      console.error('❌ Discount application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطا در اعمال کد تخفیف';
      showToast(errorMessage, 'error');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setIsDiscountActive(false);
    setDiscountPercent(0);
    setDiscountId(null);
    setDiscountCode('');
    showToast('کد تخفیف حذف شد', 'success');
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!isDiscountActive) return originalPrice;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  // Convert Rial to Toman (divide by 10)
  const convertRialToToman = (price: number) => {
    return Math.round(price / 10);
  };

  const handleBuyPackage = async (packageId: number) => {
    if (!isAuthenticated) {
      setShowAuthNotification(true);
      return;
    }

    setBuyingId(packageId);
    try {
      console.log('💳 Initiating payment for package:', packageId);
      
      // Get package details
      const selectedPackage = packages?.find(p => p.ID === packageId);
      if (!selectedPackage) {
        showToast('بسته انتخاب شده یافت نشد', 'error');
        setBuyingId(null);
        return;
      }
      
      // Calculate final price with discount
      let finalPrice = selectedPackage.price;
      if (isDiscountActive) {
        finalPrice = calculateDiscountedPrice(selectedPackage.price);
      }
      
      // Call API with discount info if applicable
      console.log('💳 Payment request details:', {
        packageId,
        isDiscountActive,
        discountCode: isDiscountActive ? discountCode : undefined,
        discountPercent: isDiscountActive ? discountPercent : undefined,
        finalPrice: isDiscountActive ? finalPrice : undefined,
        discountId: isDiscountActive ? (discountId || undefined) : undefined
      });
      
      const response = await api.requestPayment(
        packageId, 
        user!.accessToken,
        isDiscountActive ? discountCode : undefined,
        isDiscountActive ? discountPercent : undefined,
        isDiscountActive ? finalPrice : undefined,
        isDiscountActive ? (discountId || undefined) : undefined
      );
      
      if (response.payment) {
        console.log('✅ Payment link received, redirecting...');
        // Set flag to indicate user is going to payment
        sessionStorage.setItem('kariz_was_on_payment', 'true');
        window.location.href = response.payment;
      } else {
        console.error('❌ Payment request failed:', response);
        showToast(response.error || 'خطا در دریافت لینک پرداخت', 'error');
        setBuyingId(null);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      showToast('خطا در ارتباط با سرور پرداخت', 'error');
      setBuyingId(null);
    }
  };


  if (isLoading) {
    return (
      <div className={`h-screen flex flex-col ${effectiveIsDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header - Fixed */}
        <div className={`flex items-center p-4 border-b ${effectiveIsDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md flex-shrink-0`}>
          <button
            onClick={goBack}
            className={`p-2 rounded-lg transition-colors ${effectiveIsDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowRight size={20} className={effectiveIsDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h1 className={`flex-1 text-center text-lg font-bold ml-12 ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
            بسته‌های اشتراک
          </h1>
        </div>

        {/* Loading Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-8">
              <div className={`w-40 h-8 ${effectiveIsDark ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-amber-200 to-orange-200'} rounded-lg animate-pulse mx-auto mb-4`} />
              <div className={`w-72 h-4 ${effectiveIsDark ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-gray-200 to-gray-300'} rounded animate-pulse mx-auto`} />
            </div>

            {/* Discount Code Loading Skeleton */}
            <div className="mb-8">
              <div className={`rounded-2xl p-6 border ${effectiveIsDark ? 'bg-gray-800 border-gray-700 dark' : 'bg-white border-gray-200 light'} shadow-lg animate-pulse`}>
                <div className="text-center mb-4">
                  <div className={`w-32 h-6 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'} mx-auto mb-2`} />
                  <div className={`w-56 h-4 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'} mx-auto`} />
                </div>
                <div className="space-y-3">
                  <div className={`w-full h-12 rounded-xl ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                  <div className={`w-full h-12 rounded-xl ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl p-6 border-2 ${effectiveIsDark ? 'bg-gray-800/90 border-gray-700 dark' : 'bg-white/80 border-gray-200 light'} backdrop-blur-sm shadow-lg animate-pulse`}
                >
                  <div className="text-center mb-6">
                    <div className={`w-32 h-6 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'} mx-auto mb-2`} />
                    <div className={`w-40 h-4 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'} mx-auto`} />
                  </div>

                  <div className="text-center mb-6">
                    <div className={`w-32 h-8 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'} mx-auto mb-2`} />
                    <div className={`w-16 h-4 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'} mx-auto`} />
                  </div>

                  <div className="space-y-3 mb-6">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        <div className={`w-48 h-4 rounded ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </div>
                    ))}
                  </div>
                  <div className={`w-full h-12 rounded-xl ${effectiveIsDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
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
      <div className={`h-screen flex flex-col ${effectiveIsDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header - Fixed */}
        <div className={`flex items-center p-4 border-b ${effectiveIsDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md flex-shrink-0`}>
          <button
            onClick={goBack}
            className={`p-2 rounded-lg transition-colors ${effectiveIsDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowRight size={20} className={effectiveIsDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h1 className={`flex-1 text-center text-lg font-bold ml-12 ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
            بسته‌های اشتراک
          </h1>
        </div>

        {/* Error Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full ${effectiveIsDark ? 'bg-red-900/20' : 'bg-red-100'} flex items-center justify-center mb-4`}>
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
              خطا در دریافت اطلاعات
            </h2>
            <p className={`mb-8 text-lg ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
              متأسفانه در دریافت اطلاعات بسته‌ها مشکلی پیش آمده است.
            </p>
            
            {/* Error Details */}
            <div className={`mb-6 p-4 rounded-xl ${effectiveIsDark ? 'bg-red-900/10' : 'bg-red-50'} border ${effectiveIsDark ? 'border-red-800' : 'border-red-200'}`}>
              <p className={`text-sm ${effectiveIsDark ? 'text-red-300' : 'text-red-700'}`}>
                لطفاً اتصال اینترنت خود را بررسی کنید یا چند لحظه بعد دوباره تلاش کنید.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>تلاش مجدد</span>
                </div>
              </button>
              
              <button
                onClick={goBack}
                className={`w-full px-6 py-3 rounded-xl font-medium ${effectiveIsDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                بازگشت
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${effectiveIsDark ? 'bg-gray-900 dark' : 'bg-gradient-to-br from-blue-50 to-indigo-100 light'}`}>
      {/* Notification Components */}
      <PurchaseAuthNotification 
        isVisible={showAuthNotification} 
        onClose={handleCloseNotification}
        onLogin={handleAuthRedirect}
      />

      <IPWarningBanner 
        isVisible={showIPWarning} 
        onClose={handleCloseIPWarning}
        onRecheck={handleRecheckIP}
        country={userCountry}
        isRechecking={isRecheckingIP}
      />

      {/* Payment Success Notification */}
      {showPaymentSuccess && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold">پرداخت موفق!</div>
              <div className="text-sm opacity-90">اطلاعات حساب شما به‌روزرسانی شد</div>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Header - Fixed */}
      <div className={`flex items-center p-4 border-b ${effectiveIsDark ? 'border-gray-700 bg-gray-900/95 dark' : 'border-gray-200 bg-white/95 light'} backdrop-blur-md flex-shrink-0 ${showIPWarning ? 'mt-16' : ''}`}>
        <button
          onClick={goBack}
          className={`p-2 rounded-lg transition-colors ${effectiveIsDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowRight size={20} className={effectiveIsDark ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        <h1 className={`flex-1 text-center text-lg font-bold ml-12 ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
          بسته‌های اشتراک
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {isPremiumUser ? 'بسته‌های اشتراک' : 'بسته مناسب خود را انتخاب کنید'}
            </h2>
            <p className={`text-lg ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isPremiumUser 
                ? 'شما در حال حاضر از اکانت پیشرفته بهره‌مند هستید'
                : 'با انتخاب بسته مناسب، از تمام امکانات کلمه بهره‌مند شوید'
              }
            </p>
          </div>

          {/* Discount Code Section */}
          {!isPremiumUser && (
          <div className="mb-8">
            <div className={`rounded-2xl p-6 border ${effectiveIsDark ? 'bg-gray-800 border-gray-700 dark' : 'bg-white border-gray-200 light'} shadow-lg`}>
              <div className="text-center mb-4">
                <h3 className={`text-lg font-bold mb-2 ${effectiveIsDark ? 'text-white' : 'text-gray-900'}`}>
                  کد تخفیف دارید؟
                </h3>
                <p className={`text-sm ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  کد تخفیف خود را وارد کنید و از قیمت ویژه بهره‌مند شوید
                </p>
              </div>
              
              {!isDiscountActive ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="کد تخفیف را وارد کنید..."
                      className={`w-full px-4 py-3 rounded-xl border ${effectiveIsDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
                      dir="rtl"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyDiscount();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount || !discountCode.trim()}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingDiscount ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>در حال اعمال...</span>
                      </div>
                    ) : (
                      'اعمال کد تخفیف'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`rounded-xl p-4 border ${effectiveIsDark ? 'bg-green-900/30 border-green-800' : 'bg-green-100 border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-500 rounded-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className={`font-bold ${effectiveIsDark ? 'text-green-200' : 'text-green-800'}`}>
                            کد تخفیف فعال
                          </div>
                          <div className={`text-sm ${effectiveIsDark ? 'text-green-300' : 'text-green-600'}`}>
                            {discountPercent}٪ تخفیف اعمال شد
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className={`${effectiveIsDark ? 'text-green-400 hover:text-green-200' : 'text-green-600 hover:text-green-800'} transition-colors`}
                        title="حذف کد تخفیف"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Premium Account Message */}
          {isPremiumUser && (
            <div className="mb-8">
              <div className={`rounded-2xl p-6 border-2 ${effectiveIsDark ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-400 dark' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 light'} shadow-xl`}>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold ${effectiveIsDark ? 'text-white' : 'text-gray-900'}`}>
                      اکانت شما پیشرفته است
                    </h3>
                  </div>
                  <p className={`text-sm ${effectiveIsDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    شما در حال حاضر از تمام امکانات پیشرفته کلمه بهره‌مند هستید
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Packages */}
          <div className="grid gap-6 sm:grid-cols-2">
            {packages && packages.map((pkg, index) => {
              const isActive = isActivePackage(pkg);
              return (
                <div
                  key={pkg.ID}
                  className={`relative rounded-2xl p-6 border-2 transition-all duration-300 ${
                    isActive
                      ? `border-green-400 shadow-xl scale-105 ${effectiveIsDark ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 dark' : 'bg-gradient-to-br from-green-50 to-emerald-50 light'}`
                      : index === 1
                      ? `border-amber-400 shadow-xl scale-105 ${effectiveIsDark ? 'bg-gray-800/90 dark' : 'bg-white/80 light'} backdrop-blur-sm`
                      : `${effectiveIsDark ? 'border-gray-700 hover:border-amber-300 dark' : 'border-gray-200 hover:border-amber-300 light'} ${effectiveIsDark ? 'bg-gray-800/90' : 'bg-white/80'} backdrop-blur-sm shadow-lg hover:shadow-xl`
                  } ${showIPWarning ? 'opacity-75' : ''}`}
                >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      بسته فعال
                    </div>
                  </div>
                )}
                {!isActive && index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      محبوب‌ترین
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${effectiveIsDark ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.title}
                  </h3>
                  <p className={`text-sm ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {pkg.short_desc}
                  </p>
                  {isActive && (
                    <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${effectiveIsDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      <Check className="w-3 h-3" />
                      <span>فعال</span>
                    </div>
                  )}
                </div>

                {!isActive && !isPremiumUser && (
                <div className="text-center mb-6">
                  {isDiscountActive ? (
                    <div>
                      <div className={`text-lg line-through mb-1 ${effectiveIsDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {convertRialToToman(pkg.price).toLocaleString('fa-IR')}
                        <span className="text-sm"> تومان</span>
                      </div>
                      <div className={`text-3xl font-bold mb-1 ${effectiveIsDark ? 'text-green-400' : 'text-green-600'}`}>
                          {convertRialToToman(calculateDiscountedPrice(pkg.price)).toLocaleString('fa-IR')}
                        <span className={`text-lg ${effectiveIsDark ? 'text-green-400' : 'text-green-600'}`}> تومان</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${effectiveIsDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        <span>{discountPercent}% تخفیف</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-3xl font-bold mb-1 ${effectiveIsDark ? 'text-white' : 'text-gray-900'}`}>
                        {convertRialToToman(pkg.price).toLocaleString('fa-IR')}
                      <span className={`text-lg ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}> تومان</span>
                    </div>
                  )}
                </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.description.split('\n').filter(Boolean).map((feature, featureIndex) => (
                    <li key={featureIndex} className={`flex items-center gap-2 ${effectiveIsDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-right">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Buy Button */}
                {isActive ? (
                  <div className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>بسته فعال شما</span>
                  </div>
                ) : isPremiumUser ? (
                  <div className={`w-full py-3 rounded-xl font-bold ${effectiveIsDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed flex items-center justify-center gap-2`}>
                    <Check className="w-5 h-5" />
                    <span>در دسترس برای اکانت پیشرفته</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyPackage(pkg.ID)}
                    disabled={buyingId === pkg.ID || showIPWarning}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      showIPWarning
                        ? `${effectiveIsDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'} cursor-not-allowed`
                        : index === 1
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl'
                        : `${effectiveIsDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`
                    } ${buyingId === pkg.ID ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {buyingId === pkg.ID ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span>در حال انتقال به درگاه...</span>
                      </>
                    ) : showIPWarning ? (
                      'لطفاً فیلترشکن را خاموش کنید'
                    ) : (
                      'خرید این پکیج'
                    )}
                  </button>
                )}
              </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          {faq && faq.filter(f => f.status === 'Active').length > 0 && (
            <div className="mt-12">
              <h3 className={`text-xl font-bold mb-6 text-center ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
                سوالات متداول
              </h3>
              <div className="space-y-4">
                {faq.filter(f => f.status === 'Active').map((item) => (
                  <div key={item.ID} className={`rounded-lg p-4 ${effectiveIsDark ? 'bg-gray-800 dark' : 'bg-white light'}`}>
                    <h4 className={`font-semibold mb-2 ${effectiveIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className={`mb-4 ${effectiveIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
              سوال دیگری دارید؟
            </p>
            <a
              href="https://t.me/Kalame_support"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-6 py-3 rounded-lg font-semibold ${effectiveIsDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              تماس با پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 

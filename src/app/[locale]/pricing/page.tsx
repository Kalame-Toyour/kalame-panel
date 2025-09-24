'use client';

import { Check, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

import LanguageSwitcherModal from '../components/LanguageSwitcher';

import { Tabs, TabsContent } from '../components/ui/tabs';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useUserInfo } from '../hooks/useUserInfo';
import { useUserInfoContext } from '../contexts/UserInfoContext';
import PurchaseAuthNotification from '../components/PurchaseAuthNotification';
import IPWarningBanner from '../components/IPWarningBanner';
import { checkUserLocationComprehensive } from '../services/ipService';


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
  package_name: string
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

// Features array removed as it's not being used in the current layout

export default function PricingPage() {
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { updateUserInfo } = useUserInfo();
  const { localUserInfo, isFetchingUserInfo } = useUserInfoContext();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [packages, setPackages] = useState<Package[] | null>(null);

  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [showIPWarning, setShowIPWarning] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isRecheckingIP, setIsRecheckingIP] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountId, setDiscountId] = useState<number | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');
  const [showDiscountAuthModal, setShowDiscountAuthModal] = useState(false);
  const [userType, setUserType] = useState<string>('free');

  // Function to determine active package based on user type
  const getActivePackage = () => {
    if (!packages) return null;
    
    if (userType === 'premium') {
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

  // Update userType when user info changes
  useEffect(() => {
    if (localUserInfo?.userType) {
      setUserType(localUserInfo.userType);
    }
  }, [localUserInfo?.userType]);

  // Fetch user info on page load for authenticated users
  useEffect(() => {
    const fetchUserInfoOnLoad = async () => {
      if (user?.id && !localUserInfo) {
        try {
          console.log('Fetching user info on pricing page load...');
          await updateUserInfo(true); // Force refresh to get latest user info
          console.log('User info updated successfully on pricing page');
        } catch (error) {
          console.error('Failed to update user info on pricing page:', error);
        }
      }
    };

    fetchUserInfoOnLoad();
  }, [user?.id, localUserInfo, updateUserInfo]);

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

  useEffect(function extractUserIdFromURL() {
    const userId = searchParams.get('userId');
    if (userId) {
      console.log('Target userId found in URL:', userId);
      setTargetUserId(userId);
    }
  }, [searchParams]);

  useEffect(function checkUserIP() {
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

  const handleAuthRedirect = () => {
    setShowAuthNotification(false);
    setTimeout(() => {
      router.push('/auth');
    }, 300);
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
        toast.success(isRTL ? 'موقعیت شما تأیید شد! حالا می‌توانید خرید کنید.' : 'Your location is confirmed! You can now make purchases.');
      } else {
        toast.error(isRTL ? 'هنوز از ایران دسترسی ندارید. لطفاً فیلترشکن را خاموش کنید.' : 'Still not accessing from Iran. Please turn off your VPN.');
      }
    } catch (error) {
      console.error('IP recheck failed:', error);
      toast.error(isRTL ? 'خطا در بررسی موقعیت' : 'Error checking location');
    } finally {
      setIsRecheckingIP(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error(isRTL ? 'لطفاً کد تخفیف را وارد کنید' : 'Please enter a discount code');
      return;
    }

    // Check if user is authenticated or has targetUserId
    if (!user && !targetUserId) {
      setShowDiscountAuthModal(true);
      return;
    }

    setIsApplyingDiscount(true);
    
    try {
      const requestBody: { code: string; userId?: string } = { code: discountCode.trim() };
      
      // Add userId to request body
      if (targetUserId) {
        requestBody.userId = targetUserId;
        console.log('Sending discount check for targetUserId:', targetUserId);
      } else if (user?.id) {
        requestBody.userId = user.id;
        console.log('Sending discount check for userId:', user.id);
      }

      const res = await fetch('/api/checkDiscount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Check if discount is 100% (package activation)
        if (data.discount_percent === 100) {
          // Update user info before showing success modal with force refresh
          try {
            console.log('100% discount detected, updating user info...');
            await updateUserInfo(true); // Force refresh to bypass cache
            console.log('User info updated successfully after 100% discount');
          } catch (error) {
            console.error('Failed to update user info after 100% discount:', error);
            // Continue with showing modal even if update fails
          }
          
          setDiscountMessage(data.message || (isRTL ? 'پکیج شما فعال شد!' : 'Your package has been activated!'));
          setShowDiscountModal(true);
        } else {
          setIsDiscountActive(true);
          setDiscountPercent(data.discount_percent || 0);
          setDiscountId(data.discountId || null);
          toast.success(data.message || (isRTL ? 'کد تخفیف با موفقیت اعمال شد!' : 'Discount code applied successfully!'));
        }
      } else {
        toast.error(data.message || (isRTL ? 'کد تخفیف نامعتبر است' : 'Invalid discount code'));
      }
    } catch (error) {
      console.error('Discount application error:', error);
      toast.error(isRTL ? 'خطا در اعمال کد تخفیف' : 'Error applying discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setIsDiscountActive(false);
    setDiscountPercent(0);
    setDiscountId(null);
    setDiscountCode('');
    toast.success(isRTL ? 'کد تخفیف حذف شد' : 'Discount code removed');
  };

  const handleDiscountModalClose = () => {
    setShowDiscountModal(false);
    setDiscountMessage('');
    setDiscountCode('');
    router.push('/');
  };

  const handleDiscountAuthModalClose = () => {
    setShowDiscountAuthModal(false);
  };

  const handleDiscountAuthRedirect = () => {
    setShowDiscountAuthModal(false);
    setTimeout(() => {
      router.push('/auth');
    }, 300);
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!isDiscountActive) return originalPrice;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  // Convert English numbers to Persian
  const toPersianNumbers = (num: number | string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)] || d);
  };

  // Convert Rial to Toman (divide by 10)
  const convertRialToToman = (price: number) => {
    return Math.round(price / 10);
  };

  // Show loading state when fetching user info for authenticated users
  if (user && isFetchingUserInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-orange-300 opacity-50 blur-lg" />
            <Crown className="relative size-8 text-amber-500" />
          </motion.div>
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-lg font-medium text-transparent">
            {isRTL ? 'در حال بارگذاری اطلاعات کاربر...' : 'Loading user information...'}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      {/* <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mt-12 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowRight className="size-4" />
          {isRTL ? 'بازگشت' : 'Back'}
        </button>
      </div> */}

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
        isRTL={isRTL}
        isRechecking={isRecheckingIP}
      />

      <div className={`container mx-auto px-4 py-12 ${showIPWarning ? 'pt-24' : ''}`}>
        {/* Target User Banner */}
        {/* {targetUserId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Crown className="size-4" />
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {isRTL 
                    ? `در حال خرید برای کاربر: ${targetUserId}` 
                    : `Purchasing for user: ${targetUserId}`
                  }
                </div>
                <div className="text-xs text-white/80 mt-1">
                  {isRTL 
                    ? 'نیازی به ورود نیست - مستقیماً به درگاه پرداخت منتقل می‌شوید'
                    : 'No login required - you will be redirected to payment gateway'
                  }
                </div>
              </div>
            </div>
          </motion.div>
        )} */}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br mb-4 from-amber-400 to-orange-500 shadow-lg">
              <Crown className="size-8 text-white " />
            </div>
            <h1 className="text-4xl md:text-5xl justify-center  font-bold bg-gradient-to-r pb-4 from-amber-500 to-orange-600 bg-clip-text text-transparent">
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

        {/* Premium User Banner */}
        {user && userType === 'premium' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-700 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                    <Crown className="size-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {isRTL ? 'اکانت شما پیشرفته است' : 'Your Advanced Account'}
                    </h2>
                    <p className="text-amber-700 dark:text-amber-300 font-medium text-sm">
                      {isRTL ? 'شما از تمامی امکانات بهره‌مند هستید' : 'You have access to all features'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 w-fit mx-auto mb-2">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                      {isRTL ? 'دسترسی نامحدود' : 'Unlimited'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {isRTL ? 'تمام مدل‌ها' : 'All Models'}
                    </p>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 w-fit mx-auto mb-2">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                      {isRTL ? 'امکانات پیشرفته' : 'Advanced'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {isRTL ? 'تصویر و صدا' : 'Image & Voice'}
                    </p>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 w-fit mx-auto mb-2">
                      <Check className="size-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                      {isRTL ? 'پشتیبانی اولویت' : 'Priority'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {isRTL ? 'پشتیبانی سریع' : 'Fast Support'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all text-sm"
                  >
                    {isRTL ? 'شروع گفت‌وگو' : 'Start Chatting'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/image')}
                    className="px-6 py-2.5 rounded-lg font-bold bg-white/80 dark:bg-gray-800/80 text-amber-600 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-sm"
                  >
                    {isRTL ? 'تولید تصویر' : 'Generate Images'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Discount Code Section - Only show for non-premium users */}
        {(!user || userType !== 'premium') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {isRTL ? 'کد تخفیف دارید؟' : 'Have a discount code?'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'کد تخفیف خود را وارد کنید و از قیمت ویژه بهره‌مند شوید' : 'Enter your discount code to get special pricing'}
              </p>
            </div>
            
            {!isDiscountActive ? (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={isRTL ? 'کد تخفیف را وارد کنید...' : 'Enter discount code...'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyDiscount();
                      }
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount || !discountCode.trim()}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingDiscount ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span>{isRTL ? 'در حال اعمال...' : 'Applying...'}</span>
                    </div>
                  ) : (
                    isRTL ? 'اعمال کد تخفیف' : 'Apply Discount Code'
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-500 rounded-lg">
                        <Check className="size-4 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-green-800 dark:text-green-200">
                          {isRTL ? 'کد تخفیف فعال' : 'Discount Active'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          {isRTL ? `${toPersianNumbers(discountPercent)}٪ تخفیف اعمال شد` : `${discountPercent}% discount applied`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                      title={isRTL ? 'حذف کد تخفیف' : 'Remove discount'}
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
        </motion.div>
        )}

        {/* Features Grid */}
        {/* <motion.div
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
        </motion.div> */}

        {/* Pricing Plans - Only show for non-premium users */}
        {(!user || userType !== 'premium') && (
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
                {!isLoading && !hasError && packages && packages.map((pkg, idx) => {
                  const isActive = isActivePackage(pkg);
                  return (
                    <motion.div
                      key={pkg.ID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * idx }}
                      whileHover={{ y: -5 }}
                      className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all flex flex-col h-full ${
                        isActive
                          ? 'border-green-400 shadow-xl scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                          : idx === 1
                          ? 'border-amber-400 shadow-xl scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                      } ${showIPWarning ? 'opacity-75' : ''}`}
                    >
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            {isRTL ? 'بسته فعال' : 'Active Package'}
                          </div>
                        </div>
                      )}
                      {!isActive && idx === 1 && (
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
                      {isActive && (
                        <div className="mt-3 inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" />
                          <span>{isRTL ? 'فعال' : 'Active'}</span>
                        </div>
                      )}
                    </div>

                    {!isActive && (
                      <div className="text-center mb-6">
                        {isDiscountActive ? (
                          <div>
                            <div className="text-lg text-gray-500 dark:text-gray-400 line-through mb-1">
                              {toPersianNumbers(convertRialToToman(pkg.price).toLocaleString())}
                              <span className="text-sm"> تومان</span>
                            </div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                              {toPersianNumbers(convertRialToToman(calculateDiscountedPrice(pkg.price)).toLocaleString())}
                              <span className="text-lg text-green-600 dark:text-green-400"> تومان</span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                              <span>{toPersianNumbers(discountPercent)}% {isRTL ? 'تخفیف' : 'OFF'}</span>
                            </div>
                          </div>
                        ) : pkg.discount_percent > 0 ? (
                          <div>
                            <div className="text-lg text-gray-500 dark:text-gray-400 line-through mb-1">
                              {toPersianNumbers(convertRialToToman(pkg.price).toLocaleString())}
                              <span className="text-sm"> تومان</span>
                            </div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                              {toPersianNumbers(convertRialToToman(Math.round(pkg.price * (1 - pkg.discount_percent / 100))).toLocaleString())}
                              <span className="text-lg text-green-600 dark:text-green-400"> تومان</span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                              <span>{toPersianNumbers(pkg.discount_percent)}% {isRTL ? 'تخفیف' : 'OFF'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {toPersianNumbers(convertRialToToman(pkg.price).toLocaleString())}
                            <span className="text-lg text-gray-600 dark:text-gray-400"> تومان</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-grow">
                      <ul className="space-y-3 mb-6">
                        {pkg.description.split('\n').filter(Boolean).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Check className="size-4 text-green-500" />
                            <span className="text-sm text-right">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      {isActive ? (
                        <div className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" />
                          <span>{isRTL ? 'بسته فعال شما' : 'Your Active Package'}</span>
                        </div>
                      ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          // Check if user is logged in (only required if no targetUserId)
                          if (!user && !targetUserId) {
                            setShowAuthNotification(true);
                            return;
                          }
                          
                          setBuyingId(pkg.ID)
                          try {
                          const requestBody: { 
                            packageID: number; 
                            userId?: string;
                            discountCode?: string;
                            discountPercent?: number;
                            finalPrice?: number;
                            discountId?: number;
                          } = { packageID: pkg.ID }
                            
                            if (targetUserId) {
                              requestBody.userId = targetUserId
                              console.log('Sending payment request for userId:', targetUserId);
                            }
                            
                            if (isDiscountActive) {
                              requestBody.discountCode = discountCode;
                              requestBody.discountPercent = discountPercent ?? undefined;
                              requestBody.finalPrice = calculateDiscountedPrice(pkg.price);
                              requestBody.discountId = discountId ?? undefined;
                            }
                            
                            const res = await fetch('/api/payment-request', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(requestBody)
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
                        disabled={buyingId === pkg.ID || showIPWarning}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${
                          showIPWarning
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed'
                            : idx === 1
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
                        ) : showIPWarning ? (
                          isRTL ? 'لطفاً فیلترشکن را خاموش کنید' : 'Please turn off VPN'
                        ) : targetUserId ? (
                          isRTL ? 'خرید این پکیج' : 'Buy for User'
                        ) : (
                          isRTL ? 'خرید این پکیج' : 'Buy this package'
                        )}
                      </motion.button>
                      )}
                    </div>
                  </motion.div>
                  );
                })}
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
        )}



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

      {/* Discount Success Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isRTL ? 'تبریک!' : 'Congratulations!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {discountMessage}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDiscountModalClose}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isRTL ? 'بازگشت به صفحه اصلی' : 'Return to Home'}
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Discount Auth Modal */}
      {showDiscountAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isRTL ? 'ورود به اکانت' : 'Login Required'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {isRTL 
                  ? 'برای استفاده از کد تخفیف باید وارد اکانت خود شوید' 
                  : 'You need to login to use discount codes'
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDiscountAuthModalClose}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDiscountAuthRedirect}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isRTL ? 'ورود' : 'Login'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
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

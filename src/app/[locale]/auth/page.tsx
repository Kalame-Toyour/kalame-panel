/* eslint-disable no-console */
'use client';

import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { ThemeToggle } from '../components/ThemeToggle';
import { AnimatedBackground } from '../components/Layout/AnimatedBackground';
import { TypingAnimation } from '../components/Layout/TypingAnimation';

type SignupFormData = {
  phone: string;
  verificationCode: string;
  password: string;
  name: string;
  email: string;
  referralCode?: string;
};

// Persian to English digit conversion utility
function convertPersianToEnglishDigits(input: string): string {
  if (!input) return ''
  return input
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
}

const PhoneAuthFlow = () => {
  const [validationError, setValidationError] = useState<string>('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    phone: '',
    verificationCode: '',
    password: '',
    name: '',
    email: '',
    referralCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginWithCode, setLoginWithCode] = useState(true);

  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Always normalize phone to English digits
    const normalizedPhone = convertPersianToEnglishDigits(formData.phone);
    if (!normalizedPhone || typeof normalizedPhone !== 'string' || !/^\d{11}$/.test(normalizedPhone)) {
      setValidationError('شماره موبایل باید ۱۱ رقم و فقط عدد باشد.');
      return;
    }
    setIsLoading(true);
    setValidationError('');
    try {
      const response = await fetch('/api/auth/submit-phone-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile: normalizedPhone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      setStep(2);
      if (data.message === 'IsNewUser') {
        setUsePassword(false);
      } else if (data.message === 'IsExistUser') {
        setUsePassword(true);
      } else {
        toast.error('پاسخ نامعتبر از سرور');
        return;
      }
      setIsLoading(false);
      setFormData({ ...formData, phone: normalizedPhone });
      return data;
    } catch (_error) {
      setValidationError('خطایی رخ داده است');
      console.error('Error sending verification code:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login for existing users (usePassword === true)
  const handleLoginUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      setValidationError('شماره موبایل و رمز عبور الزامی است.');
      return;
    }
    setValidationError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, password: formData.password }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok && data.accessToken) {
        // ورود موفق: ذخیره توکن با next-auth
        console.log('Attempting to sign in with NextAuth...');
        const signInResult = await signIn('credentials', {
          phone: formData.phone,
          password: formData.password,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.needUserData?.ID,
          username: data.needUserData?.username,
          redirect: false,
        });
        
        console.log('SignIn result:', signInResult);
        
        if (signInResult && signInResult.ok) {
          toast.success('ورود با موفقیت انجام شد');
          // Wait a bit for session to be established
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.replace('/');
            }
          }, 1000);
        } else {
          console.error('SignIn failed:', signInResult);
          setValidationError('ورود با خطا مواجه شد. لطفا مجددا تلاش کنید.');
        }
      } else if (data.message) {
        toast.error(data.message);
        setValidationError(data.message);
      } else {
        setValidationError('نام کاربری یا رمز عبور اشتباه است.');
        toast.error('نام کاربری یا رمز عبور اشتباه است.');
      }
    } catch (_error) {
      setValidationError('خطای سرور');
      toast.error('خطای سرور');
      console.error('Login error:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.verificationCode || (!usePassword && (!formData.name || !formData.password))) {
      setValidationError('لطفا تمام فیلدها را وارد کنید');
      return;
    }
    setValidationError('');
    setIsLoading(true);

    try {
      const payload: {
        mobile: string;
        activeCode: string;
        fname?: string;
        pass?: string;
      } = {
        mobile: formData.phone,
        activeCode: formData.verificationCode,
        pass: formData.password,
        fname: formData.name,
      };
      const response = await fetch('/api/auth/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      // New user: get token and login with next-auth session directly
      if (data.accessToken && data.needUserData) {
        console.log('Attempting to sign in after registration...');
        // Use signIn with a custom provider to pass tokens directly
        const signInResult = await signIn('credentials', {
          phone: formData.phone,
          password: formData.password,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.needUserData.ID,
          username: data.needUserData.username,
          redirect: false,
        });
        
        console.log('SignIn result after registration:', signInResult);
        
        if (signInResult && signInResult.ok) {
          toast.success('ثبت نام و ورود با موفقیت انجام شد');
          // Wait a bit for session to be established
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.replace('/');
            }
          }, 1000);
        } else {
          console.error('SignIn failed after registration:', signInResult);
          setValidationError('ورود خودکار با خطا مواجه شد. لطفا مجددا تلاش کنید.');
        }
      } else {
        setValidationError('ثبت نام موفق نبود یا توکن دریافت نشد.');
      }

    } catch (_error) {
      setValidationError('خطایی رخ داده است');
      console.error('Error sending verification code:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  // One-time code login for existing usersسلام 
  const handleLoginWithCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.verificationCode) {
      setValidationError('شماره موبایل و کد تایید الزامی است.');
      return;
    }
    setValidationError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/loginWithCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: formData.verificationCode }),
      });
      const data = await response.json();
      console.log('Login with code response:', data);
      
      if (!response.ok) {
        setValidationError(data.error || 'خطا در ورود با کد');
        return;
      }
      
      // If tokens and user data are present, use them to sign in directly
      if (data.accessToken && data.needUserData) {
        console.log('Attempting to sign in with code...');
        const signInResult = await signIn('credentials', {
          phone: formData.phone,
          password: formData.verificationCode,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.needUserData.ID,
          username: data.needUserData.username,
          redirect: false,
        });
        
        console.log('SignIn result with code:', signInResult);
        
        if (signInResult && signInResult.ok) {
          toast.success('ورود با موفقیت انجام شد');
          // Wait a bit for session to be established
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.replace('/');
            }
          }, 1000);
        } else {
          console.error('SignIn failed with code:', signInResult);
          setValidationError('ورود با خطا مواجه شد.');
        }
      } else {
        // Fallback: try legacy signIn if tokens are not present
        console.log('Attempting fallback sign in...');
        const signInResult = await signIn('credentials', {
          phone: formData.phone,
          password: formData.verificationCode,
          redirect: false,
        });
        
        console.log('Fallback signIn result:', signInResult);
        
        if (signInResult && signInResult.ok) {
          toast.success('ورود با موفقیت انجام شد');
          // Wait a bit for session to be established
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.replace('/');
            }
          }, 1000);
        } else {
          setValidationError('ورود با خطا مواجه شد.');
        }
      }
    } catch (_error) {
      setValidationError('خطای سرور');
      console.error('Login with code error:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification code for one-time code login
  const handleSendLoginCode = async () => {
    setIsLoading(true);
    setValidationError('');
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formData.phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setValidationError(data.error || 'خطا در ارسال کد');
        return;
      }
      setLoginWithCode(true);
      setFormData({ ...formData, verificationCode: '' });
      toast.success('کد تایید ارسال شد');
    } catch (_error) {
      setValidationError('خطا در ارسال کد');
      console.error('Error sending login code:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setValidationError('');
    setStep(prevStep => prevStep - 1);
    setUsePassword(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-700 dark:via-gray-900 dark:to-gray-800">
      <AnimatedBackground />
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>
      <div className="flex w-full min-h-[calc(100vh-2rem)] items-center justify-center px-2 md:px-0">
        <div className="flex w-full max-w-5xl flex-col-reverse md:flex-row items-stretch justify-center gap-8 md:gap-0 shadow-2xl rounded-3xl bg-white/0 dark:bg-gray-900/0">
          {/* Left: Gradient background with TypingAnimation (desktop only) */}
          <div className="hidden md:flex flex-1 flex-col justify-center relative overflow-hidden rounded-r-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-300 dark:from-blue-900 dark:via-cyan-900 dark:to-blue-800 opacity-90 z-0" />
            <div className="relative z-10 flex flex-col h-full items-center justify-center px-10 py-16 text-white">
              <img src="/kalame-logo.png" alt="Logo" className="h-20 mb-8 mt-4 animate-fade-in drop-shadow-lg" />
              <h2 className="text-3xl font-extrabold mb-4 drop-shadow-lg">کلمه، دستیار هوشمند شما</h2>
              <TypingAnimation texts={["ارتباط با ابزارهای هوش مصنوعی","تولید محتوای تاثیر گذار","امنیت و سرعت بالا"]} />
              <p className="mt-8 text-center text-base font-light leading-relaxed drop-shadow-lg">با کلمه می‌توانید به ابزارهای هوش مصنوعی متصل شوید، محتوای تاثیرگذار تولید کنید و از پشتیبانی ۲۴ ساعته بهره‌مند شوید.</p>
              <div className="mt-12 text-xs opacity-80 text-center">
                <div>ارائه شده توسط تیم کلمه</div>
                <div className="mt-1">برای سوالات: <a href="mailto:support@kalame.chat" className="underline">support@kalame.chat</a></div>
              </div>  
            </div>
          </div>
          {/* Right: Main Card View (no nested cards) */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {/* On mobile, show TypingAnimation above card */}
            <div className="md:hidden w-full flex flex-col items-center animate-fade-in-up">
              <img src="/kalame-logo.png" alt="Logo" className="h-16 mb-2 animate-fade-in drop-shadow-lg" />
              <TypingAnimation texts={["ارتباط با ابزارهای هوش مصنوعی","تولید محتوای تاثیر گذار","امنیت و سرعت بالا"]} />
            </div>
            {/* Main card: only one card, with correct border radius */}
            <div className="w-full max-w-md rounded-none md:rounded-l-none md:rounded-r-3x border-gray-200 dark:border-gray-800 p-8 animate-fade-in-up transition-all duration-500">
              {/* Header with Back Button and Logo */}
              <div className="mb-1 flex items-center justify-start">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                )}
                {/* <Link href="/" className="group flex items-center md:hidden">
                  <img
                    src="/kalame-logo.png"
                    alt="Logo"
                    className="h-20 transition-transform group-hover:scale-110 animate-fade-in"
                  />
                </Link> */}
              </div>
              {/* Step 1: Phone Number */}
              {step === 1 && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fade-in-up">
                  <div className="space-y-2">
                    <h2 className="text-right text-3xl font-extrabold text-gray-900 dark:text-white animate-fade-in">ورود | ثبت‌نام</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 animate-fade-in delay-100">سلام</p>
                    <p className="text-gray-600 dark:text-gray-400 animate-fade-in delay-200">لطفا شماره موبایل خود را وارد کنید</p>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="tel"
                      maxLength={11}
                      value={formData.phone}
                      onChange={e => {
                        const englishValue = convertPersianToEnglishDigits(e.target.value)
                        setFormData({ ...formData, phone: englishValue })
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-right text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                      placeholder="شماره موبایل"
                    />
                    {validationError && (
                      <p className="text-right text-sm text-red-500 animate-fade-in-up">{validationError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-white font-bold text-lg shadow-lg transition-all hover:bg-blue-900 dark:hover:bg-amber-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {isLoading
                      ? (
                          <Loader2 className="size-5 animate-spin" />
                        )
                      : (
                          'ورود'
                        )}
                  </button>

                  {/* <p className="text-right text-xs text-gray-500 dark:text-gray-400 animate-fade-in-up">
                    ورود شما به معنای پذیرش شرایط کلمه و قوانین حریم‌خصوصی است
                  </p> */}
                </form>
              )}

              {/* Step 2: Verification Code or Password */}
              {step === 2 && (
                <form
                  onSubmit={
                    loginWithCode
                      ? handleLoginWithCodeSubmit
                      : usePassword
                        ? handleLoginUserSubmit
                        : handleSignupSubmit
                  }
                  className="space-y-6 animate-fade-in-up"
                >
                  <div className="space-y-2">
                    <h2 className="text-right text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                      {loginWithCode
                        ? 'کد ارسالی را وارد کنید'
                        : usePassword
                          ? 'رمز عبور را وارد کنید'
                          : 'کد تایید و اطلاعات کاربری را وارد کنید'}
                    </h2>
                    <p dir="rtl" className="text-right text-gray-600 dark:text-gray-300 animate-fade-in delay-100">
                      {loginWithCode
                        ? `کد تایید برای شماره ${formData.phone} ارسال شد. لطفا کد را وارد کنید.`
                        : usePassword
                          ? `لطفا رمز عبور خود را برای ${formData.phone} وارد کنید تا وارد حساب کاربری خود بشوید.`
                          : `کد تایید برای شماره ${formData.phone} .پیامک شد. همچنین نام و رمز عبور خود را وارد کنید. در صورت دریافت نکردن کد با کد تایید 1404 حساب کاربری بسازید`}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {loginWithCode ? (
                      <input
                        type="text"
                        value={formData.verificationCode}
                        onChange={e => {
                          const englishCode = convertPersianToEnglishDigits(e.target.value)
                          setFormData(prev => {
                            // Auto-submit if 4 digits entered and not previously submitted
                            if (englishCode.length === 4 && prev.verificationCode.length < 4) {
                              setTimeout(() => {
                                const form = e.target.form as HTMLFormElement | null
                                if (form) form.requestSubmit()
                              }, 0)
                            }
                            return { ...prev, verificationCode: englishCode }
                          })
                        }}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center tracking-wider text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                        maxLength={4}
                        placeholder="کد تایید"
                        required
                      />
                    ) : usePassword ? (
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-left text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                          placeholder="رمز عبور"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={formData.verificationCode}
                          onChange={e => setFormData({ ...formData, verificationCode: e.target.value })}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center tracking-wider text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                          maxLength={4}
                          placeholder="کد تایید"
                          required
                        />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                          placeholder="نام"
                          required
                        />
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                            placeholder="رمز عبور"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </>
                    )}
                    {usePassword && !loginWithCode && (
                      <div dir="rtl" className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleSendLoginCode}
                          className="text-sm text-primary hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors animate-fade-in-up"
                          disabled={isLoading}
                        >
                          {isLoading ? '' : 'ورود با کد یکبار مصرف'}
                        </button>
                      </div>
                    )}
                    {usePassword && loginWithCode && (
                      <div dir="rtl" className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginWithCode(false);
                            setFormData({ ...formData, verificationCode: '' });
                          }}
                          className="text-sm text-primary hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors animate-fade-in-up"
                        >
                          ورود با رمز عبور
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-white font-bold text-lg shadow-lg transition-all hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : 'تایید'}
                  </button>
                  {validationError && (
                    <p className="text-right text-sm text-red-500 animate-fade-in-up">
                      {validationError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            direction: 'rtl',
          },
        }}
      />
    </div>
  );
};

export default PhoneAuthFlow;

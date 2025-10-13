/* eslint-disable no-console */
'use client';

import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { ThemeToggle } from '../components/ThemeToggle';
import { AnimatedBackground } from '../components/Layout/AnimatedBackground';

type SignupFormData = {
  phone: string;
  verificationCode: string;
  password: string;
  name: string;
  email: string;
  referralCode?: string;
};

// Helper to always use the current domain for callbackUrl
function getAbsoluteCallbackUrl(path = '/app') {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
}

const PhoneAuthFlow = () => {
  const router = useRouter();
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
  const [loginWithCode, setLoginWithCode] = useState(false);

  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Validate phone number before sending
    if (!formData.phone || typeof formData.phone !== 'string' || !/^\d{11}$/.test(formData.phone)) {
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
        body: JSON.stringify({ mobile: formData.phone }),
        credentials: 'include',
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
      return data;
    } catch {
      setValidationError('خطای سرور');
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
      toast.success('ورود با موفقیت انجام شد');
      await signIn('credentials', {
        phone: formData.phone,
        password: formData.password,
        callbackUrl: getAbsoluteCallbackUrl('/app'),
        redirect: true,
      });
    } catch {
      setValidationError('خطای سرور');
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
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      // New user: get token and login with next-auth session directly
      if (data.accessToken && data.needUserData) {
        // Use signIn with a custom provider to pass tokens directly
        await signIn('credentials', {
          phone: formData.phone,
          password: formData.password,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.needUserData.ID,
          username: data.needUserData.username,
          callbackUrl: getAbsoluteCallbackUrl('/app'),
          redirect: true,
        });
      } else {
        setValidationError('ثبت نام موفق نبود یا توکن دریافت نشد.');
      }

    } catch {
      setValidationError('خطای سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // One-time code login for existing users
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
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        setValidationError(data.error || 'خطا در ورود با کد');
        return;
      }
      // If tokens and user data are present, use them to sign in directly
      if (data.accessToken && data.needUserData) {
        await signIn('credentials', {
          phone: formData.phone,
          password: formData.verificationCode,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.needUserData.ID,
          username: data.needUserData.username,
          callbackUrl: getAbsoluteCallbackUrl('/app'),
          redirect: true,
        });
      } else {
        // Fallback: try legacy signIn if tokens are not present
        await signIn('credentials', {
          phone: formData.phone,
          password: formData.verificationCode,
          callbackUrl: getAbsoluteCallbackUrl('/app'),
          redirect: true,
        });
      }
    } catch {
      setValidationError('خطای سرور');
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
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        setValidationError(data.error || 'خطا در ارسال کد');
        return;
      }
      setLoginWithCode(true);
      setFormData({ ...formData, verificationCode: '' });
      toast.success('کد تایید ارسال شد');
    } catch {
      setValidationError('خطا در ارسال کد');
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
    <div className="relative min-h-screen p-4 flex items-center justify-center overflow-hidden">
      <AnimatedBackground brandName="کلمه" />
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center w-full">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 p-10 shadow-2xl backdrop-blur-xl border border-gray-200 dark:border-gray-800 animate-fade-in-up transition-all duration-500">
            {/* Header with Back Button and Logo */}
            <div className="mb-8 flex items-center justify-center">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="absolute left-8 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-5" />
                </button>
              )}

              <Link href="/" className="group flex items-center">
                <img
                  src="/kalame-logo.png"
                  alt="Logo"
                  className="h-20 transition-transform group-hover:scale-110 animate-fade-in"
                />
              </Link>
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
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
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

                <p className="text-right text-xs text-gray-500 dark:text-gray-400 animate-fade-in-up">
                  ورود شما به معنای پذیرش شرایط کلمه و قوانین حریم‌خصوصی است
                </p>
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
                        : `کد تایید برای شماره ${formData.phone} پیامک شد. همچنین نام و رمز عبور خود را وارد کنید.`}
                  </p>
                </div>
                <div className="space-y-4">
                  {loginWithCode ? (
                    <input
                      type="text"
                      value={formData.verificationCode}
                      onChange={e => setFormData({ ...formData, verificationCode: e.target.value })}
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

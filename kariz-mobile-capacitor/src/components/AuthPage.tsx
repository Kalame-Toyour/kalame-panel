import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../contexts/RouterContext';
import { TypingAnimation } from './ui/TypingAnimation';
import { AnimatedBackground } from './ui/AnimatedBackground';
import { ThemeToggle } from './ui/ThemeToggle';
import { useToast } from './ui/Toast';
import { api } from '../utils/api';
import smsRetriever from '../utils/smsRetriever';
import { Capacitor } from '@capacitor/core';
import { keyboardInputFix } from '../utils/keyboardInputFix';

type SignupFormData = {
  phone: string;
  verificationCode: string;
  password: string;
  name: string;
  email: string;
  referralCode?: string;
};

interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: {
    isNewUser?: boolean;
    sent?: boolean;
    token?: string;
    user?: {
      id: number;
      name: string;
      phone: string;
    };
  };
  error?: string;
  accessToken?: string;
  refreshToken?: string;
  needUserData?: {
    ID?: number;
    id?: number;
    username?: string;
    name?: string;
    expireAt?: string;
    credit?: number;
  };
}

// Persian to English digit conversion utility
function convertPersianToEnglishDigits(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660));
}

export default function AuthPage() {
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
  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false);
  const [isSmsRetrieverActive, setIsSmsRetrieverActive] = useState(false);
  const [smsRetrieverStatus, setSmsRetrieverStatus] = useState<'idle' | 'listening' | 'success' | 'error'>('idle');
  
  // Ref for verification code input
  const verificationCodeRef = useRef<HTMLInputElement>(null);

  const { login } = useAuth();
  const { navigate, clearHistory } = useRouter();
  const { showToast } = useToast();

  // Force reload user state after successful login
  useEffect(() => {
    const checkUserState = async () => {
      // This will trigger a re-render of components that depend on user state
      // The Sidebar will automatically reload chat history when user state changes
    };
    
    // Check user state periodically after login
    const interval = setInterval(checkUserState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ensure SMS retriever is started when component mounts and step changes
  useEffect(() => {
    if (Capacitor.isNativePlatform() && step === 2 && (loginWithCode || !usePassword)) {
      if (!isSmsRetrieverActive) {
        startSmsRetriever();
      }
    }
  }, [step, loginWithCode, usePassword, isSmsRetrieverActive]);

  // Additional effect to check SMS retriever status periodically
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || step !== 2) return;

    const checkSmsRetrieverStatus = async () => {
      try {
        const isRunning = await smsRetriever.isSmsRetrieverRunning();
        
        if (!isRunning && isSmsRetrieverActive) {
          setSmsRetrieverStatus('error');
          setIsSmsRetrieverActive(false);
          // Restart after a short delay
          setTimeout(() => {
            if (step === 2 && (loginWithCode || !usePassword)) {
              startSmsRetriever();
            }
          }, 1000);
        }
      } catch (error) {
        console.error('[AuthPage] Error checking SMS retriever status:', error);
      }
    };

    // Check status every 5 seconds
    const interval = setInterval(checkSmsRetrieverStatus, 5000);
    
    return () => clearInterval(interval);
  }, [step, loginWithCode, usePassword, isSmsRetrieverActive]);

  // Monitor verification code field changes
  useEffect(() => {
    if (formData.verificationCode) {
      console.log('[AuthPage] Verification code field updated:', formData.verificationCode);
    }
  }, [formData.verificationCode]);

  // Monitor SMS retriever status changes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    // If SMS retriever is active but status is error, try to restart
    if (isSmsRetrieverActive && smsRetrieverStatus === 'error') {
      setTimeout(() => {
        if (step === 2 && (loginWithCode || !usePassword)) {
          startSmsRetriever();
        }
      }, 2000);
    }
  }, [smsRetrieverStatus, isSmsRetrieverActive, step, loginWithCode, usePassword]);

  // Handle key press events with enhanced keyboard support
  function handleKeyPress(e: React.KeyboardEvent) {
    // Prevent all keyboard events from bubbling to avoid conflicts with back button handler
    e.stopPropagation();
  }

  // Register input elements with keyboard input fix
  useEffect(() => {
    // Register verification code input when it becomes available
    if (verificationCodeRef.current) {
      keyboardInputFix.registerInput(verificationCodeRef.current);
    }
    
    return () => {
      if (verificationCodeRef.current) {
        keyboardInputFix.unregisterInput(verificationCodeRef.current);
      }
    };
  }, [step, verificationCodeRef]);

  // SMS Retriever effect
  useEffect(() => {
    let isActive = true;

    const setupSmsRetriever = async () => {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        // Set up SMS listener
        smsRetriever.onSmsReceived((code: string) => {
          if (isActive && step === 2 && (loginWithCode || !usePassword)) {
            let extractedCode = '';
            const codeMatch = code.match(/(\d{4})/);
            if (codeMatch && codeMatch[1]) {
              extractedCode = codeMatch[1];
            } else {
              const digitMatch = code.match(/(\d{4,})/);
              if (digitMatch && digitMatch[1]) {
                extractedCode = digitMatch[1].substring(0, 4);
              } else {
                return;
              }
            }
            
            const cleanCode = extractedCode.trim();
            
            if (cleanCode.length === 4) {
              setFormData(prev => ({ ...prev, verificationCode: cleanCode }));
              setSmsRetrieverStatus('success');
              setTimeout(() => {
                if (isActive && verificationCodeRef.current) {
                  if (verificationCodeRef.current.form) {
                    verificationCodeRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    setTimeout(() => {
                      if (isActive && verificationCodeRef.current?.form) {
                        verificationCodeRef.current.form.requestSubmit();
                      }
                    }, 100);
                  }
                }
              }, 300);
            }
          }
        });

        // Start SMS retriever
        await smsRetriever.startSmsRetriever();
        setSmsRetrieverStatus('listening');
        
      } catch (error) {
        console.error('[AuthPage] Error setting up SMS retriever:', error);
        setSmsRetrieverStatus('error');
      }
    };

    if (step === 2 && (loginWithCode || !usePassword)) {
      setupSmsRetriever();
    }

    return () => {
      isActive = false;
      if (smsRetriever) {
        smsRetriever.removeAllListeners();
      }
    };
  }, [step, loginWithCode, usePassword]);

  const handleSuccessfulLogin = async () => {
    // Force a small delay to ensure auth state is properly updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate directly to chat without reload and clear history
    navigate('chat');
    // Clear navigation history so user can't go back to auth page
    setTimeout(() => clearHistory('chat'), 100);
  };

  // Function to start SMS retriever
  const startSmsRetriever = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      setSmsRetrieverStatus('listening');
      setIsSmsRetrieverActive(true);
      
      await smsRetriever.startSmsRetriever();
      
      // Set a timeout to stop listening after 2 minutes
      setTimeout(() => {
        if (isSmsRetrieverActive) {
          stopSmsRetriever();
        }
      }, 120000); // 2 minutes
      
    } catch (error) {
      console.error('[AuthPage] Error starting SMS retriever:', error);
      setSmsRetrieverStatus('error');
    }
  };

  // Function to stop SMS retriever
  const stopSmsRetriever = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await smsRetriever.stopSmsRetriever();
      setIsSmsRetrieverActive(false);
      setSmsRetrieverStatus('idle');
    } catch (error) {
      console.error('[AuthPage] Error stopping SMS retriever:', error);
    }
  };

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
      const data = await api.authPost('/verifyPhoneNumber', { mobile: normalizedPhone }) as ApiAuthResponse;
      
      if (!data.success && data.error) {
        const errorMessage = data.error || data.message || 'Failed to send verification code';
        setValidationError(errorMessage);
        throw new Error(errorMessage);
      }
      
      setStep(2);
      if (data.message === 'IsNewUser') {
        setUsePassword(false); // برای کاربر جدید، فرم ثبت‌نام نمایش داده شود
        setLoginWithCode(false); // کد تایید را غیرفعال کن
        showToast('خوش آمدید. لطفا اطلاعات خود را تکمیل کنید.', 'success');
      } else if (data.message === 'IsExistUser') {
        setUsePassword(true);
        if (loginWithCode) {
          await handleSendLoginCode();
        }
      } else {
        console.error('پاسخ نامعتبر از سرور:', data);
        setValidationError('پاسخ نامعتبر از سرور');
        return;
      }
      
      // Start SMS retriever when moving to step 2
      if (Capacitor.isNativePlatform()) {
        try {
          await startSmsRetriever();
        } catch (error) {
          console.error('[AuthPage] Failed to start SMS retriever:', error);
        }
      }
      
      setIsLoading(false);
      setFormData({ ...formData, phone: normalizedPhone });
      return data;
    } catch (_error: unknown) {
      // Handle API error responses properly
      let errorMessage = 'خطایی رخ داده است';
      
      if (_error && typeof _error === 'object' && 'response' in _error) {
        const error = _error as { response?: { data?: { message?: string } } };
        if (error.response?.data?.message) {
          // Extract the actual error message from the API response
          errorMessage = error.response.data.message;
        }
      } else if (_error instanceof Error) {
        errorMessage = _error.message;
      }
      
      setValidationError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error sending verification code:', _error);
      return undefined; // Return undefined on error
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
      // Use the correct API endpoint with correct parameter names (mobile, pass)
      const data = await api.authPost('/login', { 
        mobile: formData.phone, 
        pass: formData.password 
      }) as ApiAuthResponse;
      
      // Check if we have the new response format with accessToken and needUserData
      if (data.accessToken && data.needUserData) {
        // If login successful, use the login function to handle authentication
        await login(formData.phone, formData.password);
        showToast('ورود با موفقیت انجام شد', 'success');
        handleSuccessfulLogin();
        navigate('chat');
        // Clear navigation history so user can't go back to auth page
        setTimeout(() => clearHistory('chat'), 100);
      } else if (!data.success && data.error) {
        // Handle legacy error format
        const errorMessage = data.error || data.message || 'نام کاربری یا رمز عبور اشتباه است.';
        setValidationError(errorMessage);
        showToast(errorMessage, 'error');
        return;
      } else {
        // Handle other error cases
        const errorMessage = data.error || data.message || 'نام کاربری یا رمز عبور اشتباه است.';
        setValidationError(errorMessage);
        showToast(errorMessage, 'error');
        return;
      }
    } catch (_error: unknown) {
      // Handle API error responses properly
      let errorMessage = 'نام کاربری یا رمز عبور اشتباه است.';
      
      if (_error && typeof _error === 'object' && 'response' in _error) {
        const error = _error as { response?: { data?: { message?: string } } };
        if (error.response?.data?.message) {
          // Extract the actual error message from the API response
          errorMessage = error.response.data.message;
        }
      } else if (_error instanceof Error) {
        errorMessage = _error.message;
      }
      
      setValidationError(errorMessage);
      showToast(errorMessage, 'error');
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
      
      // Call the mobile app's registration API
      await login(formData.phone, formData.password, 'register', payload);
      showToast('ثبت نام با موفقیت انجام شد', 'success');
      handleSuccessfulLogin();
      navigate('chat');
      // Clear navigation history so user can't go back to auth page
      setTimeout(() => clearHistory('chat'), 100);
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'خطایی رخ داده است';
      setValidationError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Registration error:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  // One-time code login for existing users
  const handleLoginWithCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCodeSubmitted) return;
    setIsCodeSubmitted(true);
    if (!formData.phone || !formData.verificationCode) {
      setValidationError('شماره موبایل و کد تایید الزامی است.');
      setIsCodeSubmitted(false);
      return;
    }
    setValidationError('');
    setIsLoading(true);
    try {
      // Use the correct API endpoint for login with code
      const data = await api.authPost('/loginWithCode', { 
        mobile: formData.phone, 
        code: formData.verificationCode 
      }) as ApiAuthResponse;
      
      // Check if we have the new response format with accessToken and needUserData
      if (data.accessToken && data.needUserData) {
        // If login successful, use the login function to handle authentication
        await login(formData.phone, formData.verificationCode, 'code');
        showToast('ورود با موفقیت انجام شد', 'success');
        handleSuccessfulLogin();
        navigate('chat');
        // Clear navigation history so user can't go back to auth page
        setTimeout(() => clearHistory('chat'), 100);
      } else if (!data.success && data.error) {
        // Handle legacy error format
        const errorMessage = data.error || data.message || 'خطا در ورود با کد';
        setValidationError(errorMessage);
        showToast(errorMessage, 'error');
        return;
      } else {
        // Handle other error cases
        const errorMessage = data.error || data.message || 'خطا در ورود با کد';
        setValidationError(errorMessage);
        showToast(errorMessage, 'error');
        return;
      }
    } catch (_error: unknown) {
      // Handle API error responses properly
      let errorMessage = 'خطای سرور';
      
      if (_error && typeof _error === 'object' && 'response' in _error) {
        const error = _error as { response?: { data?: { message?: string } } };
        if (error.response?.data?.message) {
          // Extract the actual error message from the API response
          errorMessage = error.response.data.message;
        }
      } else if (_error instanceof Error) {
        errorMessage = _error.message;
      }
      
      setValidationError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Login with code error:', _error);
    } finally {
      setIsLoading(false);
      setIsCodeSubmitted(false);
    }
  };

  // Send verification code for one-time code login
  const handleSendLoginCode = async () => {
    setIsLoading(true);
    setValidationError('');
    try {
      const data = await api.authPost('/sendVerificationCode', { mobile: formData.phone }) as ApiAuthResponse;
      
      if (!data.success && data.error) {
        const errorMessage = data.error || data.message || 'خطا در ارسال کد';
        setValidationError(errorMessage);
        showToast(errorMessage, 'error');
        return;
      }
      
      setLoginWithCode(true);
      setFormData({ ...formData, verificationCode: '' });
      showToast('کد تایید ارسال شد', 'success');
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'خطا در ارسال کد';
      setValidationError(errorMessage);
      showToast(errorMessage, 'error');
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-700 dark:via-gray-900 dark:to-gray-800">
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
              <img src="/kalamelogo.png" alt="Logo" className="h-20 mb-8 mt-4 animate-fade-in drop-shadow-lg" />
              <h2 className="text-3xl font-extrabold mb-4 drop-shadow-lg">کلمه، دستیار هوشمند شما</h2>
              <TypingAnimation texts={["ارتباط با ابزارهای هوش مصنوعی","تولید محتوای تاثیر گذار","امنیت و سرعت بالا"]} />
              <p className="mt-8 text-center text-base font-light leading-relaxed drop-shadow-lg">با کلمه می‌توانید به ابزارهای هوش مصنوعی متصل شوید، محتوای تاثیرگذار تولید کنید و از پشتیبانی ۲۴ ساعته بهره‌مند شوید.</p>
              <div className="mt-12 text-xs opacity-80 text-center">
                <div>ارائه شده توسط تیم کلمه</div>
                <div className="mt-1">برای سوالات: <a href="mailto:support@kalame.chat" className="underline">support@kalame.chat</a></div>
              </div>  
            </div>
          </div>
          
          {/* Right: Main Card View */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {/* On mobile, show TypingAnimation above card */}
            <div className="md:hidden w-full flex flex-col items-center animate-fade-in-up">
              <img src="/kalamelogo.png" alt="Logo" className="h-16 mb-2 animate-fade-in drop-shadow-lg" />
              <TypingAnimation texts={["ارتباط با ابزارهای هوش مصنوعی","تولید محتوای تاثیر گذار","امنیت و سرعت بالا"]} />
            </div>
            
            {/* Main card */}
            <div className="w-full max-w-md rounded-none md:rounded-l-none md:rounded-r-3x p-8 animate-fade-in-up transition-all duration-500 backdrop-blur-sm">
              {/* Header with Back Button */}
              <div className="mb-1 flex items-center justify-start">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                )}
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      value={formData.phone}
                      onChange={e => {
                        // فقط اعداد را قبول کن
                        const numericValue = e.target.value.replace(/[^0-9]/g, '')
                        const englishValue = convertPersianToEnglishDigits(numericValue)
                        setFormData({ ...formData, phone: englishValue })
                      }}
                      onKeyDown={(e) => {
                        handleKeyPress(e)
                        
                        // فقط اعداد و کلیدهای کنترل را قبول کن
                        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData('text')
                        const numericValue = pastedText.replace(/[^0-9]/g, '')
                        const englishValue = convertPersianToEnglishDigits(numericValue)
                        setFormData({ ...formData, phone: englishValue })
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-right text-gray-900 dark:text-white transition-all focus:border-border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                      placeholder="شماره موبایل"
                    />
                    {validationError && (
                      <p className="text-right text-sm text-red-500 animate-fade-in-up">{validationError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 py-3 text-white font-bold text-lg shadow-lg transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isLoading
                      ? (
                          <Loader2 className="size-5 animate-spin" />
                        )
                      : (
                          'ورود'
                        )}
                  </button>
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
                          : `کد تایید برای شماره ${formData.phone} .پیامک شد. همچنین نام و رمز عبور خود را وارد کنید.`}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {loginWithCode ? (
                      <div className="relative">
                        <input
                          ref={verificationCodeRef}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.verificationCode}
                          onChange={e => {
                            // فقط اعداد را قبول کن
                            const numericValue = e.target.value.replace(/[^0-9]/g, '')
                            const englishCode = convertPersianToEnglishDigits(numericValue)
                            setFormData(prev => {
                              if (englishCode.length === 4 && prev.verificationCode.length < 4 && !isCodeSubmitted) {
                                setTimeout(() => {
                                  const form = e.target.form as HTMLFormElement | null
                                  if (form) form.requestSubmit()
                                }, 0)
                              }
                              return { ...prev, verificationCode: englishCode }
                            })
                          }}
                          onKeyDown={(e) => {
                            handleKeyPress(e)
                            
                            // فقط اعداد و کلیدهای کنترل را قبول کن
                            const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
                            if (!allowedKeys.includes(e.key)) {
                              e.preventDefault()
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault()
                            const pastedText = e.clipboardData.getData('text')
                            const numericValue = pastedText.replace(/[^0-9]/g, '')
                            const englishCode = convertPersianToEnglishDigits(numericValue)
                            setFormData(prev => ({ ...prev, verificationCode: englishCode }))
                          }}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center tracking-wider text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                          maxLength={4}
                          placeholder="کد تایید"
                          required
                        />
                        
                        {/* SMS Retriever Status Indicator - Hidden from user */}
                        {Capacitor.isNativePlatform() && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none">
                            {smsRetrieverStatus === 'listening' && (
                              <div className="flex items-center gap-1 text-blue-500">
                                <Smartphone className="w-4 h-4 animate-pulse" />
                                <span className="text-xs">گوش دادن</span>
                              </div>
                            )}
                            {smsRetrieverStatus === 'success' && (
                              <div className="flex items-center gap-1 text-green-500">
                                <Smartphone className="w-4 h-4" />
                                <span className="text-xs">کد دریافت شد</span>
                              </div>
                            )}
                            {smsRetrieverStatus === 'error' && (
                              <div className="flex items-center gap-1 text-red-500">
                                <span className="text-xs">خطا</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : usePassword ? (
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-left text-gray-900 dark:text-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
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
                        <div className="relative">
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.verificationCode}
                            onChange={e => {
                              // فقط اعداد را قبول کن
                              const numericValue = e.target.value.replace(/[^0-9]/g, '')
                              setFormData({ ...formData, verificationCode: numericValue })
                            }}
                            onKeyDown={(e) => {
                              handleKeyPress(e)
                              
                              // فقط اعداد و کلیدهای کنترل را قبول کن
                              const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
                              if (!allowedKeys.includes(e.key)) {
                                e.preventDefault()
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault()
                              const pastedText = e.clipboardData.getData('text')
                              const numericValue = pastedText.replace(/[^0-9]/g, '')
                              setFormData({ ...formData, verificationCode: numericValue })
                            }}
                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center tracking-wider text-gray-900 dark:text-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                            maxLength={4}
                            placeholder="کد تایید"
                            required
                          />
                          
                          {/* SMS Retriever Status Indicator - Hidden from user */}
                          {Capacitor.isNativePlatform() && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none">
                              {smsRetrieverStatus === 'listening' && (
                                <div className="flex items-center gap-1 text-blue-500">
                                  <Smartphone className="w-4 h-4 animate-pulse" />
                                  <span className="text-xs">گوش دادن</span>
                                </div>
                              )}
                              {smsRetrieverStatus === 'success' && (
                                <div className="flex items-center gap-1 text-green-500">
                                  <Smartphone className="w-4 h-4" />
                                  <span className="text-xs">کد دریافت شد</span>
                              </div>
                              )}
                              {smsRetrieverStatus === 'error' && (
                                <div className="flex items-center gap-1 text-red-500">
                                  <span className="text-xs">خطا</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          onKeyDown={handleKeyPress}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center text-gray-900 dark:text-white transition-all focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
                          placeholder="نام"
                          required
                        />
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            onKeyDown={handleKeyPress}
                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-3 text-center text-gray-900 dark:text-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm animate-fade-in-up"
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
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors animate-fade-in-up"
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
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors animate-fade-in-up"
                        >
                          ورود با رمز عبور
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 py-3 text-white font-bold text-lg shadow-lg transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
    </div>
  );
} 
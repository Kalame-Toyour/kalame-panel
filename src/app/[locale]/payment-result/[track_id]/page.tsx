'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader, CheckCircle2, XCircle } from 'lucide-react'
import { useUserInfo } from '../../hooks/useUserInfo'

interface Payment {
  ID: number
  code: number
  user_id: number
  package_id: number
  amount: number
  track_id: string
  ref_number: string
  card_number: string
  paid_at: string
  status: string
  gateway_status: number
  insert_time: string
  update_time: string
}

interface PageProps {
  params: Promise<{ track_id: string }>
}

export default function PaymentResultPage({ params }: PageProps) {
  const router = useRouter()
  const { updateUserInfo } = useUserInfo()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [trackId, setTrackId] = useState<string | null>(null)
  const [userInfoUpdated, setUserInfoUpdated] = useState(false)

  useEffect(() => {
    // Resolve params in useEffect since it's a Promise
    params.then(resolvedParams => {
      setTrackId(resolvedParams.track_id)
    })
  }, [params])

  useEffect(() => {
    if (!trackId) return
    setLoading(true)
    setError(null)
    fetch('/api/payment-get-by-trackid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: trackId })
    })
      .then(async (res) => {
        const data = await res.json()
        console.log(data)
        if (res.ok && data.payment) {
          setPayment(data.payment)
          
          // If payment was successful, update user info with force refresh
          if (data.payment.status === 'verify' && !userInfoUpdated) {
            try {
              console.log('Payment successful, updating user info...');
              await updateUserInfo(true); // Force refresh to bypass cache
              setUserInfoUpdated(true);
              console.log('User info updated successfully after payment');
            } catch (error) {
              console.error('Failed to update user info after payment:', error);
              // Continue even if update fails
            }
          }
        } else {
          setError(data.error || 'خطا در دریافت اطلاعات پرداخت')
        }
      })
      .catch(() => setError('خطا در ارتباط با سرور پرداخت'))
      .finally(() => setLoading(false))
  }, [trackId, userInfoUpdated, updateUserInfo]) // Include updateUserInfo in dependencies

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className={`animate-spin mb-4 ${
          typeof window !== 'undefined' && window.location.hostname === 'okian.ai' 
            ? 'text-purple-500' 
            : 'text-blue-500'
        }`} size={40} />
        <div className={`text-lg font-bold ${
          typeof window !== 'undefined' && window.location.hostname === 'okian.ai' 
            ? 'text-purple-700' 
            : 'text-blue-700'
        }`}>در حال بررسی وضعیت پرداخت...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="text-red-500 animate-pulse mb-2" size={56} />
        <div className="text-2xl font-bold text-red-600 mb-2">پرداخت ناموفق بود</div>
        <div className="text-gray-500 mb-2">{error}</div>
        <div className="text-sm text-gray-500 mb-4 text-center">در صورت کسر وجه، حداکثر تا ۷۲ ساعت آینده مبلغ به حساب شما بازخواهد گشت.<br />کد رهگیری شما: <span className="font-bold text-blue-700">{payment?.code || '---'}</span></div>
        <button className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-bold" onClick={() => router.push('/')}>بازگشت به خانه</button>
      </div>
    )
  }

  if (!payment) return null

  const isSuccess = payment.status === 'verify'

  // Function to detect if user is on mobile app
  const isMobileApp = () => {
    return typeof window !== 'undefined' && 
           (window.navigator.userAgent.includes('Kalame') || 
            window.navigator.userAgent.includes('Capacitor') ||
            window.navigator.userAgent.includes('Android') ||
            window.navigator.userAgent.includes('iPhone'));
  };

  // Function to return to mobile app
  const returnToMobileApp = () => {
    if (typeof window !== 'undefined') {
      // Try multiple methods to return to the app
      
      // Method 1: Try to close the webview (works on some platforms)
      if (window.close) {
        window.close();
      }
      
      // Method 2: Try to navigate back (works on some platforms)
      if (window.history.length > 1) {
        window.history.back();
      }
      
      // Method 3: Try to open the app using custom URL scheme
      const appUrl = 'kalame://payment-complete';
      try {
        window.location.href = appUrl;
      } catch (error) {
        console.log('Could not open app URL:', error);
      }
      
      // Method 4: Show message to user
      setTimeout(() => {
        alert('لطفاً به اپلیکیشن کلمه برگردید');
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col p-4 items-center justify-center min-h-[60vh]">
      {isSuccess ? (
        <>
          <CheckCircle2 className="text-green-500 animate-bounce mb-2" size={56} />
          <div className="text-2xl font-bold text-green-600 mb-2">پرداخت با موفقیت انجام شد</div>
          <div className="text-gray-700 mb-4">شما {payment.amount.toLocaleString('fa-IR')} تومان پرداخت کردید و توکن شما شارژ شد.</div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 w-full max-w-md shadow-lg">
            <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
              <div><span className="font-bold">کد پیگیری:</span> {payment.track_id}</div>
              <div><span className="font-bold">زمان پرداخت:</span> {new Date(payment.paid_at).toLocaleString('fa-IR')}</div>
              <div><span className="font-bold">مبلغ:</span> {payment.amount.toLocaleString('fa-IR')} تومان</div>
            </div>
          </div>
          
          {/* Mobile App Return Button */}
          {isMobileApp() && (
            <div className="mb-4">
              <button 
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={returnToMobileApp}
              >
                بازگشت به اپلیکیشن کلمه
              </button>
            </div>
          )}
          
          <button className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-bold shadow" onClick={() => router.push('/')}>بازگشت به خانه</button>
        </>
      ) : (
        <>
          <XCircle className="text-red-500 animate-pulse mb-2" size={56} />
          <div className="text-2xl font-bold text-red-600 mb-2">پرداخت ناموفق بود</div>
          <div className="text-sm text-gray-500 mb-4 text-center">در صورت کسر وجه، حداکثر تا ۷۲ ساعت آینده مبلغ به حساب شما بازخواهد گشت.<br />کد رهگیری شما: <span className="font-bold text-blue-700">{payment.code}</span></div>
          
          {/* Mobile App Return Button */}
          {isMobileApp() && (
            <div className="mb-4">
              <button 
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={returnToMobileApp}
              >
                بازگشت به اپلیکیشن کلمه
              </button>
            </div>
          )}
          
          <button className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-bold shadow" onClick={() => router.push('/')}>بازگشت به خانه</button>
        </>
      )}
    </div>
  )
} 
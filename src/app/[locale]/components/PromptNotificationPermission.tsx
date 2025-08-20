'use client'

import React, { useEffect, useState } from 'react'

interface Props { onGranted?: () => void }

export default function PromptNotificationPermission({ onGranted }: Props) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem('notif_prompt_dismissed') === '1'
    if (Notification && Notification.permission === 'default' && !dismissed) setShouldShow(true)
  }, [])

  if (!shouldShow) return null

  async function handleAllowClick() {
    try {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        localStorage.setItem('notif_prompt_dismissed', '1')
        setShouldShow(false)
        onGranted?.()
      }
    } catch {}
  }

  function handleLater() {
    localStorage.setItem('notif_prompt_dismissed', '1')
    setShouldShow(false)
  }

  return (
    <div className="fixed top-3 inset-x-0 flex justify-center z-[100]">
      <div className="mx-2 max-w-xl w-full rounded-2xl border border-blue-200 bg-white/90 backdrop-blur-md shadow-lg p-4 dark:bg-gray-800/90 dark:border-blue-900" dir="rtl">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V7a8 8 0 10-16 0v5c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 dark:text-gray-100">فعال‌سازی اعلان‌ها</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">برای دریافت به‌روزرسانی‌ها و اعلان‌های مهم، لطفاً دسترسی اعلان را فعال کنید.</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAllowClick} className="rounded-lg px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">فعال‌سازی</button>
            <button onClick={handleLater} className="rounded-lg px-3 py-1.5 bg-gray-200 text-gray-800 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">بعداً</button>
          </div>
        </div>
      </div>
    </div>
  )
}



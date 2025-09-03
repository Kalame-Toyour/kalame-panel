'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useGTM } from '../hooks/useGTM'

export default function GTMPageTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { trackPageView } = useGTM()

  useEffect(() => {
    const url = `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const title = document.title

    // Track page view
    trackPageView(url, title)
  }, [pathname, searchParams, trackPageView])

  return null
}


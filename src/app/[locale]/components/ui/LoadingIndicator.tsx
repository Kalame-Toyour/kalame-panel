'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const LoadingIndicator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    window.addEventListener('routeChangeStart', handleStart);
    window.addEventListener('routeChangeComplete', handleComplete);
    window.addEventListener('routeChangeError', handleComplete);

    return () => {
      window.removeEventListener('routeChangeStart', handleStart);
      window.removeEventListener('routeChangeComplete', handleComplete);
      window.removeEventListener('routeChangeError', handleComplete);
    };
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  if (!loading) {
    return null;
  }

  return <div className="fixed left-0 top-0 z-50 h-2 w-full animate-pulse rounded-lg bg-pink-600"></div>;
};

export default LoadingIndicator;

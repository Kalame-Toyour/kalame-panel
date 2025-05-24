'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoadingBar() {
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500">
      <div className="size-full animate-loading-bar bg-white/30" />
    </div>
  );
}

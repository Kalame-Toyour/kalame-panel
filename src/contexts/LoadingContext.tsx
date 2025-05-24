'use client';

import type { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import React, { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import '@/styles/nprogress.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease-in-out',
  speed: 400,
  showSpinner: false,
  trickleSpeed: 100,
});

type LoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

// Create a component that uses useSearchParams
function RouteChangeHandler({ onRouteChange }: { onRouteChange: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    onRouteChange();
  }, [pathname, searchParams, onRouteChange]);

  return null;
}

// Fallback for when RouteChangeHandler is suspended
function RouteChangeHandlerFallback() {
  return null;
}

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  const initialLoadRef = useRef(true);
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      NProgress.done();
    };
  }, []);

  const startLoading = useCallback(() => {
    if (isMounted.current) {
      setIsLoading(true);
      NProgress.start();
    }
  }, []);

  const stopLoading = useCallback(() => {
    if (isMounted.current) {
      setIsLoading(false);
      NProgress.done();
    }
  }, []);

  // Handle page load events
  useEffect(() => {
    const handlePageLoad = () => {
      if (isLoading) {
        stopLoading();
      }
    };

    if (document.readyState === 'complete') {
      handlePageLoad();
    }

    window.addEventListener('load', handlePageLoad);
    return () => window.removeEventListener('load', handlePageLoad);
  }, [isLoading, stopLoading]);

  // Handle route changes and language changes
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      startLoading();
    } else if (isLoading) {
      // If it's not a route change but loading is active (e.g., language change)
      // Check document state and stop loading if complete
      if (document.readyState === 'complete') {
        stopLoading();
      }
    }
  }, [pathname, isLoading, startLoading, stopLoading]);

  // Handle initial page load
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      startLoading();
    }
  }, [startLoading]);

  const value = useMemo(() => ({
    isLoading,
    startLoading,
    stopLoading,
  }), [isLoading, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Suspense fallback={<RouteChangeHandlerFallback />}>
        <RouteChangeHandler onRouteChange={startLoading} />
      </Suspense>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

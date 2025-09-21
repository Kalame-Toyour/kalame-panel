'use client';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import InitFirebasePush from './InitFirebasePush'
import PromptNotificationPermission from './PromptNotificationPermission'
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { FCMErrorBoundary } from './ErrorBoundary';
import { UserInfoProvider } from '../contexts/UserInfoContext';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <UserInfoProvider>
        <LoadingProvider>
          <ThemeProvider defaultTheme="light" storageKey="theme">
            <FCMErrorBoundary>
              <PromptNotificationPermission />
              <InitFirebasePush />
            </FCMErrorBoundary>
            {children}
            <Toaster position="top-center" toastOptions={{
              style: { fontFamily: 'inherit', fontSize: 16, borderRadius: 12 },
              duration: 3500,
            }} />
          </ThemeProvider>
        </LoadingProvider>
      </UserInfoProvider>
    </SessionProvider>
  );
}

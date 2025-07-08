'use client';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'react-hot-toast';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LoadingProvider>
        <ThemeProvider defaultTheme="light" storageKey="theme">
          {children}
          <Toaster position="top-center" toastOptions={{
            style: { fontFamily: 'inherit', fontSize: 16, borderRadius: 12 },
            duration: 3500,
          }} />
        </ThemeProvider>
      </LoadingProvider>
    </SessionProvider>
  );
}

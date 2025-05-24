'use client';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { ThemeProvider } from './ThemeProvider';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LoadingProvider>
        <ThemeProvider defaultTheme="light" storageKey="theme">
          {children}
        </ThemeProvider>
      </LoadingProvider>
    </SessionProvider>
  );
}

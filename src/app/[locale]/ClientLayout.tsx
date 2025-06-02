'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from './components/ThemeProvider';
import DynamicBackground from './components/DynamicBackground';
import LayoutWrapper from './components/LayoutWrapper';
import Providers from './components/Providers';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && pathname.includes('/auth')) {
    return <>{children}</>;
  }
  return (
    <LoadingProvider>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <SidebarProvider>
          <Providers>
            <DynamicBackground>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </DynamicBackground>
          </Providers>
        </SidebarProvider>
      </ThemeProvider>
    </LoadingProvider>
  );
} 
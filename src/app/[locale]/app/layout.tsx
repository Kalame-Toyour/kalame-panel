import type { Metadata } from 'next';
import { routing } from '@/libs/i18nNavigation';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import React from 'react';
import DynamicBackground from '../components/DynamicBackground';
import LayoutWrapper from '../components/LayoutWrapper';
import Providers from '../components/Providers';
import '../../../styles/global.css';
import { getServerDynamicContent } from '@/utils/serverDynamicContent';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getServerDynamicContent()
  
  return {
    icons: [
      {
        rel: 'icon',
        type: 'image/png',
        url: content.favicon,
      },
      {
        rel: 'apple-touch-icon',
        url: content.appleTouchIcon,
      },
    ],
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params object before accessing its properties
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} >
      <Providers >
        <DynamicBackground>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </DynamicBackground>
      </Providers>
    </NextIntlClientProvider>
  );
}

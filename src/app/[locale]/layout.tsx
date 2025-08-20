import type { Metadata } from 'next';
import { routing } from '@/libs/i18nNavigation';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '../globals.css';
import ClientLayout from './ClientLayout';
import { metadata as defaultMetadata } from './metadata';

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/kalame-logo.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/kalame-logo.png',
    },
  ],
  openGraph: {
    title: defaultMetadata.title,
    description: defaultMetadata.description,
    url: 'https://kalame.chat/',
    siteName: 'کلمه | دستیار هوش مصنوعی',
    images: [
      {
        url: '/kalame-logo.png',
        width: 512,
        height: 512,
        alt: 'کلمه | دستیار هوش مصنوعی',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultMetadata.title,
    description: defaultMetadata.description,
    images: ['/kalame-logo.png'],
    site: '@kalamechat',
  },
  metadataBase: new URL('https://kalame.chat'),
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure params is properly awaited
  const { locale } = await Promise.resolve(params);
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <title>{defaultMetadata.title}</title>
        <meta name="description" content={defaultMetadata.description} />
        <link rel="icon" href="/kalame-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/kalame-logo.png" />
        <link rel="canonical" href="https://kalame.chat/" />
        <meta property="og:title" content={defaultMetadata.title} />
        <meta property="og:description" content={defaultMetadata.description} />
        <meta property="og:image" content="/kalame-logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kalame.chat/" />
        <meta property="og:site_name" content="کلمه | دستیار هوش مصنوعی" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={defaultMetadata.title} />
        <meta name="twitter:description" content={defaultMetadata.description} />
        <meta name="twitter:image" content="/kalame-logo.png" />
        <meta name="twitter:site" content="@kalamechat" />
      </head>
      <body className='overflow-x-hidden'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
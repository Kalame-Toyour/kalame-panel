import type { Metadata } from 'next';
import { routing } from '@/libs/i18nNavigation';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '../globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className='font-sans'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// --- SERVER LAYOUT (in a separate file, e.g. layout.server.tsx) ---
// import type { Metadata } from 'next';
// import { routing } from '@/libs/i18nNavigation';
// import { notFound } from 'next/navigation';
// import { NextIntlClientProvider } from 'next-intl';
// import { getMessages, setRequestLocale } from 'next-intl/server';
// import '../globals.css';
//
// export const metadata: Metadata = { ... };
//
// export function generateStaticParams() { ... }
//
// export default async function RootLayout({ children, params }) {
//   ...
//   return (
//     <html ...>
//       <head>...</head>
//       <body>
//         <NextIntlClientProvider ...>
//           <ClientLayout>{children}</ClientLayout>
//         </NextIntlClientProvider>
//       </body>
//     </html>
//   );
// }

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
      rel: 'icon',
      type: 'image/png',
      url: '/kalame-logo.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/kalame-logo.png',
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

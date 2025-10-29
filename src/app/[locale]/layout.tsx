import type { Metadata } from 'next';
import { routing } from '@/libs/i18nNavigation';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '../globals.css';
import ClientLayout from './ClientLayout';
import { getServerDynamicContent } from '@/utils/serverDynamicContent';
import { processMessagesWithDynamicContent } from '@/utils/processMessages';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getServerDynamicContent()
  
  return {
    title: content.title,
    description: content.description,
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
    openGraph: {
      title: content.title,
      description: content.description,
      url: `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}/`,
      siteName: `${content.brandName} | دستیار هوش مصنوعی`,
      images: [
        {
          url: content.logo,
          width: 512,
          height: 512,
          alt: `${content.brandName} | دستیار هوش مصنوعی`,
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [content.logo],
      site: content.brandName === 'کلمه' ? '@kalamechat' : '@okianai',
    },
    metadataBase: new URL(`https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}`),
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
  params: { locale: string };
}) {
  // Ensure params is properly awaited
  const { locale } = await Promise.resolve(params);
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const content = await getServerDynamicContent();
  
  // Get the domain from headers to process messages
  const headersList = await headers();
  const host = headersList.get('host') || 'okian.ai';
  const domain = host.replace(/^www\./, '');
  
  // Process messages to replace hardcoded brand names
  const processedMessages = processMessagesWithDynamicContent(messages, domain);

  return (
    <html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <title>{content.title}</title>
        <meta name="description" content={content.description} />
        <link rel="icon" href={content.favicon} type="image/png" />
        <link rel="apple-touch-icon" href={content.appleTouchIcon} />
        <link rel="canonical" href={`https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}/`} />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={content.description} />
        <meta property="og:image" content={content.logo} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}/`} />
        <meta property="og:site_name" content={`${content.brandName} | دستیار هوش مصنوعی`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.title} />
        <meta name="twitter:description" content={content.description} />
        <meta name="twitter:image" content={content.logo} />
        <meta name="twitter:site" content={content.brandName === 'کلمه' ? '@kalamechat' : '@okianai'} />
      </head>
      <body className='overflow-x-hidden'>
        <NextIntlClientProvider locale={locale} messages={processedMessages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
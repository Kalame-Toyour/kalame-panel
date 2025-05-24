'use client';

import Head from 'next/head';
import { useLocale, useTranslations } from 'next-intl';
import { locales } from './utils/format';

type SEOProps = {
  title?: string;
  description?: string;
  canonical?: string;
};

export default function SEOHead({
  title,
  description,
  canonical,
}: SEOProps) {
  const t = useTranslations('common');
  const locale = useLocale();

  // const pageTitle = title
  //   ? t('titleTemplate', { s: title })
  //   : t('defaultTitle');

  const pageDescription = description || t('error');

  const pageTitle = title;
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:locale" content={locale} />
      {canonical && <link rel="canonical" href={canonical} />}
      {locales.map(l => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`/${l}${canonical || ''}`}
        />
      ))}
    </Head>
  );
}

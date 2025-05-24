export const locales = ['en', 'es', 'fa'] as const;
export type Locale = (typeof locales)[number];

// export const {Link, redirect, usePathname, useRouter} =
//   createLocalizedPathnamesNavigation({locales});

export function formatPrice(price: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'en' ? 'USD' : 'EUR',
  }).format(price);
}

export function formatDate(date: string | Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));
}

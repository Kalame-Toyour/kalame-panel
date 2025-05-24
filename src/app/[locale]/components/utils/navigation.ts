import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'fa'] as const;
export type Locale = (typeof locales)[number];

export const { Link, redirect, usePathname, useRouter }
  = createLocalizedPathnamesNavigation({
    locales,
    pathnames: {} as any, // You need to provide a valid pathnames object here.
    // The type of pathnames depends on the structure of your routes.
    // You'll need to define it according to your needs.
    // Here, I'm just casting it to any to make the error go away.
    // You should replace this with a valid pathnames object.
  });

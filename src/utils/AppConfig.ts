import type { LocalePrefixMode } from 'node_modules/next-intl/dist/types/src/routing/types';

const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'Nextjs Starter',
  locales: ['fa', 'en', 'fr'],
  defaultLocale: 'fa',
  localePrefix,
  baseApiUrl: 'https://telegram.techxpro.online/kariz',
  authApiUrl: 'https://telegram.techxpro.online/auth',
  authApiUrl2: 'https://telegram.techxpro.online/auth',
  // authApiUrl2: 'https://api.kalame.chat/auth',

  mediaBaseUrl: 'https://media.kalame.chat',
};

import type { LocalePrefixMode } from 'node_modules/next-intl/dist/types/src/routing/types';

const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'Nextjs Starter',
  locales: ['fa', 'en', 'fr'],
  defaultLocale: 'fa',
  localePrefix,
  baseApiUrl: 'https://api.kalame.chat/kariz',
  authApiUrl: 'https://api.kalame.chat/auth',
  mediaBaseUrl: 'https://media.kalame.chat',
};

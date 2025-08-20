// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export const AppConfig = {
  name: 'Kariz Mobile',
  baseApiUrl: 'https://api.kalame.chat/kariz', // Always use production API
  authApiUrl: 'https://api.kalame.chat/auth',
  authApiUrl2: 'https://api.kalame.chat/auth',
  mediaBaseUrl: 'https://media.kalame.chat',
  appUrl: 'https://kalame.chat',
}; 
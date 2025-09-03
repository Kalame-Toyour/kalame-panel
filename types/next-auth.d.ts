import 'next-auth';
import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      accessToken?: string;
      refreshToken?: string;
      premium?: 'yes' | 'no';
      premiumExpireTime?: string;
      credit?: number;
      expiresAt?: number;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    premium?: 'yes' | 'no';
    premiumExpireTime?: string;
    credit?: number;
    expiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    premium?: 'yes' | 'no';
    premiumExpireTime?: string;
    credit?: number;
    expiresAt?: number;
  }
} 
import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      mobile?: string | null;
      status?: string | null;
      authSource?: string;
      googleAuthId?: string;
      accessToken?: string;
      refreshToken?: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username?: string | null;
    mobile?: string | null;
    status?: string | null;
    authSource?: string;
    googleAuthId?: string;
    accessToken?: string;
    refreshToken?: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    username?: string | null;
    mobile?: string | null;
    status?: string | null;
    authSource?: string;
    googleAuthId?: string;
    accessToken?: string;
    refreshToken?: string;
    image?: string;
  }
}

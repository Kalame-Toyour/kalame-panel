import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { AppConfig } from '@/utils/AppConfig';

export type AuthUser = {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  image?: string;
  expiresAt?: number;
  error?: string;
  credit?: number;
  premium?: 'yes' | 'no';
  premiumExpireTime?: string;
};

const config = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: 'jwt',
    maxAge: 60 * 24 * 60 * 60, // 60 days - longer than token expiration to allow refresh
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
        userId: { label: 'User ID', type: 'text' },
        username: { label: 'Username', type: 'text' },
        expireAt: { label: 'Expire At', type: 'text' },
        premium: { label: 'Premium', type: 'text' },
        premiumExpireTime: { label: 'Premium Expire Time', type: 'text' },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials) return null;
        const {
          phone,
          password,
          accessToken,
          refreshToken,
          userId,
          username,
          expireAt,
          premium,
          premiumExpireTime,
        } = credentials as {
          phone?: string;
          password: string;
          accessToken?: string;
          refreshToken?: string;
          userId?: string | number;
          username?: string;
          expireAt?: string;
          premium?: 'yes' | 'no';
          premiumExpireTime?: string;
        };

        // If we have tokens and user data, use them directly
        if (accessToken && userId && username) {
          return {
            id: userId.toString(),
            name: username,
            accessToken,
            refreshToken: refreshToken || '',
            image: undefined,
            expiresAt: expireAt ? new Date(expireAt).getTime() : Date.now() + 60 * 60 * 1000, // fallback: 1h
            premium: premium || 'no',
            premiumExpireTime: premiumExpireTime,
          };
        }

        // Otherwise, authenticate with phone and password or code
        if (!password || !phone) return null;

        try {
          const response = await fetch(`${AppConfig.authApiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phone, pass: password }),
          });
          const data = await response.json();

          // Accept both password and code login
          if (response.ok && data.accessToken && data.needUserData) {
            return {
              id: data.needUserData.ID?.toString() || data.needUserData.id?.toString() || '',
              name: data.needUserData.username,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || '',
              image: undefined,
              expiresAt: data.needUserData.expireAt ? new Date(data.needUserData.expireAt).getTime() : Date.now() + 60 * 60 * 1000,
              credit: data.needUserData.credit,
              premium: data.needUserData.premium || 'no',
              premiumExpireTime: data.needUserData.premium_expiretime,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        const authUser = user as AuthUser;
        return {
          ...token,
          id: authUser.id,
          name: authUser.name,
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          picture: authUser.image,
          expiresAt: authUser.expiresAt,
          error: undefined,
          credit: authUser.credit,
          premium: authUser.premium,
          premiumExpireTime: authUser.premiumExpireTime,
        };
      }

      // Return previous token if the access token has not expired yet
      // Add a 5-minute buffer to refresh tokens before they expire
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      if (typeof token.expiresAt === 'number' && Date.now() < (token.expiresAt - bufferTime)) {
        return token;
      }

      // Access token has expired or is close to expiring, try to update it
      if (token.refreshToken) {
        console.log('Token expired or close to expiring, attempting refresh...');
        const refreshedToken = await refreshAccessToken(token);
        
        if (refreshedToken.error) {
          console.error('Token refresh failed:', refreshedToken.error);
          return {
            ...token,
            error: refreshedToken.error,
          };
        }
        
        return {
          ...token,
          ...refreshedToken,
        };
      }

      // No refresh token available, return token with error
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    },
    async session({ session, token }) {
      console.log('Session callback:', {
        hasToken: !!token,
        tokenId: token.id,
        tokenName: token.name,
        tokenError: token.error,
        tokenExpiresAt: token.expiresAt ? new Date(token.expiresAt).toISOString() : 'No expiration',
        timeLeft: token.expiresAt ? token.expiresAt - Date.now() : 'No expiration',
      });
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          image: token.picture as string | undefined,
          expiresAt: token.expiresAt as number,
          credit: token.credit as number | undefined,
          premium: token.premium as 'yes' | 'no' | undefined,
          premiumExpireTime: token.premiumExpireTime as string | undefined,
        } as AuthUser,
        error: token.error as string | undefined,
      };
    },
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(config);

// Helper to refresh access token
async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    console.log('Attempting to refresh token...');
    
    const response = await fetch(`${AppConfig.authApiUrl}/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    })

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      console.error('Unexpected response (not JSON):', text)
      return { error: 'RefreshAccessTokenError', detail: 'Response is not JSON', responseText: text }
    }

    const data = await response.json()
    console.log('Refresh token response:', { status: response.status, hasAccessToken: !!data.accessToken, hasUserData: !!data.needUserData })

    if (!response.ok || !data.accessToken || !data.needUserData) {
      console.error('Refresh token failed:', { status: response.status, data })
      return { error: 'RefreshAccessTokenError', detail: data }
    }

    const newExpiresAt = data.needUserData.expireAt ? new Date(data.needUserData.expireAt).getTime() : undefined
    console.log('Token refreshed successfully:', {
      newExpiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : 'No expiration',
      timeLeft: newExpiresAt ? newExpiresAt - Date.now() : 'No expiration',
    })

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      expiresAt: newExpiresAt,
      error: undefined,
      credit: data.needUserData.credit,
      premium: data.needUserData.premium ?? token.premium,
      premiumExpireTime: data.needUserData.premium_expiretime ?? token.premiumExpireTime,
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return { error: 'RefreshAccessTokenError', detail: error instanceof Error ? error.message : String(error) }
  }
}

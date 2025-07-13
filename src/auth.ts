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
};

const config = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        expiresAt: { label: 'Expires At', type: 'text' },
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
          expiresAt,
        } = credentials as {
          phone?: string;
          password: string;
          accessToken?: string;
          refreshToken?: string;
          userId?: string | number;
          username?: string;
          expiresAt?: number;
        };
        
        // If we have tokens and user data, use them directly
        if (accessToken && refreshToken && userId && username) {
          console.log('Using provided tokens for authentication');
          return {
            id: userId.toString(),
            name: username,
            accessToken,
            refreshToken,
            image: undefined,
            expiresAt: expiresAt ?? (Date.now() + 3600 * 1000),
          };
        }
        
        // Otherwise, authenticate with phone and password
        if (!password || !phone) return null;
        
        try {
          console.log('Authenticating with phone and password');
          const response = await fetch(`${AppConfig.authApiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phone, pass: password }),
          });
          const data = await response.json();
          
          if (!response.ok || !data.accessToken || !data.needUserData) {
            console.error('Authentication failed:', data);
            return null;
          }
          
          console.log('Authentication successful');
          return {
            id: data.needUserData.ID.toString(),
            name: data.needUserData.username,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            image: undefined,
            expiresAt: Date.now() + ((data.expiresIn ?? 36000) * 1000),
            credit: data.needUserData.credit,
          };
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
        console.log('JWT callback - initial sign in:', { id: authUser.id, name: authUser.name });
        return {
          ...token,
          id: authUser.id,
          name: authUser.name,
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          picture: authUser.image,
          expiresAt: authUser.expiresAt ?? (Date.now() + 3600 * 1000),
          error: undefined,
          credit: authUser.credit,
        };
      }

      // Return previous token if the access token has not expired yet
      if (typeof token.expiresAt === 'number' && Date.now() < token.expiresAt) {
        console.log('JWT callback - token still valid');
        return token;
      }

      // Access token has expired, try to update it
      console.log('Token expired, refreshing...');
      const refreshedToken = await refreshAccessToken(token);
      return {
        ...token,
        ...refreshedToken,
      };
    },
    async session({ session, token }) {
      console.log('Session callback - token:', { id: token.id, name: token.name, error: token.error });
      
      if (token.error) {
        console.error('Session error:', token.error);
      }
      
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
    console.log('Refreshing access token...');
    const response = await fetch(`${AppConfig.authApiUrl}/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });
    const data = await response.json();
    
    // اگر refreshToken جدید در پاسخ بود، آن را ذخیره کن. اگر نبود، مقدار قبلی را نگه دار.
    if (!response.ok || !data.accessToken) {
      console.error('Failed to refresh token:', data);
      return { error: 'RefreshAccessTokenError' };
    }
    
    console.log('Token refreshed successfully');
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      expiresAt: Date.now() + ((data.expiresIn ?? 3600) * 1000),
      error: undefined,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { error: 'RefreshAccessTokenError' };
  }
}

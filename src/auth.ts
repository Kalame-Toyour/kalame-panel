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
};

const config = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
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
        if (accessToken && refreshToken && userId && username) {
          return {
            id: userId.toString(),
            name: username,
            accessToken,
            refreshToken,
            image: undefined,
            expiresAt: expiresAt ?? (Date.now() + 3600 * 1000),
          };
        }
        if (!password || !phone) return null;
        try {
          const response = await fetch(`${AppConfig.authApiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phone, pass: password }),
          });
          const data = await response.json();
          if (!response.ok || !data.accessToken || !data.needUserData) return null;
          return {
            id: data.needUserData.ID.toString(),
            name: data.needUserData.username,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            image: undefined,
            expiresAt: Date.now() + ((data.expiresIn ?? 3600) * 1000),
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.id = authUser.id;
        token.name = authUser.name;
        token.accessToken = authUser.accessToken;
        token.refreshToken = authUser.refreshToken;
        token.picture = authUser.image;
        token.expiresAt = authUser.expiresAt ?? (Date.now() + 3600 * 1000);
        token.error = undefined;
      }
      if (typeof token.expiresAt === 'number' && Date.now() > token.expiresAt) {
        return await refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          image: token.picture,
          expiresAt: token.expiresAt,
        } as AuthUser,
        error: token.error,
      };
    },
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(config);

// Helper to refresh access token
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${AppConfig.authApiUrl}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });
    const data = await response.json();
    if (!response.ok || !data.accessToken) throw new Error('Failed to refresh token');
    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      expiresAt: Date.now() + ((data.expiresIn ?? 3600) * 1000),
      error: undefined,
    };
  } catch (error) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

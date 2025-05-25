import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export type AuthUser = {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  image?: string;
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
        } = credentials as {
          phone?: string;
          password: string;
          accessToken?: string;
          refreshToken?: string;
          userId?: string | number;
          username?: string;
        };
        if (accessToken && refreshToken && userId && username) {
          // Directly use provided tokens and user data (from registration)
          return {
            id: userId.toString(),
            name: username,
            accessToken,
            refreshToken,
            image: undefined,
          };
        }
        if (!password || !phone) return null;
        try {
          // Call Talaat API for login
          const response = await fetch('https://api.kalame.chat/auth/login', {
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
        } as AuthUser,
      };
    },
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(config);

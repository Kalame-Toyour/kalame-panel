// import { user } from '@/models/Schema';
// import { DrizzleAdapter } from '@auth/drizzle-adapter';
// import { compare } from 'bcryptjs';
// import { eq } from 'drizzle-orm';
// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { Account, Profile, User } from 'next-auth';

// Log environment variables
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_URL_INTERNAL:', process.env.NEXTAUTH_URL_INTERNAL);

// export const auth = NextAuth({
//   adapter: DrizzleAdapter(db),
//   session: { strategy: 'jwt' },
//   pages: {
//     signIn: '/auth/login',
//     error: '/auth/error',
//   },
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     Credentials({
//       async authorize(credentials) {
//         if (!credentials?.password || (!credentials.email && !credentials.phone)) {
//           return null;
//         }

//         const [existingUser] = await db
//           .select()
//           .from(user)
//           .where(
//             credentials.email
//               ? eq(user.email, credentials.email)
//               : eq(user.mobile, credentials.phone),
//           )
//           .limit(1);

//         if (!existingUser?.password) {
//           return null;
//         }

//         const passwordMatch = await compare(
//           credentials.password + (existingUser.salt || ''),
//           existingUser.password,
//         );

//         if (!passwordMatch) {
//           return null;
//         }

//         return {
//           id: existingUser.id.toString(),
//           email: existingUser.email || null,
//           username: existingUser.username || null,
//           mobile: existingUser.mobile || null,
//           status: existingUser.status || null,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (user) {
//         token.id = user.id;
//         token.username = user.username;
//         token.mobile = user.mobile;
//         token.status = user.status;
//       }

//       if (account?.provider === 'google') {
//         token.authSource = 'google';
//         token.googleAuthId = account.providerAccountId;
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: token.id,
//           username: token.username,
//           mobile: token.mobile,
//           status: token.status,
//           authSource: token.authSource,
//           googleAuthId: token.googleAuthId,
//         },
//       };
//     },
//   },
// });

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  callbacks: {
    async jwt(params) {
      const { token, account, user } = params;
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  server: {
    DATABASE_URL: z.string().optional(),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    TIME_ZONE: z.string().min(1),
    COINGECKO_API_KEYS: z.string().transform(val => val.split(',')),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DATABASE_URL: process.env.DATABASE_URL,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    TIME_ZONE: process.env.TIME_ZONE,
    COINGECKO_API_KEYS: process.env.COINGECKO_API_KEYS,
  },
});

// CronJob ENv
// import path from 'path';
// import dotenv from 'dotenv';
// import { z } from 'zod';

// // Load environment variables from .env.local
// dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// // Validation schema
// const envSchema = z.object({
//   // Database configuration
//   DATABASE_URL: z.string(),
//   DB_PASSWORD: z.string(),
//   DB_NAME: z.string(),
//   DB_USER: z.string(),

//   // Auth configuration
//   NEXTAUTH_SECRET: z.string(),
//   NEXTAUTH_URL: z.string(),

//   // App configuration
//   TIME_ZONE: z.string(),
//   NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
//   NEXT_PUBLIC_APP_URL: z.string().optional(),
//   LOGTAIL_SOURCE_TOKEN: z.string().optional(),

//   // CoinGecko API keys
//   COINGECKO_API_KEYS: z.string().transform(val => val.split(',')),
// });

// // Validate and parse environment variables
// export const Env = envSchema.parse({
//   // Database configuration
//   DATABASE_URL: process.env.DATABASE_URL,
//   DB_PASSWORD: process.env.DB_PASSWORD,
//   DB_NAME: process.env.DB_NAME,
//   DB_USER: process.env.DB_USER,

//   // Auth configuration
//   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
//   NEXTAUTH_URL: process.env.NEXTAUTH_URL,

//   // App configuration
//   TIME_ZONE: process.env.TIME_ZONE,
//   NODE_ENV: process.env.NODE_ENV,
//   NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
//   LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,

//   // CoinGecko API keys
//   COINGECKO_API_KEYS: process.env.COINGECKO_API_KEYS || '',
// });

// // Export types
// export type EnvType = z.infer<typeof envSchema>;

// Older
// import path from 'node:path';
// import dotenv from 'dotenv';
// import { z } from 'zod';

// // Load environment variables
// dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// // Validation schema
// const envSchema = z.object({
//   COINGECKO_API_KEY_1: z.string(),
//   COINGECKO_API_KEY_2: z.string().optional(),
//   DATABASE_URL: z.string(),
//   DB_PASSWORD: z.string(),
//   DB_NAME: z.string(),
//   DB_USER: z.string(),
// });

// // Validate and parse environment variables
// export const Env = envSchema.parse({
//   COINGECKO_API_KEY_1: process.env.COINGECKO_API_KEY_1,
//   COINGECKO_API_KEY_2: process.env.COINGECKO_API_KEY_2,
//   DATABASE_URL: process.env.DATABASE_URL,
//   DB_PASSWORD: process.env.DB_PASSWORD,
//   DB_NAME: process.env.DB_NAME,
//   DB_USER: process.env.DB_USER,
// });

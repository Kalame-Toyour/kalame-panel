import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv } from '@t3-oss/env-nextjs';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
dotenv.config({
  path: path.resolve(__dirname, '.env.local'),
});

export const env = createEnv({
  server: {
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    TIME_ZONE: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    TIME_ZONE: process.env.TIME_ZONE,
  },
});

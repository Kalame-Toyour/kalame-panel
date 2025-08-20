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
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_USER: z.string(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string(),
    TIME_ZONE: z.string(),
  },
  client: {},
  runtimeEnv: process.env,
});

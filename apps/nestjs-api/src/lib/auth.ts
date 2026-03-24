import { betterAuth } from 'better-auth';
import { bearer, openAPI, twoFactor } from 'better-auth/plugins';
import { dash } from '@better-auth/infra';
import { Pool } from 'pg';
import { passwordHistory } from './plugins/password-history.ts';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3002', 'http://localhost:3001'],
  rateLimit: {
    window: 10, // 10 seconds
    max: 2, // limit each IP to 5 requests per window
    enabled: true,
    storage: 'memory',
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    twoFactor(),
    openAPI(),
    passwordHistory(),
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY as string,
    }),
    bearer({
      requireSignature: true,
    }),
  ],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

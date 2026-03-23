import { betterAuth } from 'better-auth';
import { openAPI, twoFactor } from 'better-auth/plugins';
import { Pool } from 'pg';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000', 'http://localhost:3001'],

  emailAndPassword: {
    enabled: true,
  },
  plugins: [twoFactor(), openAPI()],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

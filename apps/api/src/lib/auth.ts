import { betterAuth } from 'better-auth';
import { openAPI, twoFactor } from 'better-auth/plugins';
import { Pool } from 'pg';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  rateLimit: {
    window: 10, // 10 seconds
    max: 2, // limit each IP to 5 requests per window
    enabled: true,
    storage: 'memory',
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [twoFactor(), openAPI()],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

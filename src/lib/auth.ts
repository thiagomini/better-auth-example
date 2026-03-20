import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
  },

  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

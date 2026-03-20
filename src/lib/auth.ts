import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
  },
});

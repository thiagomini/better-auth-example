import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';
import { dashClient } from '@better-auth/infra/client';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/two-factor';
      },
    }),
    dashClient(),
  ],
});

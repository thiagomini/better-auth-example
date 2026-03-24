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
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem('bearer_token') || '',
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get('set-auth-token');
      if (authToken) {
        localStorage.setItem('bearer_token', authToken);
      }
    },
  },
});

import type { BetterAuthPlugin } from 'better-auth';
import {
  createAuthMiddleware,
  APIError,
  getSessionFromCtx,
} from 'better-auth/api';

export interface PasswordHistoryOptions {
  maxHistory?: number;
}

export const passwordHistory = (options?: PasswordHistoryOptions) => {
  const maxHistory = options?.maxHistory ?? 4;

  async function checkAndRecordHistory(
    ctx: Parameters<Parameters<typeof createAuthMiddleware>[0]>[0],
    userId: string,
    newPassword: string,
  ) {
    const accounts = await ctx.context.internalAdapter.findAccounts(userId);
    const credentialAccount = accounts.find(
      (a) => a.providerId === 'credential' && a.password,
    );

    // Check new password against current password hash
    if (credentialAccount?.password) {
      const matchesCurrent = await ctx.context.password.verify({
        hash: credentialAccount.password,
        password: newPassword,
      });
      if (matchesCurrent) {
        throw new APIError('BAD_REQUEST', {
          message: 'PASSWORD_PREVIOUSLY_USED',
        });
      }
    }

    // Check new password against stored password history
    const history = await ctx.context.adapter.findMany<{
      id: string;
      passwordHash: string;
    }>({
      model: 'passwordHistory',
      where: [{ field: 'userId', value: userId }],
      sortBy: { field: 'createdAt', direction: 'desc' },
      limit: maxHistory,
    });

    for (const entry of history) {
      const matches = await ctx.context.password.verify({
        hash: entry.passwordHash,
        password: newPassword,
      });
      if (matches) {
        throw new APIError('BAD_REQUEST', {
          message: 'PASSWORD_PREVIOUSLY_USED',
        });
      }
    }

    // Store the current (about-to-be-replaced) password hash in history
    if (credentialAccount?.password) {
      await ctx.context.adapter.create({
        model: 'passwordHistory',
        data: {
          userId,
          passwordHash: credentialAccount.password,
          createdAt: new Date(),
        },
      });

      // Trim history to keep only maxHistory entries
      const allHistory = await ctx.context.adapter.findMany<{ id: string }>({
        model: 'passwordHistory',
        where: [{ field: 'userId', value: userId }],
        sortBy: { field: 'createdAt', direction: 'desc' },
      });

      if (allHistory.length > maxHistory) {
        for (const old of allHistory.slice(maxHistory)) {
          await ctx.context.adapter.delete({
            model: 'passwordHistory',
            where: [{ field: 'id', value: old.id }],
          });
        }
      }
    }
  }

  return {
    id: 'password-history',
    schema: {
      passwordHistory: {
        fields: {
          userId: {
            type: 'string' as const,
            required: true,
            references: {
              model: 'user',
              field: 'id',
              onDelete: 'cascade' as const,
            },
            index: true,
          },
          passwordHash: {
            type: 'string' as const,
            required: true,
            returned: false,
          },
          createdAt: {
            type: 'date' as const,
            required: true,
          },
        },
      },
    },
    hooks: {
      before: [
        {
          matcher: (context) => context.path === '/change-password',
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) {
              return { context: ctx };
            }

            const { newPassword, currentPassword } = ctx.body as {
              newPassword: string;
              currentPassword: string;
            };

            // Verify current password first — if invalid, skip and let the
            // endpoint return its own error so we don't store a history entry
            // for a failed attempt.
            const accounts = await ctx.context.internalAdapter.findAccounts(
              session.user.id,
            );
            const credentialAccount = accounts.find(
              (a) => a.providerId === 'credential' && a.password,
            );
            if (!credentialAccount?.password) {
              return { context: ctx };
            }

            const currentValid = await ctx.context.password.verify({
              hash: credentialAccount.password,
              password: currentPassword,
            });
            if (!currentValid) {
              return { context: ctx };
            }

            await checkAndRecordHistory(ctx, session.user.id, newPassword);
            return { context: ctx };
          }),
        },
        {
          matcher: (context) => context.path === '/reset-password',
          handler: createAuthMiddleware(async (ctx) => {
            const body = ctx.body as {
              newPassword: string;
              token?: string;
            };
            const token =
              body.token ??
              (ctx as unknown as { query?: { token?: string } }).query?.token;
            if (!token) {
              return { context: ctx };
            }

            const verification =
              await ctx.context.internalAdapter.findVerificationValue(
                `reset-password:${token}`,
              );
            if (!verification || verification.expiresAt < new Date()) {
              return { context: ctx };
            }

            await checkAndRecordHistory(
              ctx,
              verification.value,
              body.newPassword,
            );
            return { context: ctx };
          }),
        },
      ],
    },
    $ERROR_CODES: {
      PASSWORD_PREVIOUSLY_USED: {
        message: 'The new password matches a recently used password.',
        code: 'PASSWORD_PREVIOUSLY_USED',
      },
    },
  } satisfies BetterAuthPlugin;
};

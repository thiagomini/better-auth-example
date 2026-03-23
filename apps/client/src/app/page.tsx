'use client';

import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <p>Loading...</p>;

  if (!session) {
    return (
      <div>
        <h1>Better Auth Example</h1>
        <p>You are not signed in.</p>
        <nav style={{ display: 'flex', gap: 16 }}>
          <Link href="/sign-in">Sign In</Link>
          <Link href="/sign-up">Sign Up</Link>
        </nav>
      </div>
    );
  }

  return (
    <div>
      <h1>Better Auth Example</h1>
      <p>
        Signed in as <strong>{session.user.email}</strong>
      </p>
      <p>
        Name: {session.user.name} | 2FA:{' '}
        {session.user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
      </p>
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link href="/dashboard">Dashboard</Link>
        <button
          onClick={async () => {
            await authClient.signOut();
          }}
        >
          Sign Out
        </button>
      </nav>
    </div>
  );
}

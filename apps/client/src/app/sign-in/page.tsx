'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: err } = await authClient.signIn.email(
      { email, password },
      {
        onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            setNeeds2FA(true);
            setLoading(false);
            return;
          }
          router.push('/');
        },
      },
    );
    if (err) {
      setError(err.message ?? 'Sign in failed');
    }
    setLoading(false);
  }

  async function handleVerifyTotp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: err } = await authClient.twoFactor.verifyTotp({
      code: totpCode,
    });
    if (err) {
      setError(err.message ?? 'Verification failed');
      setLoading(false);
      return;
    }
    router.push('/');
  }

  if (needs2FA) {
    return (
      <div>
        <h1>Two-Factor Verification</h1>
        <p>Enter the code from your authenticator app.</p>
        <form onSubmit={handleVerifyTotp}>
          <div style={{ marginBottom: 12 }}>
            <label>
              TOTP Code
              <br />
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                autoFocus
                maxLength={6}
                style={{ padding: 8, width: '100%' }}
              />
            </label>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Email
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: 8, width: '100%' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Password
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: 8, width: '100%' }}
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p>
        Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
      </p>
    </div>
  );
}

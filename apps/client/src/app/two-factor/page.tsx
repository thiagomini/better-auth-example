'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function TwoFactor() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await authClient.twoFactor.verifyTotp({
      code,
    });
    if (err) {
      setError(err.message ?? 'Verification failed');
      setLoading(false);
      return;
    }
    router.push('/');
  }

  return (
    <div>
      <h1>Two-Factor Verification</h1>
      <p>Enter the 6-digit code from your authenticator app.</p>
      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
            maxLength={6}
            placeholder="000000"
            style={{
              padding: 8,
              width: '100%',
              fontSize: 24,
              textAlign: 'center',
              letterSpacing: 8,
            }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}

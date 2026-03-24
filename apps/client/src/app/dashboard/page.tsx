'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [password, setPassword] = useState('');
  const [totpURI, setTotpURI] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isPending) return <p>Loading...</p>;
  if (!session) {
    router.push('/sign-in');
    return null;
  }

  async function handleEnable2FA(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { data, error: err } = await authClient.twoFactor.enable({
      password,
    });

    if (err) {
      setError(err.message ?? 'Failed to enable 2FA');
      setLoading(false);
      return;
    }

    if (data) {
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes);
      setMessage(
        '2FA enabled! Scan the URI below with your authenticator app, then verify a code.',
      );
    }
    setLoading(false);
  }

  async function handleVerifyTotp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
    });

    if (err) {
      setError(err.message ?? 'Verification failed');
      setLoading(false);
      return;
    }

    setMessage('2FA verified and fully active!');
    setTotpURI('');
    setVerifyCode('');
    setLoading(false);
  }

  async function handleDisable2FA() {
    const pw = prompt('Enter your password to disable 2FA:');
    if (!pw) return;
    setError('');
    setLoading(true);

    const { error: err } = await authClient.twoFactor.disable({
      password: pw,
    });

    if (err) {
      setError(err.message ?? 'Failed to disable 2FA');
      setLoading(false);
      return;
    }

    setMessage('2FA disabled.');
    setTotpURI('');
    setBackupCodes([]);
    setLoading(false);
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <section
        style={{
          marginBottom: 24,
          padding: 16,
          border: '1px solid #ccc',
          borderRadius: 8,
        }}
      >
        <h2>Profile</h2>
        <p>
          <strong>Name:</strong> {session.user.name}
        </p>
        <p>
          <strong>Email:</strong> {session.user.email}
        </p>
        <p>
          <strong>2FA:</strong>{' '}
          {session.user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
        </p>
      </section>

      <section
        style={{
          marginBottom: 24,
          padding: 16,
          border: '1px solid #ccc',
          borderRadius: 8,
        }}
      >
        <h2>Two-Factor Authentication</h2>

        {!session.user.twoFactorEnabled && !totpURI && (
          <form onSubmit={handleEnable2FA}>
            <p>Enable 2FA to secure your account.</p>
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
            <button type="submit" disabled={loading}>
              {loading ? 'Enabling...' : 'Enable 2FA'}
            </button>
          </form>
        )}

        {totpURI && (
          <div>
            <p>
              <strong>TOTP URI</strong> (paste into your authenticator app):
            </p>
            <code
              style={{
                wordBreak: 'break-all',
                display: 'block',
                padding: 8,
                background: '#f5f5f5',
                borderRadius: 4,
                marginBottom: 12,
              }}
            >
              {totpURI}
            </code>

            {backupCodes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p>
                  <strong>Backup Codes</strong> (save these somewhere safe):
                </p>
                <pre
                  style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}
                >
                  {backupCodes.join('\n')}
                </pre>
              </div>
            )}

            <form onSubmit={handleVerifyTotp}>
              <p>Enter a code from your authenticator to complete setup:</p>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  required
                  maxLength={6}
                  placeholder="000000"
                  style={{ padding: 8, width: '100%' }}
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Activate'}
              </button>
            </form>
          </div>
        )}

        {session.user.twoFactorEnabled && !totpURI && (
          <div>
            <p>2FA is active on your account.</p>
            <button onClick={handleDisable2FA} disabled={loading}>
              Disable 2FA
            </button>
          </div>
        )}
      </section>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <nav style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <Link href="/dashboard/change-password">Change Password</Link>
        <Link href="/">Home</Link>
        <button onClick={handleSignOut}>Sign Out</button>
      </nav>
    </div>
  );
}

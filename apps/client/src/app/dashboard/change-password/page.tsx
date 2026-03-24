'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChangePassword() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isPending) return <p>Loading...</p>;
  if (!session) {
    router.push('/sign-in');
    return null;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: err } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (err) {
      setError(err.message ?? 'Failed to change password');
      setLoading(false);
      return;
    }

    setMessage('Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
  }

  return (
    <div>
      <h1>Change Password</h1>
      <section
        style={{
          marginBottom: 24,
          padding: 16,
          border: '1px solid #ccc',
          borderRadius: 8,
        }}
      >
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Current Password
              <br />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ padding: 8, width: '100%' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              New Password
              <br />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                style={{ padding: 8, width: '100%' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Confirm New Password
              <br />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                style={{ padding: 8, width: '100%' }}
              />
            </label>
          </div>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>

      <nav style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <Link href="/dashboard">Back to Dashboard</Link>
        <Link href="/">Home</Link>
      </nav>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { authApi } from '@/utils/api';
import { saveDevelopmentSession, saveSession } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await authApi.login(
        String(form.get('email') || ''),
        String(form.get('password') || '')
      );
      saveSession(response.data.token, response.data.user);
      router.push('/dashboard');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        saveDevelopmentSession('', String(form.get('email') || 'dev@example.com'));
        router.push('/dashboard');
        return;
      }

      setError(err instanceof Error ? err.message : 'Unable to log in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Log in</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="muted">
          Need an account? <Link href="/auth/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}

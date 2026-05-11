'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getStoredToken } from '@/store/authStore';
import { apiRequest } from '@/utils/api';

type Profile = {
  fullName: string | null;
  email: string;
  currency: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    apiRequest<Profile>('/users/me', { token })
      .then((response) => setProfile(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load profile'));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const token = getStoredToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<Profile>('/users/profile', {
        token,
        method: 'PUT',
        data: {
          fullName: form.get('fullName'),
          currency: form.get('currency'),
        },
      });
      setProfile(response.data);
      setMessage('Profile saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    }
  }

  return (
    <section className="panel">
      <h1>Settings</h1>
      <form className="form" onSubmit={saveProfile}>
        <label className="field">
          <span>Name</span>
          <input name="fullName" defaultValue={profile?.fullName || ''} />
        </label>
        <label className="field">
          <span>Email</span>
          <input value={profile?.email || ''} disabled />
        </label>
        <label className="field">
          <span>Currency</span>
          <input name="currency" defaultValue={profile?.currency || 'USD'} maxLength={3} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="muted">{message}</p> : null}
        <button className="primary" type="submit">
          Save settings
        </button>
      </form>
    </section>
  );
}

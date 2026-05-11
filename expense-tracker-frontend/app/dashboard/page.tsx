'use client';

import { useEffect, useState } from 'react';
import { getStoredToken } from '@/store/authStore';
import { apiRequest } from '@/utils/api';

type Summary = {
  totalExpensesThisMonth: number;
  expenseCountThisMonth: number;
  activeBudgets: number;
  budgetsOverLimit: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    apiRequest<Summary>('/users/summary/dashboard', { token })
      .then((response) => setSummary(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard'));
  }, []);

  return (
    <section className="grid">
      <article className="panel">
        <div className="muted">This month</div>
        <p className="metric">${summary?.totalExpensesThisMonth?.toFixed(2) || '0.00'}</p>
      </article>
      <article className="panel">
        <div className="muted">Expenses</div>
        <p className="metric">{summary?.expenseCountThisMonth || 0}</p>
      </article>
      <article className="panel">
        <div className="muted">Active budgets</div>
        <p className="metric">{summary?.activeBudgets || 0}</p>
      </article>
      <article className="panel">
        <div className="muted">Over limit</div>
        <p className="metric">{summary?.budgetsOverLimit || 0}</p>
      </article>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}

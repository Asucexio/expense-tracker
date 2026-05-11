'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getStoredToken } from '@/store/authStore';
import { apiRequest } from '@/utils/api';

type Category = {
  id: string;
  name: string;
};

type Budget = {
  id: string;
  monthly_limit: string;
  spent: string;
  category_name: string;
};

export default function BudgetsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState('');

  async function loadData() {
    const token = getStoredToken();
    if (!token) return;

    const [categoryResponse, budgetResponse] = await Promise.all([
      apiRequest<Category[]>('/categories', { token }),
      apiRequest<Budget[]>('/budgets', { token }),
    ]);

    setCategories(categoryResponse.data);
    setBudgets(budgetResponse.data);
  }

  useEffect(() => {
    loadData().catch((err) =>
      setError(err instanceof Error ? err.message : 'Unable to load budgets')
    );
  }, []);

  async function addBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const token = getStoredToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);

    try {
      await apiRequest('/budgets', {
        token,
        method: 'POST',
        data: {
          categoryId: form.get('categoryId'),
          monthlyLimit: Number(form.get('monthlyLimit')),
          alertThreshold: Number(form.get('alertThreshold') || 80),
          monthYear: form.get('monthYear'),
        },
      });
      event.currentTarget.reset();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add budget');
    }
  }

  return (
    <div className="grid">
      <section className="panel">
        <h1>Add budget</h1>
        <form className="form" onSubmit={addBudget}>
          <label className="field">
            <span>Category</span>
            <select name="categoryId" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Monthly limit</span>
            <input name="monthlyLimit" type="number" min="0.01" step="0.01" required />
          </label>
          <label className="field">
            <span>Alert threshold</span>
            <input name="alertThreshold" type="number" min="1" max="100" defaultValue="80" />
          </label>
          <label className="field">
            <span>Month</span>
            <input name="monthYear" type="date" required />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="primary" type="submit">
            Save budget
          </button>
        </form>
      </section>

      <section className="panel">
        <h1>Budgets</h1>
        <table>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget.id}>
                <td>{budget.category_name}</td>
                <td>${Number(budget.spent).toFixed(2)} spent</td>
                <td>${Number(budget.monthly_limit).toFixed(2)} limit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getStoredToken } from '@/store/authStore';
import { apiRequest } from '@/utils/api';

type Category = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  amount: string;
  description: string | null;
  date: string;
  category_name: string;
};

export default function ExpensesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState('');

  async function loadData() {
    const token = getStoredToken();
    if (!token) return;

    const [categoryResponse, expenseResponse] = await Promise.all([
      apiRequest<Category[]>('/categories', { token }),
      apiRequest<Expense[]>('/expenses', { token }),
    ]);

    setCategories(categoryResponse.data);
    setExpenses(expenseResponse.data);
  }

  useEffect(() => {
    loadData().catch((err) =>
      setError(err instanceof Error ? err.message : 'Unable to load expenses')
    );
  }, []);

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const token = getStoredToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);

    try {
      await apiRequest('/expenses', {
        token,
        method: 'POST',
        data: {
          categoryId: form.get('categoryId'),
          amount: Number(form.get('amount')),
          description: form.get('description'),
          paymentMethod: form.get('paymentMethod'),
          date: form.get('date'),
        },
      });
      event.currentTarget.reset();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add expense');
    }
  }

  return (
    <div className="grid">
      <section className="panel">
        <h1>Add expense</h1>
        <form className="form" onSubmit={addExpense}>
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
            <span>Amount</span>
            <input name="amount" type="number" min="0.01" step="0.01" required />
          </label>
          <label className="field">
            <span>Date</span>
            <input name="date" type="date" required />
          </label>
          <label className="field">
            <span>Description</span>
            <input name="description" />
          </label>
          <label className="field">
            <span>Payment method</span>
            <input name="paymentMethod" />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="primary" type="submit">
            Save expense
          </button>
        </form>
      </section>

      <section className="panel">
        <h1>Recent expenses</h1>
        <table>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.description || expense.category_name}</td>
                <td>{expense.category_name}</td>
                <td>${Number(expense.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

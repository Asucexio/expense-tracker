'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchData();
  }, [filters.categoryId, filters.startDate, filters.endDate, filters.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes] = await Promise.all([
        apiClient.get('/expenses', { params: filters }),
        apiClient.get('/categories'),
      ]);

      setExpenses(expensesRes.data.data.expenses);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await apiClient.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.icon || '📝';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Manage your expenses and track spending</p>
        </div>
        <Link href="/dashboard/expenses/new" className="btn btn-primary gap-2 cursor-pointer px-4 py-2 flex items-center justify-center border-2 border-blue-500 rounded-full">
          <Plus className="w-5 h-5" />
          Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <h3 className="font-medium text-gray-900">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2">
                        <span>{getCategoryIcon(expense.categoryId)}</span>
                        <span>{getCategoryName(expense.categoryId)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {expense.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {expense.paymentMethod || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/expenses/${expense.id}/edit`}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses found</p>
            <Link href="/dashboard/expenses/new" className="text-blue-600 hover:underline mt-2 inline-block">
              Create your first expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
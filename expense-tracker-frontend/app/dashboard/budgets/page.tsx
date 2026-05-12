'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

interface Budget {
  id: string;
  categoryName: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  alertTriggered: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    monthlyLimit: '',
    alertThreshold: '80',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        apiClient.get('/budgets'),
        apiClient.get('/categories'),
      ]);

      setBudgets(budgetsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.monthlyLimit) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await apiClient.post('/budgets', {
        categoryId: formData.categoryId,
        monthlyLimit: parseFloat(formData.monthlyLimit),
        alertThreshold: parseFloat(formData.alertThreshold),
      });
      toast.success('Budget created successfully!');
      setFormData({ categoryId: '', monthlyLimit: '', alertThreshold: '80' });
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await apiClient.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Set and manage your spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary gap-2 flex items-center justify-center cursor-pointer rounded-lg px-4 py-2"
        >
          <span className="font-bold">{showForm ? 'Cancel' : <div className="flex items-center gap-2 flex-row"><Plus className="w-5 h-5" />New Budget</div>}</span>
        </button>
      </div>

      {/* New Budget Form */}
      {showForm && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 bold-text px-2 rounded-lg">Create New Budget</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Limit *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 ">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyLimit: e.target.value })
                    }
                    placeholder="500.00"
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  ml-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Threshold %
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, alertThreshold: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary px-2 cursor-pointer rounded-lg font-bold">
              Create Budget
            </button>
          </form>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {budget.categoryName}
                  </h3>
                  {budget.alertTriggered && (
                    <div className="flex items-center gap-1 text-yellow-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      Budget threshold reached
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Spending</span>
                  <span className="text-sm font-bold text-gray-900">
                    {budget.percentageUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getProgressColor(
                      budget.percentageUsed
                    )}`}
                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Spent</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${budget.spent.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${budget.monthlyLimit.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${budget.isOverBudget ? 'bg-red-50' : 'bg-green-50'
                    }`}
                >
                  <p className="text-xs text-gray-600 mb-1">Remaining</p>
                  <p
                    className={`text-lg font-bold ${budget.isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}
                  >
                    ${budget.remaining.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No budgets yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary cursor-pointer rounded-lg px-2 font-bold"
          >
            Create Your First Budget
          </button>
        </div>
      )}
    </div>
  );
}
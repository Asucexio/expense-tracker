'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingDown, TrendingUp, Target, AlertCircle, Wallet, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalSpent: number;
  byCategory: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
  }>;
  dailySpending: Array<{
    date: string;
    amount: number;
  }>;
}

interface Summary {
  totalExpensesThisMonth: number;
  expenseCountThisMonth: number;
  activeBudgets: number;
  budgetsOverLimit: number;
}

// Enhanced color palette with gradients
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">Amount: ${data.amount.toFixed(2)}</p>
        <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
      </div>
    );
  }
  return null;
};

// Custom label for pie chart with better positioning
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, summaryRes] = await Promise.all([
        apiClient.get('/expenses/stats/summary'),
        apiClient.get('/users/summary/dashboard'),
      ]);

      setStats(statsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const formattedDailyData = stats?.dailySpending.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 from-indigo-500 via-purple-500 to-pink-500 opacity-10 rounded-2xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent text-bold">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview.</p>
        </div>
      </div>

      {/* Summary Cards with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Expenses */}
        <div className="group relative overflow-hidden card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats?.totalSpent.toFixed(2) || '0.00'}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Number of Expenses */}
        <div className="group relative overflow-hidden card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary?.expenseCountThisMonth || 0}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">this month</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Active Budgets */}
        <div className="group relative overflow-hidden card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary?.activeBudgets || 0}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">on track</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Over Budget */}
        <div className="group relative overflow-hidden card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-600">Over Budget</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary?.budgetsOverLimit || 0}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">needs attention</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending Chart - Enhanced with Area */}
        <div className="lg:col-span-2 card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Daily Spending Trend</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600">Last 30 days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={formattedDailyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(2)}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#colorAmount)"
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie Chart - Enhanced */}
        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Expense Categories</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          {stats?.byCategory && stats.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={stats.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={{

                    stroke: '#fff',
                    strokeWidth: 3,
                  }}
                >
                  {stats.byCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        filter: activeIndex === index ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">No expenses yet</p>
              <Link href="/dashboard/expenses/new" className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Add your first expense <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table - Enhanced */}
      <div className="card hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Spending by Category</h3>
          <div className="text-sm text-gray-500">Breakdown of your expenses</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stats?.byCategory.map((category, index) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-xl">{category.icon}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-gray-900">
                      ${category.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                        {category.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {category.percentage > 30 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <TrendingUp className="w-3 h-3" /> High
                      </span>
                    ) : category.percentage > 15 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <TrendingUp className="w-3 h-3" /> Medium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <TrendingDown className="w-3 h-3" /> Low
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.byCategory || stats.byCategory.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No expenses yet this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/expenses/new"
          className="group relative overflow-hidden card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          <div className="relative p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">➕</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Expense</h3>
            <p className="text-gray-600">Track a new expense in seconds</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-indigo-600 font-medium text-sm flex items-center justify-center gap-1">
                Get started <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/budgets"
          className="group relative overflow-hidden card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          <div className="relative p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">💼</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">View Budgets</h3>
            <p className="text-gray-600">Manage your spending limits</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-emerald-600 font-medium text-sm flex items-center justify-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
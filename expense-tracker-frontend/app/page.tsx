'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { TrendingUp, PieChart, Lock, Zap, ArrowRight, Star, Users, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">

      {/* Decorative background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-white/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="cursor-pointer" onClick={() => router.push('/')}>
            <img src="./vaulto-logo-dark.svg" alt="vaulto" width={150} />
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-full transition-colors duration-200 text-sm"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-full transition-all duration-200 text-sm shadow-md shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">

          {/* Trust badge — NEW */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Trusted by 1000+ users
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Take Control of{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600">Your Finances</span>
              {/* Underline accent — NEW */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M2 9 C60 3, 150 3, 298 9" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your expenses, set budgets, and achieve your financial goals with ease
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 text-base"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-full border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Social proof row — NEW */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {['bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
                ))}
              </div>
              <span className="ml-1">Join 1k+ users</span>
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 font-medium text-gray-700">4.9</span>
              <span>rating</span>
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Bank-grade security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar — NEW
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {[
            { value: '$2.4B+', label: 'Expenses tracked' },
            { value: '50,000+', label: 'Active users' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white px-8 py-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Section label — NEW */}
        <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Features</p>

        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 text-gray-900 tracking-tight">
          Why Choose Expense Tracker?
        </h2>
        <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
          Everything you need to stay on top of your money, in one beautifully simple app.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Feature 1 */}
          <div className="group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Track Expenses</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Easily log and categorize your daily expenses
            </p>
            {/* Accent line — NEW */}
            <div className="absolute bottom-0 left-7 right-7 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors">
              <PieChart className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Visualize Data</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              See spending patterns with interactive charts
            </p>
            <div className="absolute bottom-0 left-7 right-7 h-0.5 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5 group-hover:bg-red-100 transition-colors">
              <Lock className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Secure</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your data is encrypted and protected
            </p>
            <div className="absolute bottom-0 left-7 right-7 h-0.5 bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </div>

          {/* Feature 4 */}
          <div className="group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-5 group-hover:bg-yellow-100 transition-colors">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Set Budgets</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Create budgets and get alerts when you exceed
            </p>
            <div className="absolute bottom-0 left-7 right-7 h-0.5 bg-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative rings — NEW */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full border border-white/10" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">Get started today</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Ready to Take Control?</h2>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Start tracking your expenses today and reach your financial goals
          </p>
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-4 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-5 text-sm text-blue-200">No credit card required · Cancel anytime</p>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Expense Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
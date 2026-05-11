'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TrendingUp, PieChart, Lock, Zap } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">Expense Tracker</div>
          <div className="landing-actions">
            <Link href="/auth/login" className="button">
              Login
            </Link>
            <Link href="/auth/signup" className="button primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1>
            Take Control of Your Finances
          </h1>
          <p>
            Track your expenses, set budgets, and achieve your financial goals with ease
          </p>
          <div className="landing-actions centered">
            <Link href="/auth/signup" className="button primary large">
              Get Started Free
            </Link>
            <Link href="/auth/login" className="button large">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>
          Why Choose Expense Tracker?
        </h2>

        <div className="feature-grid">
          <article className="feature-card">
            <TrendingUp className="feature-icon teal" />
            <h3>Track Expenses</h3>
            <p>
              Easily log and categorize your daily expenses
            </p>
          </article>

          <article className="feature-card">
            <PieChart className="feature-icon green" />
            <h3>Visualize Data</h3>
            <p>
              See spending patterns with interactive charts
            </p>
          </article>

          <article className="feature-card">
            <Lock className="feature-icon red" />
            <h3>Secure</h3>
            <p>
              Your data is encrypted and protected
            </p>
          </article>

          <article className="feature-card">
            <Zap className="feature-icon amber" />
            <h3>Set Budgets</h3>
            <p>
              Create budgets and get alerts when you exceed
            </p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <h2>Ready to Take Control?</h2>
          <p>
            Start tracking your expenses today and reach your financial goals
          </p>
          <Link href="/auth/signup" className="button large">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <p>&copy; 2024 Expense Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

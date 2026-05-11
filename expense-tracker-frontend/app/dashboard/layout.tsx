'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { clearSession, getStoredToken, getStoredUser, User } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setUser(storedUser);
  }, [router]);

  function logout() {
    clearSession();
    router.replace('/auth/login');
  }

  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <div>
            <div className="brand">Expense Tracker</div>
            <div className="muted">{user?.email || 'Dashboard'}</div>
          </div>
          <nav className="nav">
            <Link href="/dashboard">Overview</Link>
            <Link href="/dashboard/expenses">Expenses</Link>
            <Link href="/dashboard/budgets">Budgets</Link>
            <Link href="/dashboard/settings">Settings</Link>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

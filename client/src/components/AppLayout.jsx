import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth.js';

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/habits', label: 'Habits' },
  { to: '/savings-goals', label: 'Savings Goals' },
  { to: '/wealth-analytics', label: 'Wealth Analytics' },
  { to: '/profile', label: 'Profile' },
  { to: '/admin', label: 'Admin', adminOnly: true },
];

function AppLayout() {
  const { logout, user } = useAuth();
  const visibleNavigation = navigation.filter((item) => !item.adminOnly || user.role === 'admin');

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
              Financial Habit Builder
            </p>
            <p className="mt-1 text-sm text-slate-400">Wealth Growth Tracker</p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <p className="truncate text-sm text-slate-400">
                Signed in as <span className="font-medium text-slate-200">{user.name}</span>
              </p>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                Log out
              </button>
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
              {visibleNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

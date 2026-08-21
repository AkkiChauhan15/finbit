import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth.js';
import Icon, { BrandMark } from './Icon.jsx';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
  { to: '/expenses', label: 'Expense Tracker', shortLabel: 'Expenses', icon: 'expenses' },
  { to: '/habits', label: 'Habit Tracker', shortLabel: 'Habits', icon: 'habits' },
  { to: '/savings-goals', label: 'Savings Goals', shortLabel: 'Goals', icon: 'goals' },
  { to: '/wealth-analytics', label: 'Wealth Analytics', shortLabel: 'Wealth', icon: 'analytics' },
  { to: '/profile', label: 'Profile Settings', icon: 'profile', utility: true },
  { to: '/admin', label: 'Admin Panel', icon: 'admin', adminOnly: true, utility: true },
];

function AppLayout() {
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const visibleNavigation = navigation.filter((item) => !item.adminOnly || user.role === 'admin');
  const primaryNavigation = visibleNavigation.filter((item) => !item.utility);
  const utilityNavigation = visibleNavigation.filter((item) => item.utility);
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const navLink = (item, mobile = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setIsMenuOpen(false)}
      className={({ isActive }) =>
        mobile
          ? `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
              isActive ? 'bg-[#00bc44] text-[#003e14]' : 'text-[#536158] hover:bg-[#e8f0e9]'
            }`
          : `group flex items-center gap-3 rounded-xl border-r-[3px] px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'border-[#006e24] bg-[#dff3e4] text-[#006e24]'
                : 'border-transparent text-[#46544b] hover:bg-[#e8f0e9] hover:text-[#161d19]'
            }`
      }
    >
      <Icon name={item.icon} className={mobile ? 'h-5 w-5' : 'h-5 w-5 shrink-0'} />
      <span className={mobile ? 'truncate' : ''}>{mobile ? item.shortLabel : item.label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#f4fbf4] text-[#161d19]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#cbd7ce] bg-[#f7fcf7] px-4 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <BrandMark />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold tracking-tight text-[#006e24]">
              WealthTracker
            </p>
            <p className="text-xs text-[#536158]">Habits that compound</p>
          </div>
        </div>

        <nav className="mt-10 flex-1 space-y-1" aria-label="Primary navigation">
          {primaryNavigation.map((item) => navLink(item))}
        </nav>

        <div className="space-y-1 border-t border-[#d7e2d9] pt-4">
          {utilityNavigation.map((item) => navLink(item))}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#46544b] transition hover:bg-[#e8f0e9] hover:text-[#a43a3a]"
          >
            <Icon name="logout" />
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#d7e2d9] bg-[#f4fbf4]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <BrandMark className="h-8 w-8 shrink-0" />
            <p className="truncate text-base font-bold text-[#006e24] sm:text-lg">
              Financial Habit Builder
            </p>
          </div>
          <p className="hidden text-sm text-[#536158] lg:block">
            Build better money habits, one decision at a time.
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="hidden rounded-full p-2 text-[#46544b] transition hover:bg-[#e8f0e9] sm:block"
            >
              <Icon name="bell" />
            </button>
            <div className="hidden text-right md:block">
              <p className="max-w-40 truncate text-sm font-semibold text-[#26352c]">{user.name}</p>
              <p className="text-xs capitalize text-[#6c7a71]">{user.role}</p>
            </div>
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#aebdb2] bg-[#dff3e4] text-xs font-bold text-[#006e24] transition hover:border-[#006e24]"
            >
              {initials}
            </button>
          </div>

          {isMenuOpen && (
            <div className="absolute right-4 top-[calc(100%+8px)] w-64 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-3 shadow-xl shadow-[#18221b]/10 sm:right-6 lg:right-10">
              <div className="border-b border-[#e0e8e2] px-3 pb-3">
                <p className="truncate text-sm font-semibold text-[#161d19]">{user.name}</p>
                <p className="truncate text-xs text-[#6c7a71]">{user.email}</p>
              </div>
              <nav className="mt-2 space-y-1" aria-label="Account navigation">
                {utilityNavigation.map((item) => navLink(item))}
              </nav>
              <button
                type="button"
                onClick={logout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#a43a3a] hover:bg-[#fff0ef]"
              >
                <Icon name="logout" />
                Log out
              </button>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-7 sm:px-6 sm:pt-9 lg:px-10 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#cbd7ce] bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(22,29,25,0.06)] backdrop-blur lg:hidden"
        aria-label="Mobile navigation"
      >
        {primaryNavigation.map((item) => navLink(item, true))}
      </nav>
    </div>
  );
}

export default AppLayout;

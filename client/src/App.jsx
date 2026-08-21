import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminRoute from './components/AdminRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import PageSkeleton from './components/PageSkeleton.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard.jsx'));
const ExpenseTracker = lazy(() => import('./pages/ExpenseTracker.jsx'));
const HabitTracker = lazy(() => import('./pages/HabitTracker.jsx'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals.jsx'));
const WealthAnalytics = lazy(() => import('./pages/WealthAnalytics.jsx'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings.jsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'));

const lazyPage = (Component, label) => (
  <Suspense fallback={<PageSkeleton label={`Loading ${label}`} />}>
    <Component />
  </Suspense>
);

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={lazyPage(FinancialDashboard, 'dashboard')} />
          <Route path="expenses" element={lazyPage(ExpenseTracker, 'expense tracker')} />
          <Route path="habits" element={lazyPage(HabitTracker, 'habit tracker')} />
          <Route path="savings-goals" element={lazyPage(SavingsGoals, 'savings goals')} />
          <Route path="wealth-analytics" element={lazyPage(WealthAnalytics, 'wealth analytics')} />
          <Route path="profile" element={lazyPage(ProfileSettings, 'profile settings')} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={lazyPage(AdminPanel, 'admin panel')} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

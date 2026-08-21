import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '../api/client.js';
import AdminAnalyticsCharts from '../components/admin/AdminAnalyticsCharts.jsx';
import AdminMetricCard from '../components/admin/AdminMetricCard.jsx';
import FeedbackInbox from '../components/admin/FeedbackInbox.jsx';
import UserManagementTable from '../components/admin/UserManagementTable.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { useAuth } from '../hooks/useAuth.js';

function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [feedbackFilter, setFeedbackFilter] = useState('open');
  const [busyUserId, setBusyUserId] = useState('');
  const [busyFeedbackId, setBusyFeedbackId] = useState('');

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [userResult, analyticsResult, feedbackResult] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminAnalytics(),
        api.getAdminFeedback(),
      ]);
      setUsers(userResult.users);
      setAnalytics(analyticsResult.analytics);
      setFeedback(feedbackResult.feedback);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter(
      (user) =>
        (!normalizedSearch ||
          user.name.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch)) &&
        (statusFilter === 'all' || user.status === statusFilter) &&
        (roleFilter === 'all' || user.role === roleFilter),
    );
  }, [roleFilter, search, statusFilter, users]);

  const visibleFeedback = useMemo(
    () =>
      feedbackFilter === 'all'
        ? feedback
        : feedback.filter((item) => item.status === feedbackFilter),
    [feedback, feedbackFilter],
  );

  const replaceUser = (updatedUser) => {
    setUsers((current) =>
      current.map((user) => (user._id === updatedUser._id ? updatedUser : user)),
    );
  };

  const refreshAnalytics = async () => {
    const result = await api.getAdminAnalytics();
    setAnalytics(result.analytics);
  };

  const changeRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`${nextRole === 'admin' ? 'Promote' : 'Demote'} ${user.name}?`)) return;

    setBusyUserId(user._id);
    setError('');

    try {
      const result = await api.updateAdminUser(user._id, { role: nextRole });
      replaceUser(result.user);
      await refreshAnalytics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId('');
    }
  };

  const changeStatus = async (user) => {
    const isActive = !user.isActive;
    const verb = isActive ? 'reactivate' : 'deactivate';
    if (!window.confirm(`${verb[0].toUpperCase()}${verb.slice(1)} ${user.name}?`)) return;

    setBusyUserId(user._id);
    setError('');

    try {
      const result = await api.updateAdminUser(user._id, { isActive });
      replaceUser(result.user);
      await refreshAnalytics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId('');
    }
  };

  const softDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Soft-delete ${user.name}? They will lose access, but their records will be retained.`,
      )
    ) {
      return;
    }

    setBusyUserId(user._id);
    setError('');

    try {
      await api.deleteAdminUser(user._id);
      const now = new Date().toISOString();
      replaceUser({ ...user, isActive: false, status: 'deleted', deletedAt: now });
      await refreshAnalytics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId('');
    }
  };

  const updateFeedback = async (item, status) => {
    setBusyFeedbackId(item._id);
    setError('');

    try {
      const result = await api.updateAdminFeedback(item._id, { status });
      setFeedback((current) =>
        current.map((feedbackItem) =>
          feedbackItem._id === item._id ? result.feedback : feedbackItem,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyFeedbackId('');
    }
  };

  if (isLoading) {
    return <PageSkeleton label="Loading platform operations" />;
  }

  if (error && !analytics) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-12 text-center">
        <p className="font-medium text-rose-200">We couldn’t load the admin workspace.</p>
        <p className="mt-2 text-sm text-rose-300/80">{error}</p>
        <button
          type="button"
          onClick={() => void loadAdminData()}
          className="mt-5 rounded-lg bg-rose-200 px-4 py-2 font-semibold text-slate-950"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-medium text-emerald-400">Platform operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Admin Panel
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Monitor engagement, manage account access, and close the loop on user feedback.
        </p>
      </header>

      {error && (
        <p
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Active users"
          value={analytics.totalActiveUsers}
          detail="Accounts currently allowed to sign in"
        />
        <AdminMetricCard
          accent="sky"
          label="Habit completion"
          value={`${analytics.averageHabitCompletionRate}%`}
          detail="Weighted completion across the last 30 days"
        />
        <AdminMetricCard
          accent="violet"
          label="Goal completion"
          value={`${analytics.averageSavingsGoalCompletionRate}%`}
          detail="Average progress across active-user goals"
        />
        <AdminMetricCard
          accent="amber"
          label="Engagement rate"
          value={`${analytics.userEngagementRate}%`}
          detail="Active accounts engaged this month"
        />
      </section>

      <AdminAnalyticsCharts analytics={analytics} />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">User management</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredUsers.length} of {users.length} accounts shown
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search users"
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter users by status"
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter users by role"
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 py-14 text-center text-sm text-slate-500">
            No users match these filters.
          </div>
        ) : (
          <UserManagementTable
            users={filteredUsers}
            currentUserId={currentUser._id}
            busyId={busyUserId}
            onRoleChange={changeRole}
            onStatusChange={changeStatus}
            onDelete={softDeleteUser}
          />
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Feedback inbox</h2>
            <p className="mt-1 text-sm text-slate-500">Resolve or dismiss submitted feedback.</p>
          </div>
          <select
            value={feedbackFilter}
            onChange={(event) => setFeedbackFilter(event.target.value)}
            aria-label="Filter feedback by status"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All feedback</option>
          </select>
        </div>
        <FeedbackInbox
          feedback={visibleFeedback}
          busyId={busyFeedbackId}
          onUpdate={updateFeedback}
        />
      </section>
    </div>
  );
}

export default AdminPanel;

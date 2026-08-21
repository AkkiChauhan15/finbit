import { useCallback, useEffect, useState } from 'react';

import { api } from '../api/client.js';
import NetWorthTrendChart from '../components/dashboard/NetWorthTrendChart.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import SummaryCard from '../components/dashboard/SummaryCard.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { dueLabels } from '../constants/habits.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

function FinancialDashboard() {
  const { user } = useAuth();
  const currency = user.financialProfile?.currency ?? 'USD';
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSnapshotting, setIsSnapshotting] = useState(false);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setSummary(await api.getDashboardSummary());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const recordSnapshot = async () => {
    setIsSnapshotting(true);
    setError('');

    try {
      await api.createNetWorthSnapshot();
      await loadSummary();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSnapshotting(false);
    }
  };

  if (isLoading) {
    return <PageSkeleton label="Building your financial overview" />;
  }

  if (error && !summary) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-12 text-center">
        <p className="font-medium text-rose-200">We couldn’t load your dashboard.</p>
        <p className="mt-2 text-sm text-rose-300/80">{error}</p>
        <button
          type="button"
          onClick={() => void loadSummary()}
          className="mt-5 rounded-lg bg-rose-200 px-4 py-2 font-semibold text-slate-950"
        >
          Try again
        </button>
      </div>
    );
  }

  const strongestHabit = summary.habits.top[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Welcome back, {user.name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Financial Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            A live view of this month’s cash flow, wealth, habits, and savings momentum.
          </p>
        </div>
        <button
          type="button"
          disabled={isSnapshotting}
          onClick={recordSnapshot}
          className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isSnapshotting ? 'Recalculating…' : 'Record net worth snapshot'}
        </button>
      </header>

      {error && (
        <p
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {summary.netWorth.isSnapshotStale && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Your live net worth differs from the latest stored snapshot. Record a snapshot when the
          current values are ready for history.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Live net worth"
          value={formatCurrency(summary.netWorth.netWorth, currency)}
          detail={`${formatCurrency(summary.netWorth.totalAssets, currency)} assets + ${formatCurrency(summary.netWorth.totalSavings, currency)} goal savings`}
        />
        <SummaryCard
          accent="sky"
          label="This month’s savings rate"
          value={`${summary.cashFlow.savingsRate}%`}
          detail={`${formatCurrency(summary.cashFlow.income, currency)} income · ${formatCurrency(summary.cashFlow.expenses, currency)} spent`}
        />
        <SummaryCard
          accent="violet"
          label="Strongest active streak"
          value={strongestHabit ? `${strongestHabit.currentStreak} periods` : 'No streak yet'}
          detail={
            strongestHabit ? strongestHabit.name : `${summary.habits.activeCount} active habits`
          }
        />
        <SummaryCard
          accent="amber"
          label="Goals on track"
          value={`${summary.goals.onTrackCount} / ${summary.goals.activeCount}`}
          detail="Active savings goals projected by recent pace"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <NetWorthTrendChart
          snapshots={summary.netWorthHistory}
          currency={currency}
          formatCurrency={formatCurrency}
        />
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Habit momentum</h2>
          <div className="mt-5 space-y-3">
            {summary.habits.top.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No active habits yet.</p>
            ) : (
              summary.habits.top.map((habit) => (
                <div key={habit._id} className="rounded-xl bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium text-slate-200">{habit.name}</p>
                    <span className="shrink-0 text-sm font-bold text-emerald-300">
                      {habit.currentStreak} streak
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {habit.isCurrentPeriodComplete
                      ? `Completed ${dueLabels[habit.frequency]}`
                      : `Still due ${dueLabels[habit.frequency]}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
        <RecentActivity
          activities={summary.recentActivity}
          currency={currency}
          formatCurrency={formatCurrency}
        />
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Closest savings goals</h2>
          <div className="mt-5 space-y-4">
            {summary.goals.items.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No active savings goals.</p>
            ) : (
              summary.goals.items.map((goal) => (
                <div key={goal._id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-200">{goal.name}</span>
                    <span className="text-slate-400">{goal.progress.percentageComplete}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.min(goal.progress.percentageComplete, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatCurrency(goal.progress.amountRemaining, currency)} remaining · target{' '}
                    {formatDate(goal.targetDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FinancialDashboard;

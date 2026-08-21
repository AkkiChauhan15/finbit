import { dueLabels, frequencyLabels, habitTypeLabels } from '../../constants/habits.js';
import HabitHistory from './HabitHistory.jsx';

function HabitCard({ action, habit, onComplete, onDeactivate, onDelete }) {
  const isCompleting = action.id === habit._id && action.type === 'complete';
  const isDeactivating = action.id === habit._id && action.type === 'deactivate';
  const isDeleting = action.id === habit._id && action.type === 'delete';
  const isBusy = isCompleting || isDeactivating || isDeleting;
  const dueLabel = dueLabels[habit.frequency];

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
              {habitTypeLabels[habit.type]}
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
              {frequencyLabels[habit.frequency]}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">{habit.name}</h2>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            habit.isCurrentPeriodComplete
              ? 'bg-emerald-500/10 text-emerald-300'
              : 'bg-amber-500/10 text-amber-300'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              habit.isCurrentPeriodComplete ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'
            }`}
          />
          {habit.isCurrentPeriodComplete ? `Completed ${dueLabel}` : `Reminder: due ${dueLabel}`}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-950/70 p-3">
          <p className="text-xs text-slate-500">Current streak</p>
          <p className="mt-1 text-xl font-bold text-emerald-300">{habit.currentStreak}</p>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-3">
          <p className="text-xs text-slate-500">Best streak</p>
          <p className="mt-1 text-xl font-bold text-white">{habit.longestStreak}</p>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-3">
          <p className="text-xs text-slate-500">30-day rate</p>
          <p className="mt-1 text-xl font-bold text-white">{habit.completionRate}%</p>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{ width: `${habit.completionRate}%` }}
        />
      </div>

      <div className="mt-6">
        <HabitHistory history={habit.history} />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={isBusy || habit.isCurrentPeriodComplete}
          onClick={() => onComplete(habit)}
          className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/20 disabled:text-emerald-300"
        >
          {isCompleting
            ? 'Saving…'
            : habit.isCurrentPeriodComplete
              ? `Done ${dueLabel}`
              : `Mark done ${dueLabel}`}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDeactivate(habit)}
          className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          {isDeactivating ? 'Deactivating…' : 'Deactivate'}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(habit)}
          className="rounded-lg border border-rose-500/30 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-50 sm:ml-auto"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default HabitCard;

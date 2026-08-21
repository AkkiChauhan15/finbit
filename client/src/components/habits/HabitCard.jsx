import { dueLabels, frequencyLabels, habitTypeLabels } from '../../constants/habits.js';
import HabitHistory from './HabitHistory.jsx';

function HabitCard({ action, habit, onComplete, onDeactivate, onDelete }) {
  const isCompleting = action.id === habit._id && action.type === 'complete';
  const isDeactivating = action.id === habit._id && action.type === 'deactivate';
  const isDeleting = action.id === habit._id && action.type === 'delete';
  const isBusy = isCompleting || isDeactivating || isDeleting;
  const dueLabel = dueLabels[habit.frequency];

  return (
    <article className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-[#4648d4]">
              {habitTypeLabels[habit.type]}
            </span>
            <span className="rounded-full bg-[#e8f0e9] px-2.5 py-1 text-xs font-semibold text-[#35443a]">
              {frequencyLabels[habit.frequency]}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-[#161d19]">{habit.name}</h2>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            habit.isCurrentPeriodComplete
              ? 'bg-[#00bc44]/10 text-[#006e24]'
              : 'bg-amber-500/10 text-[#805600]'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              habit.isCurrentPeriodComplete ? 'bg-[#18c950]' : 'animate-pulse bg-amber-400'
            }`}
          />
          {habit.isCurrentPeriodComplete ? `Completed ${dueLabel}` : `Reminder: due ${dueLabel}`}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#f4fbf4] p-3">
          <p className="text-xs text-[#6c7a71]">Current streak</p>
          <p className="mt-1 text-xl font-bold text-[#006e24]">{habit.currentStreak}</p>
        </div>
        <div className="rounded-xl bg-[#f4fbf4] p-3">
          <p className="text-xs text-[#6c7a71]">Best streak</p>
          <p className="mt-1 text-xl font-bold text-[#161d19]">{habit.longestStreak}</p>
        </div>
        <div className="rounded-xl bg-[#f4fbf4] p-3">
          <p className="text-xs text-[#6c7a71]">30-day rate</p>
          <p className="mt-1 text-xl font-bold text-[#161d19]">{habit.completionRate}%</p>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e8f0e9]">
        <div
          className="h-full rounded-full bg-[#18c950] transition-all"
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
          className="rounded-lg bg-[#00bc44] px-4 py-2.5 text-sm font-semibold text-[#161d19] transition hover:bg-[#18c950] disabled:cursor-not-allowed disabled:bg-[#00bc44]/20 disabled:text-[#006e24]"
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
          className="rounded-lg border border-[#b9c8bd] px-4 py-2.5 text-sm text-[#35443a] hover:bg-[#e8f0e9] disabled:opacity-50"
        >
          {isDeactivating ? 'Deactivating…' : 'Deactivate'}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(habit)}
          className="rounded-lg border border-rose-500/30 px-4 py-2.5 text-sm text-[#a43a3a] hover:bg-rose-500/10 disabled:opacity-50 sm:ml-auto"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default HabitCard;

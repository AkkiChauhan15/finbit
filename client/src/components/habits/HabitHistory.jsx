import { formatDate } from '../../utils/formatters.js';

const statusClasses = {
  completed: 'bg-emerald-400 ring-emerald-300/30',
  pending: 'bg-amber-400/70 ring-amber-300/30',
  missed: 'bg-slate-800 ring-slate-700/40',
};

function HabitHistory({ history }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Last 30 days
        </p>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-slate-800" /> Missed
          </span>
        </div>
      </div>
      <div
        className="mt-3 grid grid-cols-10 gap-1.5"
        aria-label="Completion history for the last 30 days"
      >
        {history.map((day) => (
          <span
            key={day.date}
            title={`${formatDate(day.date)} — ${day.status}`}
            aria-label={`${formatDate(day.date)}: ${day.status}`}
            className={`aspect-square min-h-3 rounded-sm ring-1 ${statusClasses[day.status]}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HabitHistory;

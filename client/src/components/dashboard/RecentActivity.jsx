import { formatDate } from '../../utils/formatters.js';

const typeStyles = {
  income: 'bg-emerald-500/10 text-emerald-300',
  expense: 'bg-rose-500/10 text-rose-300',
  habit: 'bg-sky-500/10 text-sky-300',
  goal: 'bg-violet-500/10 text-violet-300',
};

function RecentActivity({ activities, currency, formatCurrency }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-semibold text-white">Recent activity</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cash flow, habit, and goal updates in one feed.
        </p>
      </div>
      {activities.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-slate-500">
          Your latest financial activity will appear here.
        </div>
      ) : (
        <ul className="divide-y divide-slate-800">
          {activities.map((activity, index) => (
            <li
              key={`${activity.type}-${activity.date}-${index}`}
              className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${typeStyles[activity.type]}`}
                  >
                    {activity.type}
                  </span>
                  <p className="truncate font-medium text-slate-200">{activity.title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {activity.detail} · {formatDate(activity.date)}
                </p>
              </div>
              {activity.amount !== undefined && (
                <p
                  className={`shrink-0 text-sm font-semibold ${
                    activity.type === 'expense' ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {activity.type === 'expense' ? '−' : '+'}
                  {formatCurrency(activity.amount, currency)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentActivity;

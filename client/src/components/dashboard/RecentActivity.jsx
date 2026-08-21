import { formatDate } from '../../utils/formatters.js';

const typeStyles = {
  income: 'bg-[#00bc44]/10 text-[#006e24]',
  expense: 'bg-rose-500/10 text-[#a43a3a]',
  habit: 'bg-sky-500/10 text-[#4648d4]',
  goal: 'bg-violet-500/10 text-[#4648d4]',
};

function RecentActivity({ activities, currency, formatCurrency }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft">
      <div className="border-b border-[#cbd7ce] px-5 py-4 sm:px-6">
        <h2 className="text-xl font-semibold text-[#161d19]">Recent activity</h2>
        <p className="mt-1 text-sm text-[#6c7a71]">
          Cash flow, habit, and goal updates in one feed.
        </p>
      </div>
      {activities.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-[#6c7a71]">
          Your latest financial activity will appear here.
        </div>
      ) : (
        <ul className="divide-y divide-[#d7e2d9]">
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
                  <p className="truncate font-medium text-[#26352c]">{activity.title}</p>
                </div>
                <p className="mt-1 text-xs text-[#6c7a71]">
                  {activity.detail} · {formatDate(activity.date)}
                </p>
              </div>
              {activity.amount !== undefined && (
                <p
                  className={`shrink-0 text-sm font-semibold ${
                    activity.type === 'expense' ? 'text-[#a43a3a]' : 'text-[#006e24]'
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

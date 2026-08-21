import { formatDate } from '../../utils/formatters.js';

const statusStyles = {
  open: 'bg-sky-500/10 text-sky-300',
  resolved: 'bg-emerald-500/10 text-emerald-300',
  dismissed: 'bg-slate-700 text-slate-300',
};

function FeedbackInbox({ feedback, busyId, onUpdate }) {
  if (feedback.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 py-14 text-center text-sm text-slate-500">
        No feedback matches this filter.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {feedback.map((item) => (
        <article key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {item.category}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-white">{item.subject}</h3>
            </div>
            <time className="text-xs text-slate-500">{formatDate(item.createdAt)}</time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {item.message}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            From {item.user?.name ?? 'Deleted user'} · {item.user?.email ?? 'account unavailable'}
          </p>
          {item.adminNote && (
            <p className="mt-3 rounded-lg bg-slate-950/80 p-3 text-xs text-slate-400">
              Admin note: {item.adminNote}
            </p>
          )}
          {item.status === 'open' && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === item._id}
                onClick={() => onUpdate(item, 'resolved')}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                type="button"
                disabled={busyId === item._id}
                onClick={() => onUpdate(item, 'dismissed')}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default FeedbackInbox;

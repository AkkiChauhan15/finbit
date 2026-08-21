import { formatDate } from '../../utils/formatters.js';

const statusStyles = {
  open: 'bg-sky-500/10 text-[#4648d4]',
  resolved: 'bg-[#00bc44]/10 text-[#006e24]',
  dismissed: 'bg-[#d7e2d9] text-[#35443a]',
};

function FeedbackInbox({ feedback, busyId, onUpdate }) {
  if (feedback.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#b9c8bd] py-14 text-center text-sm text-[#6c7a71]">
        No feedback matches this filter.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {feedback.map((item) => (
        <article
          key={item._id}
          className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6c7a71]">
                  {item.category}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-[#161d19]">{item.subject}</h3>
            </div>
            <time className="text-xs text-[#6c7a71]">{formatDate(item.createdAt)}</time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536158]">
            {item.message}
          </p>
          <p className="mt-4 text-xs text-[#6c7a71]">
            From {item.user?.name ?? 'Deleted user'} · {item.user?.email ?? 'account unavailable'}
          </p>
          {item.adminNote && (
            <p className="mt-3 rounded-lg bg-[#f4fbf4]/90 p-3 text-xs text-[#536158]">
              Admin note: {item.adminNote}
            </p>
          )}
          {item.status === 'open' && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === item._id}
                onClick={() => onUpdate(item, 'resolved')}
                className="rounded-lg bg-[#00bc44] px-3 py-2 text-xs font-semibold text-[#161d19] hover:bg-[#18c950] disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                type="button"
                disabled={busyId === item._id}
                onClick={() => onUpdate(item, 'dismissed')}
                className="rounded-lg border border-[#b9c8bd] px-3 py-2 text-xs font-semibold text-[#35443a] hover:bg-[#e8f0e9] disabled:opacity-50"
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

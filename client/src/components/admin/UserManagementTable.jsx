import { formatCurrency, formatDate } from '../../utils/formatters.js';

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-300',
  inactive: 'bg-amber-500/10 text-amber-300',
  deleted: 'bg-rose-500/10 text-rose-300',
};

function UserManagementTable({
  users,
  currentUserId,
  busyId,
  onRoleChange,
  onStatusChange,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="min-w-[980px] w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-4">User</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Joined / active</th>
            <th className="px-5 py-4">Habit rate</th>
            <th className="px-5 py-4">Tracked net worth</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
          {users.map((user) => {
            const isSelf = user._id === currentUserId;
            const isBusy = busyId === user._id;

            return (
              <tr key={user._id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-200">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  <span className="mt-2 inline-flex rounded bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-300">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[user.status]}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-400">
                  <p>{formatDate(user.joinedAt)}</p>
                  <p className="mt-1 text-slate-500">
                    {user.lastActiveAt
                      ? `Active ${formatDate(user.lastActiveAt)}`
                      : 'No activity yet'}
                  </p>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-200">
                  {user.stats.habitCompletionRate}%
                </td>
                <td className="px-5 py-4 font-semibold text-slate-200">
                  {formatCurrency(user.stats.totalTrackedNetWorth, user.currency)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSelf || isBusy || user.status === 'deleted'}
                      onClick={() => onRoleChange(user)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      type="button"
                      disabled={isSelf || isBusy}
                      onClick={() => onStatusChange(user)}
                      className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    {user.status !== 'deleted' && (
                      <button
                        type="button"
                        disabled={isSelf || isBusy}
                        onClick={() => onDelete(user)}
                        className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Soft-delete
                      </button>
                    )}
                  </div>
                  {isSelf && (
                    <p className="mt-2 text-right text-xs text-slate-600">Current admin</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagementTable;

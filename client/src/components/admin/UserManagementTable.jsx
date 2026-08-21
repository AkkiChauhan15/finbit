import { formatCurrency, formatDate } from '../../utils/formatters.js';

const statusStyles = {
  active: 'bg-[#00bc44]/10 text-[#006e24]',
  inactive: 'bg-amber-500/10 text-[#805600]',
  deleted: 'bg-rose-500/10 text-[#a43a3a]',
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
    <div className="overflow-x-auto rounded-2xl border border-[#cbd7ce]">
      <table className="min-w-[980px] w-full divide-y divide-[#d7e2d9] text-left text-sm">
        <thead className="bg-white/95 text-xs uppercase tracking-wider text-[#6c7a71]">
          <tr>
            <th className="px-5 py-4">User</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Joined / active</th>
            <th className="px-5 py-4">Habit rate</th>
            <th className="px-5 py-4">Tracked net worth</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d7e2d9] bg-white/70">
          {users.map((user) => {
            const isSelf = user._id === currentUserId;
            const isBusy = busyId === user._id;

            return (
              <tr key={user._id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#26352c]">{user.name}</p>
                  <p className="mt-1 text-xs text-[#6c7a71]">{user.email}</p>
                  <span className="mt-2 inline-flex rounded bg-[#e8f0e9] px-2 py-0.5 text-xs capitalize text-[#35443a]">
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
                <td className="px-5 py-4 text-xs text-[#536158]">
                  <p>{formatDate(user.joinedAt)}</p>
                  <p className="mt-1 text-[#6c7a71]">
                    {user.lastActiveAt
                      ? `Active ${formatDate(user.lastActiveAt)}`
                      : 'No activity yet'}
                  </p>
                </td>
                <td className="px-5 py-4 font-semibold text-[#26352c]">
                  {user.stats.habitCompletionRate}%
                </td>
                <td className="px-5 py-4 font-semibold text-[#26352c]">
                  {formatCurrency(user.stats.totalTrackedNetWorth, user.currency)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSelf || isBusy || user.status === 'deleted'}
                      onClick={() => onRoleChange(user)}
                      className="rounded-lg border border-[#b9c8bd] px-3 py-1.5 text-xs font-semibold text-[#35443a] hover:bg-[#e8f0e9] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      type="button"
                      disabled={isSelf || isBusy}
                      onClick={() => onStatusChange(user)}
                      className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-[#805600] hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    {user.status !== 'deleted' && (
                      <button
                        type="button"
                        disabled={isSelf || isBusy}
                        onClick={() => onDelete(user)}
                        className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-[#a43a3a] hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Soft-delete
                      </button>
                    )}
                  </div>
                  {isSelf && (
                    <p className="mt-2 text-right text-xs text-[#87938b]">Current admin</p>
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

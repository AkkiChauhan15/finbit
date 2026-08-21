import { categoryLabels } from '../../constants/transactions.js';
import { formatDate } from '../../utils/formatters.js';

function TransactionList({
  currency,
  deletingId,
  formatCurrency,
  hasActiveFilters,
  onDelete,
  onEdit,
  transactions,
}) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft">
      <div className="border-b border-[#cbd7ce] px-5 py-4 sm:px-6">
        <h2 className="text-xl font-semibold text-[#161d19]">Recent transactions</h2>
        <p className="mt-1 text-sm text-[#6c7a71]">Income and expenses in your selected period.</p>
      </div>
      {transactions.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-medium text-[#35443a]">
            {hasActiveFilters ? 'No transactions match these filters.' : 'No transactions yet.'}
          </p>
          <p className="mt-2 text-sm text-[#6c7a71]">
            {hasActiveFilters
              ? 'Try a broader date range or another category.'
              : 'Use either form above to record your first transaction.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#d7e2d9]">
          {transactions.map((transaction) => (
            <li
              key={`${transaction.type}-${transaction._id}`}
              className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      transaction.type === 'income'
                        ? 'bg-[#00bc44]/10 text-[#006e24]'
                        : 'bg-rose-500/10 text-[#a43a3a]'
                    }`}
                  >
                    {transaction.type === 'income'
                      ? 'Income'
                      : categoryLabels[transaction.category]}
                  </span>
                  <p className="truncate font-medium text-[#26352c]">
                    {transaction.type === 'income'
                      ? transaction.source
                      : transaction.notes || categoryLabels[transaction.category]}
                  </p>
                </div>
                <p className="mt-1 text-sm text-[#6c7a71]">{formatDate(transaction.date)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p
                  className={`font-semibold ${
                    transaction.type === 'income' ? 'text-[#006e24]' : 'text-[#a43a3a]'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '−'}
                  {formatCurrency(transaction.amount, currency)}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    className="rounded-md border border-[#b9c8bd] px-2.5 py-1.5 text-xs text-[#35443a] hover:bg-[#e8f0e9]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === transaction._id}
                    onClick={() => onDelete(transaction)}
                    className="rounded-md border border-rose-500/30 px-2.5 py-1.5 text-xs text-[#a43a3a] hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    {deletingId === transaction._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TransactionList;

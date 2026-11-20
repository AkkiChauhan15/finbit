function UpcomingBills({ bills, currency, formatCurrency }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">Upcoming bills</h2>
      <div className="mt-5 space-y-3">
        {bills.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6c7a71]">No upcoming bills.</p>
        ) : (
          bills.map((bill) => (
            <div
              key={bill._id}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#f4fbf4] p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#26352c]">{bill.name}</p>
                <p className="mt-1 text-xs text-[#6c7a71]">
                  {formatCurrency(bill.amount, currency)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  bill.daysUntil < 0
                    ? 'bg-rose-500/15 text-[#a43a3a]'
                    : 'bg-[#dff3e4] text-[#006e24]'
                }`}
              >
                {bill.daysUntil < 0
                  ? `${Math.abs(bill.daysUntil)}d overdue`
                  : bill.daysUntil === 0
                    ? 'Due today'
                    : `Due in ${bill.daysUntil}d`}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default UpcomingBills;

function UnusualSpending({ anomalies, currency, formatCurrency }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">Unusual spending</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {anomalies.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6c7a71] md:col-span-2">
            No unusual spending detected recently.
          </p>
        ) : (
          anomalies.map((anomaly) => (
            <div key={anomaly.id} className="rounded-xl bg-[#f4fbf4] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium capitalize text-[#26352c]">{anomaly.category}</p>
                <span className="shrink-0 text-sm font-bold text-[#a43a3a]">
                  {formatCurrency(anomaly.amount, currency)}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#6c7a71]">{anomaly.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default UnusualSpending;

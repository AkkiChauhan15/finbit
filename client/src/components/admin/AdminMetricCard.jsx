function AdminMetricCard({ label, value, detail, accent = 'emerald' }) {
  const accents = {
    emerald: 'from-emerald-500/20 text-emerald-300',
    sky: 'from-sky-500/20 text-sky-300',
    violet: 'from-violet-500/20 text-violet-300',
    amber: 'from-amber-500/20 text-amber-300',
  };

  return (
    <article
      className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${accents[accent]} to-slate-900 p-5`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </article>
  );
}

export default AdminMetricCard;

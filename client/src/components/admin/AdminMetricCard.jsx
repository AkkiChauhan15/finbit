function AdminMetricCard({ label, value, detail, accent = 'emerald' }) {
  const accents = {
    emerald: 'bg-[#00bc44] text-[#006e24]',
    sky: 'bg-[#6063ee] text-[#4648d4]',
    violet: 'bg-[#8b7cf6] text-[#5a45bd]',
    amber: 'bg-[#e8a928] text-[#805600]',
  };

  return (
    <article className="relative overflow-hidden rounded-xl border border-[#cbd7ce] bg-white p-5 shadow-soft">
      <span className={`absolute inset-x-0 bottom-0 h-1 ${accents[accent].split(' ')[0]}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#536158]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-[#161d19] tabular-nums">{value}</p>
      <p className="mt-2 text-sm text-[#536158]">{detail}</p>
    </article>
  );
}

export default AdminMetricCard;

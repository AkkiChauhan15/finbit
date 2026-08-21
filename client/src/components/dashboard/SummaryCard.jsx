function SummaryCard({ accent = 'emerald', className = '', label, value, detail }) {
  const accentClasses = {
    emerald: 'bg-[#00bc44] text-[#006e24]',
    sky: 'bg-[#6063ee] text-[#4648d4]',
    violet: 'bg-[#8b7cf6] text-[#5a45bd]',
    amber: 'bg-[#e8a928] text-[#805600]',
    rose: 'bg-[#e56b6f] text-[#a43a3a]',
  };

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-xl border border-[#cbd7ce] bg-white p-4 shadow-soft sm:p-5 ${className}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${accentClasses[accent].split(' ')[0]}`} />
      <div className="flex items-center justify-between gap-3">
        <p className="min-h-8 text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#536158]">
          {label}
        </p>
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${accentClasses[accent].split(' ')[0]}`}
        />
      </div>
      <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[#161d19] tabular-nums">
        {value}
      </p>
      <p className={`mt-2 line-clamp-2 text-xs leading-5 ${accentClasses[accent].split(' ')[1]}`}>
        {detail}
      </p>
    </article>
  );
}

export default SummaryCard;

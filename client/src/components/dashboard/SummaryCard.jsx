function SummaryCard({ accent = 'emerald', label, value, detail }) {
  const accentClasses = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  };

  return (
    <article className={`rounded-2xl border p-5 ${accentClasses[accent]}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold text-current sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs opacity-65">{detail}</p>
    </article>
  );
}

export default SummaryCard;

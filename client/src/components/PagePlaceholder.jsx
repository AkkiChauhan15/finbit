function PagePlaceholder({ title, description }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
      <p className="text-sm font-medium text-emerald-400">Phase 1 scaffold</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-400">{description}</p>
    </section>
  );
}

export default PagePlaceholder;

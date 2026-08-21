function PagePlaceholder({ title, description }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-8 shadow-2xl shadow-[#18221b]/10">
      <p className="text-sm font-medium text-[#007a2a]">Phase 1 scaffold</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#161d19]">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-[#536158]">{description}</p>
    </section>
  );
}

export default PagePlaceholder;

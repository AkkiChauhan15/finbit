function PageSkeleton({ label = 'Loading page', cards = 4, sections = 2 }) {
  return (
    <div className="animate-pulse space-y-8" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-[#e8f0e9]" />
        <div className="h-9 w-3/4 max-w-sm rounded bg-[#e8f0e9]" />
        <div className="h-4 w-full max-w-xl rounded bg-white" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: sections }, (_, index) => (
          <div
            key={index}
            className="h-72 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft"
          />
        ))}
      </div>
    </div>
  );
}

export default PageSkeleton;

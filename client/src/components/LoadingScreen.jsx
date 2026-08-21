function LoadingScreen() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f4fbf4] px-4 py-8 sm:px-6" role="status">
      <span className="sr-only">Restoring your session…</span>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-24 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft"
            />
          ))}
        </div>
        <div className="h-80 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft" />
      </div>
    </div>
  );
}

export default LoadingScreen;

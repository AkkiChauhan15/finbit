function LoadingScreen() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-950 px-4 py-8 sm:px-6" role="status">
      <span className="sr-only">Restoring your session…</span>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-24 rounded-2xl border border-slate-800 bg-slate-900" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-slate-800 bg-slate-900" />
          ))}
        </div>
        <div className="h-80 rounded-2xl border border-slate-800 bg-slate-900" />
      </div>
    </div>
  );
}

export default LoadingScreen;

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-rose-300">This view encountered an error</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Your data is still safe.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Reload the application to retry, or return to the dashboard if this page continues to
            fail.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950"
            >
              Reload application
            </button>
            <a
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2.5 font-semibold text-slate-300"
            >
              Go to dashboard
            </a>
          </div>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;

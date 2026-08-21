import { Link } from 'react-router-dom';

function AuthShell({ children, eyebrow, title, description, footerText, footerLink, footerLabel }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-center text-sm text-slate-400">
          {footerText}{' '}
          <Link className="font-semibold text-emerald-400 hover:text-emerald-300" to={footerLink}>
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default AuthShell;

import { Link } from 'react-router-dom';

function AuthShell({ children, eyebrow, title, description, footerText, footerLink, footerLabel }) {
  return (
    <main className="min-h-screen bg-[#f4fbf4] text-[#161d19] md:grid md:grid-cols-[minmax(320px,0.9fr)_minmax(480px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-[#e4f4e7] p-10 md:flex md:flex-col md:justify-between lg:p-14">
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#00bc44] text-xl font-black text-[#003e14]">
            W
          </span>
          <div>
            <p className="text-xl font-bold text-[#006e24]">WealthTracker</p>
            <p className="text-xs text-[#536158]">Financial habits that compound</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#006e24]">
            A calmer way to grow
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.03em] text-[#161d19] lg:text-5xl">
            Small habits. Clear progress. Lasting wealth.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#46544b]">
            Bring your spending, savings, habits, and net worth into one focused financial system.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#b8cfbd] bg-white/75 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6c7a71]">
                Savings momentum
              </p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-[#006e24]">+24%</p>
              <div className="mt-4 h-2 rounded-full bg-[#dfe9e1]">
                <div className="h-full w-3/4 rounded-full bg-[#00bc44]" />
              </div>
            </div>
            <div className="rounded-2xl border border-[#b8cfbd] bg-white/75 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6c7a71]">
                Habit streak
              </p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-[#161d19]">18 days</p>
              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: 7 }, (_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full ${index < 6 ? 'bg-[#00bc44]' : 'bg-[#dfe9e1]'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#6c7a71]">
          Secure by design. Your financial journey stays yours.
        </p>
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#6dff80]/25 blur-3xl" />
        <div className="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-[#c0c1ff]/30 blur-3xl" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-2 md:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00bc44] font-black text-[#003e14]">
              W
            </span>
            <p className="font-bold text-[#006e24]">WealthTracker</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#006e24]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.025em] text-[#161d19] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#536158]">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-[#536158]">
            {footerText}{' '}
            <Link className="font-bold text-[#006e24] hover:text-[#004f19]" to={footerLink}>
              {footerLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthShell;

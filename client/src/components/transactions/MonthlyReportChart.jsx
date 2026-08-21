import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatMonth } from '../../utils/formatters.js';

function MonthlyReportChart({ currency, formatCurrency, months }) {
  const data = months.map((item) => ({ ...item, label: formatMonth(item.month) }));
  const hasData = data.some((item) => item.income > 0 || item.expenses > 0);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <p className="text-sm font-medium text-slate-400">Last {months.length || 6} months</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Income vs expenses</h2>
      {!hasData ? (
        <div className="grid h-72 place-items-center text-center text-sm text-slate-500">
          Monthly comparisons will appear after you add income or expenses.
        </div>
      ) : (
        <div className="mt-6 h-72" aria-label="Bar chart comparing monthly income and expenses">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={72} />
              <Tooltip
                cursor={{ fill: '#1e293b', opacity: 0.45 }}
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
                formatter={(value) => formatCurrency(value, currency)}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#fb7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default MonthlyReportChart;

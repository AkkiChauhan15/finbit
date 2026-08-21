import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatMonth } from '../../utils/formatters.js';

function SavingsRateChart({ months }) {
  const data = months.map((month) => ({
    ...month,
    label: formatMonth(month.month),
    savingsRate:
      month.income > 0
        ? Math.round(((month.income - month.expenses) / month.income) * 1000) / 10
        : 0,
  }));
  const hasData = data.some((month) => month.income > 0 || month.expenses > 0);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-white">Monthly savings rate</h2>
      <p className="mt-1 text-sm text-slate-500">Income retained after recorded expenses.</p>
      {!hasData ? (
        <div className="grid h-72 place-items-center text-sm text-slate-500">
          Add income and expenses to see this trend.
        </div>
      ) : (
        <div className="mt-6 h-72" aria-label="Monthly savings rate line chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 12 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
                formatter={(value) => [`${value}%`, 'Savings rate']}
              />
              <Line type="monotone" dataKey="savingsRate" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default SavingsRateChart;

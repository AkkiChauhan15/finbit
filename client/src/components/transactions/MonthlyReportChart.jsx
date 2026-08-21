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
    <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <p className="text-sm font-medium text-[#536158]">Last {months.length || 6} months</p>
      <h2 className="mt-1 text-xl font-semibold text-[#161d19]">Income vs expenses</h2>
      {!hasData ? (
        <div className="grid h-72 place-items-center text-center text-sm text-[#6c7a71]">
          Monthly comparisons will appear after you add income or expenses.
        </div>
      ) : (
        <div className="mt-6 h-72" aria-label="Bar chart comparing monthly income and expenses">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="#e1e9e3" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#6c7a71" tickLine={false} axisLine={false} />
              <YAxis stroke="#6c7a71" tickLine={false} axisLine={false} width={72} />
              <Tooltip
                cursor={{ fill: '#e1e9e3', opacity: 0.45 }}
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #cbd7ce',
                  borderRadius: 8,
                }}
                formatter={(value) => formatCurrency(value, currency)}
              />
              <Legend wrapperStyle={{ color: '#536158', fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="#00a83d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#e56b6f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default MonthlyReportChart;

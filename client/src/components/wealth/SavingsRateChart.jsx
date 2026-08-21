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
    <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">Monthly savings rate</h2>
      <p className="mt-1 text-sm text-[#6c7a71]">Income retained after recorded expenses.</p>
      {!hasData ? (
        <div className="grid h-72 place-items-center text-sm text-[#6c7a71]">
          Add income and expenses to see this trend.
        </div>
      ) : (
        <div className="mt-6 h-72" aria-label="Monthly savings rate line chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 12 }}>
              <CartesianGrid stroke="#e1e9e3" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#6c7a71" tickLine={false} axisLine={false} />
              <YAxis stroke="#6c7a71" tickLine={false} axisLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #cbd7ce',
                  borderRadius: 8,
                }}
                formatter={(value) => [`${value}%`, 'Savings rate']}
              />
              <Line type="monotone" dataKey="savingsRate" stroke="#4648d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default SavingsRateChart;

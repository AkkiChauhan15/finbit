import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { categoryColors, categoryLabels } from '../../constants/transactions.js';

function CategoryBreakdownChart({ currency, formatCurrency, summary, total }) {
  const data = summary.map((item) => ({
    ...item,
    name: categoryLabels[item.category],
  }));

  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">Selected period</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Expense breakdown</h2>
        </div>
        <p className="text-right text-sm font-semibold text-rose-300">
          {formatCurrency(total, currency)}
        </p>
      </div>
      {data.length === 0 ? (
        <div className="grid h-72 place-items-center text-center text-sm text-slate-500">
          Add an expense in this period to see its category breakdown.
        </div>
      ) : (
        <div className="mt-4 h-72" aria-label="Donut chart of expenses by category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={categoryColors[entry.category]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => formatCurrency(value, currency)}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default CategoryBreakdownChart;

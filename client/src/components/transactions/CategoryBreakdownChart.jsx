import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { categoryColors, categoryLabels } from '../../constants/transactions.js';

function CategoryBreakdownChart({ currency, formatCurrency, summary, total }) {
  const data = summary.map((item) => ({
    ...item,
    name: categoryLabels[item.category],
  }));

  return (
    <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#536158]">Selected period</p>
          <h2 className="mt-1 text-xl font-semibold text-[#161d19]">Expense breakdown</h2>
        </div>
        <p className="text-right text-sm font-semibold text-[#a43a3a]">
          {formatCurrency(total, currency)}
        </p>
      </div>
      {data.length === 0 ? (
        <div className="grid h-72 place-items-center text-center text-sm text-[#6c7a71]">
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
                  background: '#ffffff',
                  border: '1px solid #cbd7ce',
                  borderRadius: 8,
                }}
                itemStyle={{ color: '#26352c' }}
                formatter={(value) => formatCurrency(value, currency)}
              />
              <Legend wrapperStyle={{ color: '#536158', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default CategoryBreakdownChart;

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { assetTypeColors } from '../../constants/assets.js';

function AssetAllocationChart({ allocation, currency, formatCurrency }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-white">Asset allocation</h2>
      <p className="mt-1 text-sm text-slate-500">Current value grouped by asset type.</p>
      {allocation.length === 0 ? (
        <div className="grid h-72 place-items-center text-sm text-slate-500">
          Add assets to see your allocation.
        </div>
      ) : (
        <div className="mt-4 h-72" aria-label="Asset allocation donut chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocation}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {allocation.map((item) => (
                  <Cell key={item.type} fill={assetTypeColors[item.type]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
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

export default AssetAllocationChart;

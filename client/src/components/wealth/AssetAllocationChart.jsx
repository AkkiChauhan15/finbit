import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { assetTypeColors } from '../../constants/assets.js';

function AssetAllocationChart({ allocation, currency, formatCurrency }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">Asset allocation</h2>
      <p className="mt-1 text-sm text-[#6c7a71]">Current value grouped by asset type.</p>
      {allocation.length === 0 ? (
        <div className="grid h-72 place-items-center text-sm text-[#6c7a71]">
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
                  background: '#ffffff',
                  border: '1px solid #cbd7ce',
                  borderRadius: 8,
                }}
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

export default AssetAllocationChart;

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatDate } from '../../utils/formatters.js';

function NetWorthTrendChart({ currency, formatCurrency, snapshots, title = 'Net worth trend' }) {
  const data = snapshots.map((snapshot) => ({
    ...snapshot,
    label: new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(snapshot.date)),
  }));

  return (
    <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">{title}</h2>
      <p className="mt-1 text-sm text-[#6c7a71]">Stored snapshots, shown chronologically.</p>
      {data.length < 2 ? (
        <div className="grid h-72 place-items-center px-6 text-center text-sm text-[#6c7a71]">
          Record at least two snapshots to see a meaningful trend.
        </div>
      ) : (
        <div className="mt-6 h-72" aria-label="Net worth trend line chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -12, right: 12 }}>
              <CartesianGrid stroke="#e1e9e3" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#6c7a71" tickLine={false} axisLine={false} />
              <YAxis stroke="#6c7a71" tickLine={false} axisLine={false} width={78} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #cbd7ce',
                  borderRadius: 8,
                }}
                labelFormatter={(_label, payload) =>
                  payload[0]?.payload?.date ? formatDate(payload[0].payload.date) : ''
                }
                formatter={(value) => [formatCurrency(value, currency), 'Net worth']}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#00a83d"
                strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#00a83d', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default NetWorthTrendChart;

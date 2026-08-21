import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatMonth } from '../../utils/formatters.js';

const chartData = (items) => items.map((item) => ({ ...item, label: formatMonth(item.month) }));

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #cbd7ce',
  borderRadius: 8,
};

function AdminAnalyticsCharts({ analytics }) {
  const activeUsers = chartData(analytics.monthlyActiveUsers);
  const financialActivity = chartData(analytics.monthlyFinancialActivity);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-[#161d19]">Monthly active users</h2>
        <p className="mt-1 text-sm text-[#6c7a71]">Distinct engaged accounts over six months.</p>
        <div className="mt-6 h-72" aria-label="Monthly active users trend chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeUsers} margin={{ left: -22, right: 12 }}>
              <CartesianGrid stroke="#e1e9e3" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#6c7a71" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#6c7a71" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active users"
                stroke="#00a83d"
                strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#00a83d', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-[#161d19]">Monthly financial activity</h2>
        <p className="mt-1 text-sm text-[#6c7a71]">Income and expense records added by users.</p>
        <div className="mt-6 h-72" aria-label="Monthly financial activity bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialActivity} margin={{ left: -22, right: 12 }}>
              <CartesianGrid stroke="#e1e9e3" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#6c7a71" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#6c7a71" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="incomeRecords"
                name="Income records"
                fill="#00a83d"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenseRecords"
                name="Expense records"
                fill="#e56b6f"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default AdminAnalyticsCharts;

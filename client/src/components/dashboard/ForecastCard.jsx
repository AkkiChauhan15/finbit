import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatMonth } from '../../utils/formatters.js';

function ForecastCard({ forecast, currency, formatCurrency }) {
  if (!forecast) {
    return (
      <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-xl font-semibold text-[#161d19]">Cash-flow forecast</h2>
        <p className="mt-5 py-10 text-center text-sm text-[#6c7a71]">
          Forecast is unavailable right now.
        </p>
      </section>
    );
  }

  const data = (forecast.projectedExpenses ?? []).map((expense, index) => ({
    month: expense.month,
    expenses: expense.amount,
    savings: forecast.projectedSavings?.[index]?.amount ?? 0,
  }));
  const risk = forecast.cashFlowShortageRisk;

  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">Cash-flow forecast</h2>
      <p className="mt-1 text-sm text-[#6c7a71]">
        Projected expenses and savings for the next {forecast.horizonMonths} months.
      </p>

      {(risk?.risk === 'high' || risk?.risk === 'medium') && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-[#a43a3a]">
          {risk.risk === 'high' ? 'High' : 'Medium'} cash-flow shortage risk
          {risk.firstShortageMonth ? ` from ${formatMonth(risk.firstShortageMonth)}` : ''}.{' '}
          {risk.reason}
        </div>
      )}

      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5ece7" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fontSize: 12, fill: '#536158' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#536158' }} width={60} />
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              labelFormatter={formatMonth}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#e56b6f"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="#00bc44"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default ForecastCard;

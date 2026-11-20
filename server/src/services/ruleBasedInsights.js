const formatPercent = (value) => `${Math.round(value)}%`;

export const buildRuleBasedReply = (summary) => {
  const insights = [];
  const { thisMonth, lastMonth, upcomingBills, savingsGoals, forecastRisk, anomalyCount } = summary;

  if (lastMonth.expenses > 0) {
    const change = ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100;

    if (change >= 10) {
      insights.push(`Your spending is up ${Math.round(change)}% compared to last month.`);
    } else if (change <= -10) {
      insights.push(
        `Your spending is down ${Math.round(Math.abs(change))}% compared to last month — nice work.`,
      );
    } else {
      insights.push('Your spending is roughly in line with last month.');
    }
  }

  if (thisMonth.income > 0) {
    if (thisMonth.savingsRate >= 20) {
      insights.push(
        `You are saving ${formatPercent(thisMonth.savingsRate)} of your income this month.`,
      );
    } else if (thisMonth.savingsRate >= 0) {
      insights.push(
        `You are saving ${formatPercent(thisMonth.savingsRate)} of your income this month — there is room to improve.`,
      );
    } else {
      insights.push(
        `Your expenses exceed your income this month by ${formatPercent(Math.abs(thisMonth.savingsRate))}.`,
      );
    }
  }

  const dueSoon = (upcomingBills ?? []).filter((bill) => bill.daysUntil <= 3);

  if (dueSoon.length > 0) {
    insights.push(
      `You have upcoming bills due soon: ${dueSoon.map((bill) => bill.name).join(', ')}.`,
    );
  }

  if (forecastRisk === 'high' || forecastRisk === 'medium') {
    insights.push('Your forecast shows a possible cash-flow shortage. Review upcoming expenses.');
  }

  if (anomalyCount > 0) {
    insights.push(
      `We flagged ${anomalyCount} unusually high expense${anomalyCount === 1 ? '' : 's'} recently.`,
    );
  }

  const goalsOnTrack = (savingsGoals ?? []).filter((goal) => goal.status === 'on-track').length;

  if (goalsOnTrack > 0) {
    insights.push(`${goalsOnTrack} of your savings goals are on track.`);
  }

  if (insights.length === 0) {
    return "I don't have enough financial data yet to offer insights. Record some income and expenses to get started.";
  }

  return insights.join(' ');
};

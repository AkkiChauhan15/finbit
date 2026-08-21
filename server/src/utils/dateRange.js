export const buildDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return undefined;
  }

  const range = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    range.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
    range.$lte = end;
  }

  return range;
};

export const roundTotal = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

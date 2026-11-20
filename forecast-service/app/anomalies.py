"""Plain-Python anomaly detection over grouped expenses."""

from statistics import mean, pstdev

ZSCORE_THRESHOLD = 2.5
MIN_SAMPLES_ZSCORE = 5
IQR_MULTIPLIER = 1.5


def _round(value):
    return round(value, 2)


def _quartiles(values):
    ordered = sorted(values)
    count = len(ordered)

    def quantile(fraction):
        position = fraction * (count - 1)
        lower = int(position)
        upper = min(lower + 1, count - 1)
        weight = position - lower
        return ordered[lower] + (ordered[upper] - ordered[lower]) * weight

    return quantile(0.25), quantile(0.75)


def _flag_zscore(expenses, amounts):
    average = mean(amounts)
    deviation = pstdev(amounts)

    if deviation == 0:
        return []

    flagged = []

    for expense in expenses:
        z_score = (expense.amount - average) / deviation

        if z_score > ZSCORE_THRESHOLD:
            flagged.append(
                {
                    "id": expense.id,
                    "category": expense.category,
                    "amount": _round(expense.amount),
                    "expectedRange": [_round(average - deviation), _round(average + deviation)],
                    "zScore": _round(z_score),
                    "method": "zscore",
                    "message": (
                        f"{expense.category} spending of {expense.amount:.2f} is unusually high "
                        f"compared to your typical {expense.category} spending."
                    ),
                }
            )

    return flagged


def _flag_iqr(expenses, amounts):
    q1, q3 = _quartiles(amounts)
    iqr = q3 - q1
    lower = q1 - IQR_MULTIPLIER * iqr
    upper = q3 + IQR_MULTIPLIER * iqr

    if upper <= max(amounts) and iqr == 0:
        return []

    flagged = []

    for expense in expenses:
        if expense.amount > upper:
            flagged.append(
                {
                    "id": expense.id,
                    "category": expense.category,
                    "amount": _round(expense.amount),
                    "expectedRange": [_round(lower), _round(upper)],
                    "zScore": None,
                    "method": "iqr",
                    "message": (
                        f"{expense.category} spending of {expense.amount:.2f} is unusually high "
                        f"compared to your typical {expense.category} spending."
                    ),
                }
            )

    return flagged


def detect_anomalies(expenses):
    grouped = {}

    for expense in expenses:
        grouped.setdefault(expense.category, []).append(expense)

    anomalies = []

    for _category, category_expenses in grouped.items():
        amounts = [expense.amount for expense in category_expenses]

        if len(amounts) >= MIN_SAMPLES_ZSCORE:
            anomalies.extend(_flag_zscore(category_expenses, amounts))
        else:
            anomalies.extend(_flag_iqr(category_expenses, amounts))

    return sorted(
        anomalies,
        key=lambda anomaly: (anomaly["zScore"] is None, -(anomaly["zScore"] or 0)),
    )

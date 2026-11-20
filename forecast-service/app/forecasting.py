"""Plain-Python forecasting helpers. No machine-learning dependencies."""

from datetime import date
from statistics import mean


def _totals(series):
    return [point.total for point in sorted(series, key=lambda point: point.month)]


def _linear_regression(values):
    """Return (slope, intercept) for a least-squares fit over index/value pairs."""
    n = len(values)
    xs = list(range(n))
    x_mean = mean(xs)
    y_mean = mean(values)
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, values, strict=True))
    denominator = sum((x - x_mean) ** 2 for x in xs)

    if denominator == 0:
        return 0.0, y_mean

    slope = numerator / denominator
    return slope, y_mean - slope * x_mean


def _project(values, horizon):
    """Project `horizon` future values from a historical series.

    With three or more points we blend a linear-regression trend with the trailing
    3-month moving average. With fewer points we fall back to a flat average.
    """
    if len(values) >= 3:
        slope, intercept = _linear_regression(values)
        baseline = mean(values[-3:])
        projections = [
            max(0.0, round(((intercept + slope * (len(values) - 1 + offset)) + baseline) / 2, 2))
            for offset in range(1, horizon + 1)
        ]
        return projections, "linear_regression_blend"

    baseline = round(mean(values), 2) if values else 0.0
    return [baseline] * horizon, "insufficient_data"


def _add_months(month, delta):
    year, month_number = (int(part) for part in month.split("-"))
    total = year * 12 + (month_number - 1) + delta
    next_year, next_month = divmod(total, 12)
    return f"{next_year:04d}-{next_month + 1:02d}"


def _future_months(expenses, income, horizon):
    months = [point.month for point in expenses] + [point.month for point in income]

    if not months:
        today = date.today()
        start = f"{today.year:04d}-{today.month:02d}"
    else:
        start = max(months)

    return [_add_months(start, offset) for offset in range(1, horizon + 1)]


def _shortage_risk(months, savings):
    shortage_index = next(
        (index for index, amount in enumerate(savings) if amount < 0),
        None,
    )

    if shortage_index is None:
        return {
            "risk": "low",
            "firstShortageMonth": None,
            "reason": "No projected cash-flow shortage within the horizon.",
        }

    first_shortage = months[shortage_index]
    risk = "high" if shortage_index == 0 else "medium" if shortage_index <= 2 else "low"

    return {
        "risk": risk,
        "firstShortageMonth": first_shortage,
        "reason": f"Projected expenses exceed projected income starting {first_shortage}.",
    }


def compute_forecast(request):
    horizon = request.horizonMonths
    expense_history = _totals(request.monthlyExpenses)
    income_history = _totals(request.monthlyIncome)
    months = _future_months(request.monthlyExpenses, request.monthlyIncome, horizon)

    projected_expenses, expense_method = _project(expense_history, horizon)
    projected_income, income_method = _project(income_history, horizon)

    savings = [
        round(income - expense, 2)
        for income, expense in zip(projected_income, projected_expenses, strict=True)
    ]

    return {
        "method": expense_method,
        "horizonMonths": horizon,
        "projectedExpenses": [
            {"month": month, "amount": amount}
            for month, amount in zip(months, projected_expenses, strict=True)
        ],
        "projectedIncome": [
            {"month": month, "amount": amount}
            for month, amount in zip(months, projected_income, strict=True)
        ],
        "projectedSavings": [
            {"month": month, "amount": amount}
            for month, amount in zip(months, savings, strict=True)
        ],
        "cashFlowShortageRisk": _shortage_risk(months, savings),
    }

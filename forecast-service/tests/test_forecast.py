from tests.conftest import INTERNAL_HEADERS

FULL_HISTORY = [
    {"month": "2026-01", "total": 1000},
    {"month": "2026-02", "total": 1100},
    {"month": "2026-03", "total": 1200},
    {"month": "2026-04", "total": 1300},
]

INCOME_HISTORY = [
    {"month": "2026-01", "total": 2000},
    {"month": "2026-02", "total": 2000},
    {"month": "2026-03", "total": 2000},
    {"month": "2026-04", "total": 2000},
]


def _forecast(client, expenses, income, horizon=3):
    return client.post(
        "/forecast",
        json={
            "monthlyExpenses": expenses,
            "monthlyIncome": income,
            "currentBalance": 500,
            "horizonMonths": horizon,
        },
        headers=INTERNAL_HEADERS,
    )


def test_insufficient_data_uses_flat_average(client):
    response = _forecast(
        client,
        [{"month": "2026-01", "total": 900}, {"month": "2026-02", "total": 1100}],
        [],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["method"] == "insufficient_data"
    amounts = [point["amount"] for point in body["projectedExpenses"]]
    assert amounts == [1000.0, 1000.0, 1000.0]


def test_regression_blend_with_enough_history(client):
    response = _forecast(client, FULL_HISTORY, INCOME_HISTORY)

    assert response.status_code == 200
    body = response.json()
    assert body["method"] == "linear_regression_blend"
    assert body["horizonMonths"] == 3
    assert len(body["projectedExpenses"]) == 3
    assert len(body["projectedIncome"]) == 3
    assert len(body["projectedSavings"]) == 3


def test_projected_savings_is_income_minus_expenses(client):
    response = _forecast(client, FULL_HISTORY, INCOME_HISTORY)

    body = response.json()
    for expense, income, saving in zip(
        body["projectedExpenses"],
        body["projectedIncome"],
        body["projectedSavings"],
        strict=True,
    ):
        assert round(income["amount"] - expense["amount"], 2) == saving["amount"]
        assert expense["month"] == saving["month"] == income["month"]


def test_shortage_risk_high_when_expenses_outpace_income(client):
    response = _forecast(
        client,
        [
            {"month": "2026-01", "total": 2500},
            {"month": "2026-02", "total": 2600},
            {"month": "2026-03", "total": 2700},
        ],
        [
            {"month": "2026-01", "total": 2000},
            {"month": "2026-02", "total": 2000},
            {"month": "2026-03", "total": 2000},
        ],
    )

    risk = response.json()["cashFlowShortageRisk"]
    assert risk["risk"] == "high"
    assert risk["firstShortageMonth"] == "2026-04"
    assert "exceed" in risk["reason"]


def test_no_shortage_when_income_exceeds_expenses(client):
    response = _forecast(
        client,
        [
            {"month": "2026-01", "total": 800},
            {"month": "2026-02", "total": 800},
            {"month": "2026-03", "total": 800},
        ],
        [
            {"month": "2026-01", "total": 2000},
            {"month": "2026-02", "total": 2000},
            {"month": "2026-03", "total": 2000},
        ],
    )

    risk = response.json()["cashFlowShortageRisk"]
    assert risk["risk"] == "low"
    assert risk["firstShortageMonth"] is None


def test_horizon_months_is_capped_at_six(client):
    response = _forecast(client, FULL_HISTORY, INCOME_HISTORY, horizon=7)

    assert response.status_code == 422


def test_invalid_month_format_is_rejected(client):
    response = _forecast(client, [{"month": "2026-13", "total": 900}], [], horizon=1)

    assert response.status_code == 422

from tests.conftest import INTERNAL_HEADERS


def _anomalies(client, expenses):
    return client.post("/anomalies", json={"expenses": expenses}, headers=INTERNAL_HEADERS)


def _expense(identifier, category, amount):
    return {"id": identifier, "date": "2026-08-01", "category": category, "amount": amount}


def test_zscore_flags_unusually_high_expense(client):
    expenses = [_expense(f"e{i}", "food", 100) for i in range(10)]
    expenses.append(_expense("outlier", "food", 500))

    response = _anomalies(client, expenses)

    assert response.status_code == 200
    anomalies = response.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["id"] == "outlier"
    assert anomalies[0]["method"] == "zscore"
    assert anomalies[0]["zScore"] > 2.5


def test_no_anomaly_when_spending_is_consistent(client):
    expenses = [_expense(f"e{i}", "food", 100) for i in range(6)]

    response = _anomalies(client, expenses)

    assert response.status_code == 200
    assert response.json()["anomalies"] == []


def test_iqr_fallback_for_fewer_than_five_samples(client):
    expenses = [
        _expense("a", "transport", 10),
        _expense("b", "transport", 12),
        _expense("c", "transport", 11),
        _expense("d", "transport", 80),
    ]

    response = _anomalies(client, expenses)

    anomalies = response.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["id"] == "d"
    assert anomalies[0]["method"] == "iqr"
    assert anomalies[0]["zScore"] is None


def test_categories_are_compared_independently(client):
    expenses = [
        *[_expense(f"food{i}", "food", 10) for i in range(8)],
        *[_expense(f"rent{i}", "rent", 1000) for i in range(5)],
        _expense("food-spike", "food", 200),
    ]

    response = _anomalies(client, expenses)

    anomalies = response.json()["anomalies"]
    assert len(anomalies) == 1
    assert anomalies[0]["id"] == "food-spike"


def test_list_is_capped_at_5000(client):
    expenses = [_expense(f"e{i}", "food", 10) for i in range(5001)]

    response = _anomalies(client, expenses)

    assert response.status_code == 422


def test_non_positive_amount_is_rejected(client):
    response = _anomalies(client, [_expense("x", "food", 0)])

    assert response.status_code == 422

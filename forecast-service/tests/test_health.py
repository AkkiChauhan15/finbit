def test_health_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "finbit-forecast-service"


def test_forecast_rejects_missing_internal_key(client):
    response = client.post(
        "/forecast",
        json={"monthlyExpenses": [], "monthlyIncome": [], "horizonMonths": 3},
    )

    assert response.status_code == 401


def test_anomalies_rejects_wrong_internal_key(client):
    response = client.post(
        "/anomalies",
        json={"expenses": []},
        headers={"X-Internal-Key": "wrong-key"},
    )

    assert response.status_code == 401

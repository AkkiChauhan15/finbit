import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

from .anomalies import detect_anomalies
from .forecasting import compute_forecast
from .schemas import AnomaliesRequest, ForecastRequest

app = FastAPI(title="Finbit Forecast Service", version="0.1.0")


def _require_internal_key(
    x_internal_key: Annotated[str, Header()] = "",
) -> None:
    expected = os.getenv("FORECAST_API_KEY", "")

    if not expected or x_internal_key != expected:
        raise HTTPException(status_code=401, detail="Invalid internal key")


@app.get("/health")
def health():
    return {"status": "ok", "service": "finbit-forecast-service"}


@app.post("/forecast", dependencies=[Depends(_require_internal_key)])
def forecast(payload: ForecastRequest):
    return compute_forecast(payload)


@app.post("/anomalies", dependencies=[Depends(_require_internal_key)])
def anomalies(payload: AnomaliesRequest):
    return {"anomalies": detect_anomalies(payload.expenses)}

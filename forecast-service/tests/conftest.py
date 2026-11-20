import os

import pytest
from fastapi.testclient import TestClient

os.environ["FORECAST_API_KEY"] = "test-internal-key"

from app.main import app  # noqa: E402

INTERNAL_HEADERS = {"X-Internal-Key": "test-internal-key"}


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client

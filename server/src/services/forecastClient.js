import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const REQUEST_TIMEOUT_MS = 8000;

const isConfigured = () => Boolean(env.forecastServiceUrl && env.forecastApiKey);

const postJson = async (path, payload) => {
  const response = await fetch(`${env.forecastServiceUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': env.forecastApiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new AppError('Forecast service request failed', 502);
  }

  return response.json();
};

const withRetry = async (operation) => {
  try {
    return await operation();
  } catch {
    // A single retry tolerates Render free-tier cold starts and transient blips.
    return operation();
  }
};

const requestForecastService = async (path, payload) => {
  if (!isConfigured()) {
    throw new AppError('Forecast service unavailable', 503);
  }

  try {
    return await withRetry(() => postJson(path, payload));
  } catch {
    throw new AppError('Forecast service unavailable', 503);
  }
};

export const requestForecast = (payload) => requestForecastService('/forecast', payload);

export const requestAnomalies = (expenses) => requestForecastService('/anomalies', { expenses });

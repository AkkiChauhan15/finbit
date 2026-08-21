import mongoose from 'mongoose';

import { env } from '../config/env.js';

const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export const getHealth = (_request, response) => {
  const database = databaseStates[mongoose.connection.readyState] ?? 'unknown';
  const isHealthy = env.nodeEnv !== 'production' || database === 'connected';

  response.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'unavailable',
    service: 'financial-habit-builder-api',
    timestamp: new Date().toISOString(),
    database,
  });
};

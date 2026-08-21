import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env, validateEnvironment } from './config/env.js';

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDatabase(env.mongoUri);

    const server = app.listen(env.port, '0.0.0.0', () => {
      console.log(`API listening on port ${env.port}`);
    });

    const shutDown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully.`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutDown('SIGINT'));
    process.on('SIGTERM', () => shutDown('SIGTERM'));
  } catch {
    console.error('Server startup failed. Check database and environment configuration.');
    process.exit(1);
  }
};

startServer();

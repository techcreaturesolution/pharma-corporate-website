import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

const start = async () => {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`API listening on ${env.apiBaseUrl}/api/v1 (${env.nodeEnv})`);
    console.log(`Docs: ${env.apiBaseUrl}/api/docs`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

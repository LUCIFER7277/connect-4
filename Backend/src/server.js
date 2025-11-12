require('dotenv').config();
const http = require('http');
const createApp = require('./app');
const initializeSocket = require('./socket');
const { initDatabase } = require('./config/database');
const gameService = require('./services/GameService');
const Logger = require('./utils/logger');

/**
 * Start the server
 */
async function startServer() {
  try {
    Logger.info('Starting 4 in a Row Game Server...');

    // Initialize database
    await initDatabase();
    Logger.success('Database initialized');

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(server);

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      Logger.success(`Server running on port ${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV}`);
      Logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
      Logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Cleanup old games every 30 minutes
    setInterval(() => {
      gameService.cleanupOldGames();
    }, 1800000);

    // Graceful shutdown
    process.on('SIGTERM', () => shutdown(server));
    process.on('SIGINT', () => shutdown(server));

  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(server) {
  Logger.info('Shutting down server gracefully...');

  server.close(() => {
    Logger.info('HTTP server closed');
  });

  // Close database connections
  const { pool } = require('./config/database');
  await pool.end();
  Logger.info('Database connections closed');

  Logger.success('Server shut down successfully');
  process.exit(0);
}

// Start the server
startServer();

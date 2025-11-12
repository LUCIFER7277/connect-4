const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const playerRoutes = require('./routes/playerRoutes');
const Logger = require('./utils/logger');

/**
 * Express Application Setup
 */
function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5176',
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    Logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: '4 in a Row Game API',
      version: '1.0.0',
      description: 'Real-time multiplayer Connect Four game',
      endpoints: {
        health: 'GET /health - Server health check',
        rest: {
          leaderboard: 'GET /api/players/leaderboard?limit=10 - Get top players',
        },
        socket: {
          url: 'ws://localhost:3000',
          events: {
            client: {
              joinGame: 'Join matchmaking queue',
              makeMove: 'Make a move in active game',
              leaveGame: 'Leave current game',
            },
            server: {
              gameFound: 'Match found, game starting',
              moveMade: 'Board updated after move',
              gameOver: 'Game ended with result',
              opponentDisconnected: 'Opponent connection lost',
              opponentReconnected: 'Opponent reconnected',
              error: 'Error occurred',
            },
          },
        },
      },
      note: 'All game operations use Socket.IO for real-time communication',
    });
  });

  // API Routes - Player leaderboard only
  app.use('/api/players', playerRoutes);

  // 404 handler
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

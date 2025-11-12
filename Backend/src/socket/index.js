const { Server } = require('socket.io');
const GameHandlers = require('./gameHandlers');
const gameService = require('../services/GameService');
const Logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../constants/gameConstants');

/**
 * Initialize Socket.IO server
 */
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set IO instance in game service for bot notifications
  gameService.setIO(io);

  // Connection event
  io.on('connection', (socket) => {
    Logger.success('Client connected', { socketId: socket.id });

    // Join game
    socket.on(SOCKET_EVENTS.JOIN_GAME, (data) => {
      GameHandlers.handleJoinGame(socket, io, data);
    });

    // Make move
    socket.on(SOCKET_EVENTS.MAKE_MOVE, (data) => {
      GameHandlers.handleMakeMove(socket, io, data);
    });

    // Get leaderboard
    socket.on(SOCKET_EVENTS.GET_LEADERBOARD, (data) => {
      GameHandlers.handleGetLeaderboard(socket, data);
    });

    // Reconnect to game
    socket.on(SOCKET_EVENTS.RECONNECT_GAME, (data) => {
      GameHandlers.handleReconnect(socket, io, data);
    });

    // New game
    socket.on(SOCKET_EVENTS.NEW_GAME, (data) => {
      GameHandlers.handleNewGame(socket, io, data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      GameHandlers.handleDisconnect(socket, io);
    });

    // Error handling
    socket.on('error', (error) => {
      Logger.error('Socket error', { socketId: socket.id, error });
    });
  });

  Logger.success('Socket.IO server initialized');

  return io;
}

module.exports = initializeSocket;

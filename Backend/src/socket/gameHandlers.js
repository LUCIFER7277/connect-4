const gameService = require('../services/GameService');
const PlayerModel = require('../models/Player');
const Logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../constants/gameConstants');
const { GameError, ValidationError } = require('../utils/errorTypes');

/**
 * Socket.IO Game Event Handlers
 */
class GameHandlers {
  /**
   * Handle player joining game
   */
  static async handleJoinGame(socket, io, data) {
    try {
      const { username } = data;

      if (!username || username.trim().length === 0) {
        throw new ValidationError('Username is required');
      }

      if (username.trim().length > 20) {
        throw new ValidationError('Username must be 20 characters or less');
      }

      Logger.info('Player joining game', { socketId: socket.id, username });

      const result = await gameService.joinMatchmaking(socket.id, username.trim());

      if (result.matched) {
        const { game, opponent } = result;

        // Join both players to game room
        socket.join(game.id);

        if (opponent.socketId) {
          // Get opponent socket and join them to the game room
          const opponentSocket = io.sockets.sockets.get(opponent.socketId);
          if (opponentSocket) {
            opponentSocket.join(game.id);
          }

          io.to(opponent.socketId).emit(SOCKET_EVENTS.GAME_FOUND, {
            gameId: game.id,
            opponent: { username: game.player2.username },
            playerNumber: 1,
            board: game.board,
            currentPlayer: game.currentPlayer,
          });
        }

        // Send game found event to new player
        socket.emit(SOCKET_EVENTS.GAME_FOUND, {
          gameId: game.id,
          opponent: { username: opponent.username, isBot: opponent.isBot },
          playerNumber: 2,
          board: game.board,
          currentPlayer: game.currentPlayer,
        });

        Logger.success('Game found', { gameId: game.id, players: [game.player1.username, game.player2.username] });
      } else {
        Logger.info('Player waiting for opponent', { username });
        // Player is waiting - frontend will show "Finding opponent..." message
      }
    } catch (error) {
      Logger.error('Error in handleJoinGame', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message || 'Failed to join game',
        errorCode: error.errorCode || 'JOIN_ERROR',
      });
    }
  }

  /**
   * Handle player making a move
   */
  static async handleMakeMove(socket, io, data) {
    try {
      const { column } = data;

      if (typeof column !== 'number' || column < 0 || column > 6) {
        throw new ValidationError('Invalid column number');
      }

      Logger.debug('Player making move', { socketId: socket.id, column });

      const result = await gameService.makeMove(socket.id, column);
      const { game, winner, isDraw, gameOver } = result;

      // Broadcast move to all players in the game
      io.to(game.id).emit(SOCKET_EVENTS.MOVE_MADE, {
        board: game.board,
        currentPlayer: game.currentPlayer,
        column,
      });

      // If game is over, send game over event
      if (gameOver) {
        io.to(game.id).emit(SOCKET_EVENTS.GAME_OVER, {
          winner: winner,
          isDraw: isDraw || false,
          board: game.board,
        });

        Logger.success('Game over', { gameId: game.id, winner, isDraw });
      }
    } catch (error) {
      Logger.error('Error in handleMakeMove', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message || 'Failed to make move',
        errorCode: error.errorCode || 'MOVE_ERROR',
      });
    }
  }

  /**
   * Handle get leaderboard
   */
  static async handleGetLeaderboard(socket, data) {
    try {
      const limit = data?.limit || 10;
      const leaderboard = await PlayerModel.getLeaderboard(limit);

      socket.emit(SOCKET_EVENTS.LEADERBOARD_DATA, {
        leaderboard,
      });

      Logger.debug('Leaderboard sent', { socketId: socket.id, count: leaderboard.length });
    } catch (error) {
      Logger.error('Error in handleGetLeaderboard', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to fetch leaderboard',
        errorCode: 'LEADERBOARD_ERROR',
      });
    }
  }

  /**
   * Handle player reconnection
   */
  static async handleReconnect(socket, io, data) {
    try {
      const { gameId, playerNumber } = data;

      if (!gameId || !playerNumber) {
        throw new ValidationError('Game ID and player number are required');
      }

      const game = gameService.handleReconnect(socket.id, gameId, playerNumber);

      if (game) {
        socket.join(gameId);

        // Send current game state
        socket.emit(SOCKET_EVENTS.GAME_UPDATE, {
          gameId: game.id,
          board: game.board,
          currentPlayer: game.currentPlayer,
          status: game.status,
        });

        // Notify opponent
        const opponentNumber = playerNumber === 1 ? 2 : 1;
        const opponentSocketId = gameService.playerToSocket.get(`${gameId}-${opponentNumber}`);

        if (opponentSocketId) {
          io.to(opponentSocketId).emit(SOCKET_EVENTS.OPPONENT_RECONNECTED);
        }

        Logger.success('Player reconnected', { gameId, playerNumber });
      }
    } catch (error) {
      Logger.error('Error in handleReconnect', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message || 'Failed to reconnect',
        errorCode: error.errorCode || 'RECONNECT_ERROR',
      });
    }
  }

  /**
   * Handle player disconnect
   */
  static handleDisconnect(socket, io) {
    try {
      Logger.info('Player disconnected', { socketId: socket.id });

      const game = gameService.getGameBySocket(socket.id);

      if (game) {
        // Notify opponent
        const playerData = gameService.socketToPlayer.get(socket.id);
        if (playerData) {
          const opponentNumber = playerData.playerNumber === 1 ? 2 : 1;
          const opponentSocketId = gameService.playerToSocket.get(`${game.id}-${opponentNumber}`);

          if (opponentSocketId) {
            io.to(opponentSocketId).emit(SOCKET_EVENTS.OPPONENT_DISCONNECTED);
          }
        }
      }

      gameService.handleDisconnect(socket.id);
    } catch (error) {
      Logger.error('Error in handleDisconnect', error);
    }
  }

  /**
   * Handle new game request
   */
  static async handleNewGame(socket, io, data) {
    try {
      const { username } = data;

      if (!username) {
        throw new ValidationError('Username is required');
      }

      // Same as join game
      await this.handleJoinGame(socket, io, { username });
    } catch (error) {
      Logger.error('Error in handleNewGame', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message || 'Failed to start new game',
        errorCode: error.errorCode || 'NEW_GAME_ERROR',
      });
    }
  }
}

module.exports = GameHandlers;

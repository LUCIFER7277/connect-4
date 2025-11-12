const { v4: uuidv4 } = require('uuid');
const GameLogic = require('../utils/gameLogic');
const BotAI = require('../utils/botAI');
const GameModel = require('../models/Game');
const PlayerModel = require('../models/Player');
const Logger = require('../utils/logger');
const { GameError } = require('../utils/errorTypes');
const {
  GAME_CONFIG,
  GAME_STATUS,
  GAME_RESULT,
  PLAYER_STATUS,
} = require('../constants/gameConstants');

/**
 * Game Service - Manages in-memory game state and logic
 */
class GameService {
  constructor() {
    // Active games in memory (gameId -> game state)
    this.games = new Map();

    // Players waiting for match (socketId -> player info)
    this.waitingPlayers = new Map();

    // Socket to player mapping
    this.socketToPlayer = new Map();

    // Player to socket mapping
    this.playerToSocket = new Map();

    // Reconnection timers
    this.reconnectTimers = new Map();

    // Socket.IO server instance
    this.io = null;
  }

  /**
   * Set Socket.IO server instance
   */
  setIO(io) {
    this.io = io;
  }

  /**
   * Add player to matchmaking queue
   */
  async joinMatchmaking(socketId, username) {
    try {
      // Find or create player in database
      const player = await PlayerModel.findOrCreate(username);

      // Create player info
      const playerInfo = {
        id: player.id,
        username: player.username,
        socketId,
        status: PLAYER_STATUS.CONNECTED,
        joinedAt: Date.now(),
      };

      // Check if there's a waiting player
      if (this.waitingPlayers.size > 0) {
        // Match with first waiting player
        const [waitingSocketId, waitingPlayer] = this.waitingPlayers.entries().next().value;
        this.waitingPlayers.delete(waitingSocketId);

        // Create game
        const game = await this.createGame(waitingPlayer, playerInfo);

        Logger.success('Players matched', {
          gameId: game.id,
          player1: waitingPlayer.username,
          player2: playerInfo.username,
        });

        return { matched: true, game, opponent: waitingPlayer };
      } else {
        // Add to waiting queue
        this.waitingPlayers.set(socketId, playerInfo);

        // Set timeout for bot match
        setTimeout(() => {
          if (this.waitingPlayers.has(socketId)) {
            this.matchWithBot(socketId, playerInfo);
          }
        }, GAME_CONFIG.MATCHMAKING_TIMEOUT);

        Logger.info('Player added to matchmaking queue', { username });
        return { matched: false, playerInfo };
      }
    } catch (error) {
      Logger.error('Failed to join matchmaking', error);
      throw error;
    }
  }

  /**
   * Match player with bot
   */
  async matchWithBot(socketId, playerInfo) {
    try {
      this.waitingPlayers.delete(socketId);

      const botPlayer = {
        id: null, // Bot has no database ID
        username: 'Bot',
        socketId: null,
        status: PLAYER_STATUS.CONNECTED,
        isBot: true,
      };

      const game = await this.createGame(playerInfo, botPlayer);

      Logger.success('Player matched with bot', {
        gameId: game.id,
        player: playerInfo.username,
      });

      // Emit game found event to the player
      if (this.io) {
        // Get player socket and join them to the game room
        const playerSocket = this.io.sockets.sockets.get(socketId);
        if (playerSocket) {
          playerSocket.join(game.id);
        }

        this.io.to(socketId).emit('gameFound', {
          gameId: game.id,
          opponent: { username: botPlayer.username, isBot: true },
          playerNumber: 1,
          board: game.board,
          currentPlayer: game.currentPlayer,
        });
      }

      return { game, opponent: botPlayer };
    } catch (error) {
      Logger.error('Failed to match with bot', error);
      throw error;
    }
  }

  /**
   * Create a new game
   */
  async createGame(player1Info, player2Info) {
    try {
      const gameId = uuidv4();
      const board = GameLogic.createEmptyBoard();

      const game = {
        id: gameId,
        player1: player1Info,
        player2: player2Info,
        board,
        currentPlayer: 1, // Player 1 starts
        status: GAME_STATUS.PLAYING,
        winner: null,
        isDraw: false,
        startedAt: Date.now(),
        moveCount: 0,
      };

      // Store in memory
      this.games.set(gameId, game);

      // Map sockets to game
      if (player1Info.socketId) {
        this.socketToPlayer.set(player1Info.socketId, { gameId, playerNumber: 1 });
        this.playerToSocket.set(`${gameId}-1`, player1Info.socketId);
      }

      if (player2Info.socketId && !player2Info.isBot) {
        this.socketToPlayer.set(player2Info.socketId, { gameId, playerNumber: 2 });
        this.playerToSocket.set(`${gameId}-2`, player2Info.socketId);
      }

      // Save to database (use NULL for bot player)
      if (player1Info.id) {
        const player2Id = player2Info.isBot ? null : player2Info.id;
        await GameModel.create(gameId, player1Info.id, player2Id, board);
      }

      return game;
    } catch (error) {
      Logger.error('Failed to create game', error);
      throw error;
    }
  }

  /**
   * Make a move
   */
  async makeMove(socketId, column) {
    try {
      const playerData = this.socketToPlayer.get(socketId);
      if (!playerData) {
        throw new GameError('Player not in any game');
      }

      const { gameId, playerNumber } = playerData;
      const game = this.games.get(gameId);

      if (!game) {
        throw new GameError('Game not found');
      }

      // Check if it's player's turn
      if (game.currentPlayer !== playerNumber) {
        throw new GameError('Not your turn');
      }

      // Check if game is still playing
      if (game.status !== GAME_STATUS.PLAYING) {
        throw new GameError('Game is not in progress');
      }

      // Validate and make move
      const row = GameLogic.dropDisc(game.board, column, playerNumber);
      game.moveCount++;

      // Save move to database
      const player = playerNumber === 1 ? game.player1 : game.player2;
      if (player.id && !player.isBot) {
        await GameModel.saveMove(gameId, player.id, column, row, game.moveCount);
      }

      // Check for winner
      const winner = GameLogic.checkWinner(game.board);
      if (winner) {
        await this.endGame(gameId, winner, GAME_RESULT.WIN);
        return { game, winner, gameOver: true };
      }

      // Check for draw
      if (GameLogic.isBoardFull(game.board)) {
        await this.endGame(gameId, null, GAME_RESULT.DRAW);
        return { game, winner: null, isDraw: true, gameOver: true };
      }

      // Switch turn
      game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;

      // If next player is bot, make bot move
      const nextPlayer = game.currentPlayer === 1 ? game.player1 : game.player2;
      if (nextPlayer.isBot) {
        // Schedule bot move with delay
        setTimeout(() => {
          this.makeBotMove(gameId);
        }, GAME_CONFIG.BOT_MOVE_DELAY);
      }

      return { game, winner: null, gameOver: false };
    } catch (error) {
      Logger.error('Failed to make move', error);
      throw error;
    }
  }

  /**
   * Make bot move
   */
  async makeBotMove(gameId) {
    try {
      const game = this.games.get(gameId);
      if (!game || game.status !== GAME_STATUS.PLAYING) {
        return;
      }

      const botPlayer = game.currentPlayer === 1 ? game.player1 : game.player2;
      if (!botPlayer.isBot) {
        return;
      }

      // Get best move from AI
      const column = BotAI.getBestMove(game.board, game.currentPlayer, 'medium');
      if (column === null) {
        Logger.warn('Bot could not find valid move');
        return;
      }

      // Make move
      const row = GameLogic.dropDisc(game.board, column, game.currentPlayer);
      game.moveCount++;

      Logger.info('Bot made move', { gameId, column, row });

      // Broadcast move to player
      if (this.io) {
        this.io.to(gameId).emit('moveMade', {
          board: game.board,
          currentPlayer: game.currentPlayer === 1 ? 2 : 1, // Will switch after
          column,
        });
      }

      // Check for winner
      const winner = GameLogic.checkWinner(game.board);
      if (winner) {
        await this.endGame(gameId, winner, GAME_RESULT.WIN);

        // Emit game over event
        if (this.io) {
          this.io.to(gameId).emit('gameOver', {
            winner: winner,
            isDraw: false,
            board: game.board,
          });
        }

        return { game, winner, gameOver: true };
      }

      // Check for draw
      if (GameLogic.isBoardFull(game.board)) {
        await this.endGame(gameId, null, GAME_RESULT.DRAW);

        // Emit game over event
        if (this.io) {
          this.io.to(gameId).emit('gameOver', {
            winner: null,
            isDraw: true,
            board: game.board,
          });
        }

        return { game, winner: null, isDraw: true, gameOver: true };
      }

      // Switch turn back to human player
      game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;

      return { game, winner: null, gameOver: false };
    } catch (error) {
      Logger.error('Bot move failed', error);
    }
  }

  /**
   * End game
   */
  async endGame(gameId, winner, result) {
    try {
      const game = this.games.get(gameId);
      if (!game) {
        throw new GameError('Game not found');
      }

      game.status = GAME_STATUS.FINISHED;
      game.winner = winner;
      game.isDraw = result === GAME_RESULT.DRAW;
      game.endedAt = Date.now();

      // Update database
      const winnerId = winner === 1 ? game.player1.id : winner === 2 ? game.player2.id : null;
      if (game.player1.id && game.player2.id) {
        await GameModel.endGame(gameId, winnerId, result);
      }

      Logger.success('Game ended', { gameId, winner, result });
    } catch (error) {
      Logger.error('Failed to end game', error);
      throw error;
    }
  }

  /**
   * Handle player disconnect
   */
  handleDisconnect(socketId) {
    try {
      // Remove from waiting queue
      if (this.waitingPlayers.has(socketId)) {
        this.waitingPlayers.delete(socketId);
        Logger.info('Player removed from matchmaking queue');
        return;
      }

      // Check if player is in a game
      const playerData = this.socketToPlayer.get(socketId);
      if (!playerData) {
        return;
      }

      const { gameId, playerNumber } = playerData;
      const game = this.games.get(gameId);

      if (!game || game.status !== GAME_STATUS.PLAYING) {
        this.socketToPlayer.delete(socketId);
        return;
      }

      const player = playerNumber === 1 ? game.player1 : game.player2;
      player.status = PLAYER_STATUS.DISCONNECTED;

      Logger.warn('Player disconnected', { gameId, player: player.username });

      // Set reconnection timer
      const timerId = setTimeout(() => {
        this.forfeitGame(gameId, playerNumber);
      }, GAME_CONFIG.RECONNECT_TIMEOUT);

      this.reconnectTimers.set(socketId, timerId);
    } catch (error) {
      Logger.error('Error handling disconnect', error);
    }
  }

  /**
   * Handle player reconnect
   */
  handleReconnect(socketId, gameId, playerNumber) {
    try {
      const game = this.games.get(gameId);
      if (!game) {
        throw new GameError('Game not found');
      }

      const player = playerNumber === 1 ? game.player1 : game.player2;
      player.status = PLAYER_STATUS.CONNECTED;
      player.socketId = socketId;

      // Clear reconnection timer
      const oldSocketId = this.playerToSocket.get(`${gameId}-${playerNumber}`);
      if (oldSocketId && this.reconnectTimers.has(oldSocketId)) {
        clearTimeout(this.reconnectTimers.get(oldSocketId));
        this.reconnectTimers.delete(oldSocketId);
        this.socketToPlayer.delete(oldSocketId);
      }

      // Update mappings
      this.socketToPlayer.set(socketId, { gameId, playerNumber });
      this.playerToSocket.set(`${gameId}-${playerNumber}`, socketId);

      Logger.success('Player reconnected', { gameId, player: player.username });

      return game;
    } catch (error) {
      Logger.error('Error handling reconnect', error);
      throw error;
    }
  }

  /**
   * Forfeit game due to disconnect timeout
   */
  async forfeitGame(gameId, playerNumber) {
    try {
      const game = this.games.get(gameId);
      if (!game || game.status !== GAME_STATUS.PLAYING) {
        return;
      }

      Logger.info('Game forfeited due to disconnect', { gameId, playerNumber });

      // Winner is the other player
      const winner = playerNumber === 1 ? 2 : 1;
      await this.endGame(gameId, winner, GAME_RESULT.FORFEIT);

      return game;
    } catch (error) {
      Logger.error('Error forfeiting game', error);
    }
  }

  /**
   * Get game by ID
   */
  getGame(gameId) {
    return this.games.get(gameId);
  }

  /**
   * Get game by socket ID
   */
  getGameBySocket(socketId) {
    const playerData = this.socketToPlayer.get(socketId);
    if (!playerData) {
      return null;
    }
    return this.games.get(playerData.gameId);
  }

  /**
   * Clean up old games (can be called periodically)
   */
  cleanupOldGames(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [gameId, game] of this.games.entries()) {
      if (game.status === GAME_STATUS.FINISHED && now - game.endedAt > maxAge) {
        this.games.delete(gameId);
        Logger.debug('Cleaned up old game', { gameId });
      }
    }
  }
}

// Create singleton instance
const gameService = new GameService();

module.exports = gameService;

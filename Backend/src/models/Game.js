const { query, getClient } = require('../config/database');
const { DatabaseError, NotFoundError } = require('../utils/errorTypes');
const { GAME_STATUS } = require('../constants/gameConstants');
const Logger = require('../utils/logger');

/**
 * Game Model
 */
class Game {
  /**
   * Create a new game
   */
  static async create(gameId, player1Id, player2Id, boardState) {
    try {
      const result = await query(
        `INSERT INTO games (id, player1_id, player2_id, status, board_state)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [gameId, player1Id, player2Id, GAME_STATUS.PLAYING, JSON.stringify(boardState)]
      );

      Logger.success('Game created', { gameId, player1Id, player2Id });
      return result.rows[0];
    } catch (error) {
      Logger.error('Failed to create game', { gameId, error: error.message });
      throw new DatabaseError('Failed to create game');
    }
  }

  /**
   * Get game by ID
   */
  static async findById(gameId) {
    try {
      const result = await query(
        'SELECT * FROM games WHERE id = $1',
        [gameId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Game not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error('Failed to find game', { gameId, error: error.message });
      throw new DatabaseError('Failed to fetch game');
    }
  }

  /**
   * Update game board state
   */
  static async updateBoardState(gameId, boardState) {
    try {
      await query(
        'UPDATE games SET board_state = $1 WHERE id = $2',
        [JSON.stringify(boardState), gameId]
      );

      Logger.debug('Game board state updated', { gameId });
    } catch (error) {
      Logger.error('Failed to update board state', { gameId, error: error.message });
      throw new DatabaseError('Failed to update game');
    }
  }

  /**
   * End game and set winner
   */
  static async endGame(gameId, winnerId, result) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Update game status
      await client.query(
        `UPDATE games
         SET status = $1, result = $2, winner_id = $3, ended_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [GAME_STATUS.FINISHED, result, winnerId, gameId]
      );

      // Get game details to update player stats
      const gameResult = await client.query(
        'SELECT player1_id, player2_id FROM games WHERE id = $1',
        [gameId]
      );

      const game = gameResult.rows[0];

      // Update player stats
      if (winnerId) {
        // Winner gets a win
        await client.query(
          `UPDATE players
           SET total_wins = total_wins + 1, total_games = total_games + 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [winnerId]
        );

        // Loser gets a loss
        const loserId = winnerId === game.player1_id ? game.player2_id : game.player1_id;
        await client.query(
          `UPDATE players
           SET total_losses = total_losses + 1, total_games = total_games + 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [loserId]
        );
      } else {
        // Draw - both players get a draw
        await client.query(
          `UPDATE players
           SET total_draws = total_draws + 1, total_games = total_games + 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1::int[])`,
          [[game.player1_id, game.player2_id]]
        );
      }

      await client.query('COMMIT');
      Logger.success('Game ended', { gameId, winnerId, result });
    } catch (error) {
      await client.query('ROLLBACK');
      Logger.error('Failed to end game', { gameId, error: error.message });
      throw new DatabaseError('Failed to end game');
    } finally {
      client.release();
    }
  }

  /**
   * Save a move
   */
  static async saveMove(gameId, playerId, columnIndex, rowIndex, moveNumber) {
    try {
      await query(
        `INSERT INTO game_moves (game_id, player_id, column_index, row_index, move_number)
         VALUES ($1, $2, $3, $4, $5)`,
        [gameId, playerId, columnIndex, rowIndex, moveNumber]
      );

      Logger.debug('Move saved', { gameId, playerId, columnIndex, rowIndex });
    } catch (error) {
      Logger.error('Failed to save move', { gameId, error: error.message });
      throw new DatabaseError('Failed to save move');
    }
  }

  /**
   * Get game moves
   */
  static async getMoves(gameId) {
    try {
      const result = await query(
        `SELECT * FROM game_moves
         WHERE game_id = $1
         ORDER BY move_number ASC`,
        [gameId]
      );

      return result.rows;
    } catch (error) {
      Logger.error('Failed to fetch game moves', { gameId, error: error.message });
      throw new DatabaseError('Failed to fetch game moves');
    }
  }
}

module.exports = Game;

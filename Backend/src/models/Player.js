const { query } = require('../config/database');
const { DatabaseError, NotFoundError } = require('../utils/errorTypes');
const Logger = require('../utils/logger');

/**
 * Player Model
 */
class Player {
  /**
   * Find or create a player by username
   */
  static async findOrCreate(username) {
    try {
      // Try to find existing player
      let result = await query(
        'SELECT * FROM players WHERE username = $1',
        [username]
      );

      if (result.rows.length > 0) {
        Logger.debug('Player found', { username });
        return result.rows[0];
      }

      // Create new player
      result = await query(
        `INSERT INTO players (username)
         VALUES ($1)
         RETURNING *`,
        [username]
      );

      Logger.success('Player created', { username });
      return result.rows[0];
    } catch (error) {
      Logger.error('Failed to find or create player', { username, error: error.message });
      throw new DatabaseError('Failed to create player');
    }
  }

  /**
   * Get player by ID
   */
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM players WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Player not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error('Failed to find player by ID', { id, error: error.message });
      throw new DatabaseError('Failed to fetch player');
    }
  }

  /**
   * Get player by username
   */
  static async findByUsername(username) {
    try {
      const result = await query(
        'SELECT * FROM players WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Player not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error('Failed to find player by username', { username, error: error.message });
      throw new DatabaseError('Failed to fetch player');
    }
  }

  /**
   * Update player stats after game
   */
  static async updateStats(playerId, result) {
    try {
      const updates = {
        total_games: 1,
        total_wins: result === 'win' ? 1 : 0,
        total_losses: result === 'loss' ? 1 : 0,
        total_draws: result === 'draw' ? 1 : 0,
      };

      await query(
        `UPDATE players
         SET
           total_games = total_games + $1,
           total_wins = total_wins + $2,
           total_losses = total_losses + $3,
           total_draws = total_draws + $4,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [updates.total_games, updates.total_wins, updates.total_losses, updates.total_draws, playerId]
      );

      Logger.info('Player stats updated', { playerId, result });
    } catch (error) {
      Logger.error('Failed to update player stats', { playerId, error: error.message });
      throw new DatabaseError('Failed to update player stats');
    }
  }

  /**
   * Get leaderboard (top players by wins)
   */
  static async getLeaderboard(limit = 10) {
    try {
      const result = await query(
        `SELECT
           username,
           total_games,
           total_wins,
           total_losses,
           total_draws,
           CASE
             WHEN total_games > 0
             THEN ROUND((total_wins::NUMERIC / total_games::NUMERIC) * 100, 2)
             ELSE 0
           END as win_rate
         FROM players
         WHERE total_games > 0
         ORDER BY total_wins DESC, win_rate DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      Logger.error('Failed to fetch leaderboard', error);
      throw new DatabaseError('Failed to fetch leaderboard');
    }
  }
}

module.exports = Player;

const PlayerModel = require('../models/Player');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/errorTypes');
const Logger = require('../utils/logger');

/**
 * Player Controller - Handles player-related operations
 * Player creation and stats are handled via Socket.IO events
 */
class PlayerController {
  /**
   * Get leaderboard
   * GET /api/players/leaderboard
   * Used by: frontend/src/components/Leaderboard.jsx
   */
  static getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const leaderboard = await PlayerModel.getLeaderboard(limit);

    Logger.info('Leaderboard fetched via REST API', { limit });

    res.status(200).json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    });
  });
}

module.exports = PlayerController;

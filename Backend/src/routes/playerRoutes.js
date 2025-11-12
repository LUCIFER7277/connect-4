const express = require('express');
const PlayerController = require('../controllers/playerController');

const router = express.Router();

/**
 * Player Routes
 * Only includes endpoints used by the frontend
 */

// GET /api/players/leaderboard - Get leaderboard (used by Leaderboard.jsx)
router.get('/leaderboard', PlayerController.getLeaderboard);

module.exports = router;

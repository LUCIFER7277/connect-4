/**
 * Game Constants and Configuration
 */

const GAME_CONFIG = {
  ROWS: 6,
  COLS: 7,
  WIN_COUNT: 4,
  RECONNECT_TIMEOUT: 30000, // 30 seconds in milliseconds
  BOT_MOVE_DELAY: 1000, // 1 second delay for bot moves
  MATCHMAKING_TIMEOUT: 10000, // 10 seconds to find opponent before bot
};

const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
  ABANDONED: 'abandoned',
};

const GAME_RESULT = {
  WIN: 'win',
  DRAW: 'draw',
  FORFEIT: 'forfeit',
};

const PLAYER_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
};

const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_GAME: 'joinGame',
  MAKE_MOVE: 'makeMove',
  LEAVE_GAME: 'leaveGame',
  NEW_GAME: 'newGame',
  GET_LEADERBOARD: 'getLeaderboard',
  RECONNECT_GAME: 'reconnectGame',

  // Server -> Client
  GAME_FOUND: 'gameFound',
  GAME_UPDATE: 'gameUpdate',
  MOVE_MADE: 'moveMade',
  GAME_OVER: 'gameOver',
  OPPONENT_DISCONNECTED: 'opponentDisconnected',
  OPPONENT_RECONNECTED: 'opponentReconnected',
  ERROR: 'error',
  LEADERBOARD_DATA: 'leaderboardData',
};

module.exports = {
  GAME_CONFIG,
  GAME_STATUS,
  GAME_RESULT,
  PLAYER_STATUS,
  SOCKET_EVENTS,
};

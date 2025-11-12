const { GAME_CONFIG } = require('../constants/gameConstants');
const { GameError } = require('./errorTypes');

/**
 * Game Logic Utilities
 */
class GameLogic {
  /**
   * Create an empty board
   */
  static createEmptyBoard() {
    return Array(GAME_CONFIG.ROWS)
      .fill(null)
      .map(() => Array(GAME_CONFIG.COLS).fill(null));
  }

  /**
   * Validate if a move is valid
   */
  static isValidMove(board, column) {
    if (column < 0 || column >= GAME_CONFIG.COLS) {
      return false;
    }
    // Check if column is not full
    return board[0][column] === null;
  }

  /**
   * Drop a disc in a column
   * Returns the row where the disc was placed
   */
  static dropDisc(board, column, player) {
    if (!this.isValidMove(board, column)) {
      throw new GameError('Invalid move: column is full or out of bounds');
    }

    // Find the lowest empty row in the column
    for (let row = GAME_CONFIG.ROWS - 1; row >= 0; row--) {
      if (board[row][column] === null) {
        board[row][column] = player;
        return row;
      }
    }

    throw new GameError('Invalid move: column is full');
  }

  /**
   * Check if there's a winner
   * Returns the winning player (1 or 2) or null
   */
  static checkWinner(board) {
    const { ROWS, COLS, WIN_COUNT } = GAME_CONFIG;

    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - WIN_COUNT; col++) {
        const player = board[row][col];
        if (player && this.checkLine(board, row, col, 0, 1, WIN_COUNT)) {
          return player;
        }
      }
    }

    // Check vertical
    for (let row = 0; row <= ROWS - WIN_COUNT; row++) {
      for (let col = 0; col < COLS; col++) {
        const player = board[row][col];
        if (player && this.checkLine(board, row, col, 1, 0, WIN_COUNT)) {
          return player;
        }
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= ROWS - WIN_COUNT; row++) {
      for (let col = 0; col <= COLS - WIN_COUNT; col++) {
        const player = board[row][col];
        if (player && this.checkLine(board, row, col, 1, 1, WIN_COUNT)) {
          return player;
        }
      }
    }

    // Check diagonal (bottom-left to top-right)
    for (let row = WIN_COUNT - 1; row < ROWS; row++) {
      for (let col = 0; col <= COLS - WIN_COUNT; col++) {
        const player = board[row][col];
        if (player && this.checkLine(board, row, col, -1, 1, WIN_COUNT)) {
          return player;
        }
      }
    }

    return null;
  }

  /**
   * Check a line of discs
   */
  static checkLine(board, startRow, startCol, rowDir, colDir, count) {
    const player = board[startRow][startCol];
    if (!player) return false;

    for (let i = 1; i < count; i++) {
      const row = startRow + i * rowDir;
      const col = startCol + i * colDir;
      if (board[row][col] !== player) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if the board is full (draw)
   */
  static isBoardFull(board) {
    return board[0].every(cell => cell !== null);
  }

  /**
   * Get available columns (not full)
   */
  static getAvailableColumns(board) {
    const available = [];
    for (let col = 0; col < GAME_CONFIG.COLS; col++) {
      if (this.isValidMove(board, col)) {
        available.push(col);
      }
    }
    return available;
  }

  /**
   * Clone board for simulation
   */
  static cloneBoard(board) {
    return board.map(row => [...row]);
  }

  /**
   * Evaluate board for a player (used by bot)
   * Returns a score indicating how good the position is
   */
  static evaluateBoard(board, player) {
    let score = 0;
    const opponent = player === 1 ? 2 : 1;

    // Check all possible windows of WIN_COUNT length
    const { ROWS, COLS, WIN_COUNT } = GAME_CONFIG;

    // Horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - WIN_COUNT; col++) {
        score += this.evaluateWindow(board, row, col, 0, 1, player, opponent);
      }
    }

    // Vertical
    for (let row = 0; row <= ROWS - WIN_COUNT; row++) {
      for (let col = 0; col < COLS; col++) {
        score += this.evaluateWindow(board, row, col, 1, 0, player, opponent);
      }
    }

    // Diagonal (top-left to bottom-right)
    for (let row = 0; row <= ROWS - WIN_COUNT; row++) {
      for (let col = 0; col <= COLS - WIN_COUNT; col++) {
        score += this.evaluateWindow(board, row, col, 1, 1, player, opponent);
      }
    }

    // Diagonal (bottom-left to top-right)
    for (let row = WIN_COUNT - 1; row < ROWS; row++) {
      for (let col = 0; col <= COLS - WIN_COUNT; col++) {
        score += this.evaluateWindow(board, row, col, -1, 1, player, opponent);
      }
    }

    return score;
  }

  /**
   * Evaluate a window of 4 cells
   */
  static evaluateWindow(board, startRow, startCol, rowDir, colDir, player, opponent) {
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < GAME_CONFIG.WIN_COUNT; i++) {
      const row = startRow + i * rowDir;
      const col = startCol + i * colDir;
      const cell = board[row][col];

      if (cell === player) playerCount++;
      else if (cell === opponent) opponentCount++;
      else emptyCount++;
    }

    // If both players have pieces in this window, it's not useful
    if (playerCount > 0 && opponentCount > 0) {
      return 0;
    }

    // Score based on how many pieces we have
    if (playerCount === 4) return 100;
    if (playerCount === 3 && emptyCount === 1) return 10;
    if (playerCount === 2 && emptyCount === 2) return 5;

    // Negative score for opponent's potential
    if (opponentCount === 3 && emptyCount === 1) return -50;
    if (opponentCount === 2 && emptyCount === 2) return -3;

    return 0;
  }
}

module.exports = GameLogic;

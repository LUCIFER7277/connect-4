const GameLogic = require('./gameLogic');
const { GAME_CONFIG } = require('../constants/gameConstants');
const Logger = require('./logger');

/**
 * Bot AI with different difficulty levels
 */
class BotAI {
  /**
   * Get the best move for the bot
   * Uses minimax algorithm with alpha-beta pruning
   */
  static getBestMove(board, botPlayer, difficulty = 'medium') {
    const opponent = botPlayer === 1 ? 2 : 1;
    const availableColumns = GameLogic.getAvailableColumns(board);

    if (availableColumns.length === 0) {
      Logger.warn('No available moves for bot');
      return null;
    }

    // Strategy based on difficulty
    switch (difficulty) {
      case 'easy':
        return this.getEasyMove(board, botPlayer, opponent, availableColumns);
      case 'medium':
        return this.getMediumMove(board, botPlayer, opponent, availableColumns);
      case 'hard':
        return this.getHardMove(board, botPlayer, opponent, availableColumns);
      default:
        return this.getMediumMove(board, botPlayer, opponent, availableColumns);
    }
  }

  /**
   * Easy difficulty - mostly random with basic blocking
   */
  static getEasyMove(board, botPlayer, opponent, availableColumns) {
    // 30% chance to make optimal move, 70% random
    if (Math.random() < 0.3) {
      return this.getMediumMove(board, botPlayer, opponent, availableColumns);
    }

    // Random move
    return availableColumns[Math.floor(Math.random() * availableColumns.length)];
  }

  /**
   * Medium difficulty - strategic play
   */
  static getMediumMove(board, botPlayer, opponent, availableColumns) {
    // 1. Check if bot can win
    for (const col of availableColumns) {
      const testBoard = GameLogic.cloneBoard(board);
      GameLogic.dropDisc(testBoard, col, botPlayer);
      if (GameLogic.checkWinner(testBoard) === botPlayer) {
        Logger.debug('Bot found winning move', { column: col });
        return col;
      }
    }

    // 2. Block opponent from winning
    for (const col of availableColumns) {
      const testBoard = GameLogic.cloneBoard(board);
      GameLogic.dropDisc(testBoard, col, opponent);
      if (GameLogic.checkWinner(testBoard) === opponent) {
        Logger.debug('Bot blocking opponent', { column: col });
        return col;
      }
    }

    // 3. Try to play in the center columns (better strategic position)
    const center = Math.floor(GAME_CONFIG.COLS / 2);
    if (availableColumns.includes(center)) {
      return center;
    }

    // 4. Prefer columns near center
    const sortedByCenter = availableColumns.sort((a, b) => {
      return Math.abs(a - center) - Math.abs(b - center);
    });

    return sortedByCenter[0];
  }

  /**
   * Hard difficulty - minimax with alpha-beta pruning
   */
  static getHardMove(board, botPlayer, opponent, availableColumns) {
    let bestScore = -Infinity;
    let bestCol = availableColumns[0];

    for (const col of availableColumns) {
      const testBoard = GameLogic.cloneBoard(board);
      GameLogic.dropDisc(testBoard, col, botPlayer);

      // Minimax with depth 4
      const score = this.minimax(testBoard, 4, false, botPlayer, opponent, -Infinity, Infinity);

      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }

    Logger.debug('Bot minimax decision', { column: bestCol, score: bestScore });
    return bestCol;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   */
  static minimax(board, depth, isMaximizing, botPlayer, opponent, alpha, beta) {
    // Check terminal states
    const winner = GameLogic.checkWinner(board);
    if (winner === botPlayer) return 1000 + depth; // Prefer quicker wins
    if (winner === opponent) return -1000 - depth; // Avoid quicker losses
    if (GameLogic.isBoardFull(board)) return 0; // Draw
    if (depth === 0) return GameLogic.evaluateBoard(board, botPlayer);

    const availableColumns = GameLogic.getAvailableColumns(board);

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const col of availableColumns) {
        const testBoard = GameLogic.cloneBoard(board);
        GameLogic.dropDisc(testBoard, col, botPlayer);

        const score = this.minimax(testBoard, depth - 1, false, botPlayer, opponent, alpha, beta);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);

        if (beta <= alpha) break; // Alpha-beta pruning
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const col of availableColumns) {
        const testBoard = GameLogic.cloneBoard(board);
        GameLogic.dropDisc(testBoard, col, opponent);

        const score = this.minimax(testBoard, depth - 1, true, botPlayer, opponent, alpha, beta);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);

        if (beta <= alpha) break; // Alpha-beta pruning
      }

      return minScore;
    }
  }
}

module.exports = BotAI;

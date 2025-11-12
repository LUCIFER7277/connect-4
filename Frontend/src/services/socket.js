import { io } from 'socket.io-client';

// Configure your backend URL here
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Connect to the backend
  connect() {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  // Disconnect from the backend
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join game with username
  joinGame(username, callback) {
    if (this.socket) {
      this.socket.emit('joinGame', { username }, callback);
    }
  }

  // Make a move (drop disc in column)
  makeMove(gameId, column, callback) {
    if (this.socket) {
      this.socket.emit('makeMove', { gameId, column }, callback);
    }
  }

  // Leave current game
  leaveGame(gameId) {
    if (this.socket) {
      this.socket.emit('leaveGame', { gameId });
    }
  }

  // Request new game
  requestNewGame(callback) {
    if (this.socket) {
      this.socket.emit('newGame', callback);
    }
  }

  // Fetch leaderboard
  getLeaderboard(callback) {
    if (this.socket) {
      this.socket.emit('getLeaderboard', callback);
    }
  }

  // Listen for game found
  onGameFound(callback) {
    if (this.socket) {
      this.socket.on('gameFound', callback);
    }
  }

  // Listen for game updates
  onGameUpdate(callback) {
    if (this.socket) {
      this.socket.on('gameUpdate', callback);
    }
  }

  // Listen for move made
  onMoveMade(callback) {
    if (this.socket) {
      this.socket.on('moveMade', callback);
    }
  }

  // Listen for game over
  onGameOver(callback) {
    if (this.socket) {
      this.socket.on('gameOver', callback);
    }
  }

  // Listen for opponent disconnected
  onOpponentDisconnected(callback) {
    if (this.socket) {
      this.socket.on('opponentDisconnected', callback);
    }
  }

  // Listen for opponent reconnected
  onOpponentReconnected(callback) {
    if (this.socket) {
      this.socket.on('opponentReconnected', callback);
    }
  }

  // Listen for errors
  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove listener
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

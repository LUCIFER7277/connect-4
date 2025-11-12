import { useState, useEffect } from 'react';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import socketService from './services/socket';

function App() {
  const [gameState, setGameState] = useState({
    phase: 'lobby', // 'lobby', 'searching', 'playing', 'finished'
    username: null,
    gameId: null,
    player1: null,
    player2: null,
    board: null,
    currentPlayer: 1,
    myPlayer: null,
    winner: null,
    isDraw: false,
  });

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Connect to backend
    socketService.connect();

    // Listen for connection status
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });
    }

    // Setup game event listeners
    setupSocketListeners();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Setup socket event listeners
  const setupSocketListeners = () => {
    // Game found event
    socketService.onGameFound((data) => {
      console.log('Game found:', data);
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        gameId: data.gameId,
        player1: { username: data.playerNumber === 1 ? prev.username : data.opponent.username },
        player2: { username: data.playerNumber === 2 ? prev.username : data.opponent.username },
        myPlayer: data.playerNumber,
        board: data.board,
        currentPlayer: data.currentPlayer,
      }));
    });

    // Move made event
    socketService.onMoveMade((data) => {
      console.log('Move made:', data);
      setGameState(prev => ({
        ...prev,
        board: data.board,
        currentPlayer: data.currentPlayer,
      }));
    });

    // Game over event
    socketService.onGameOver((data) => {
      console.log('Game over:', data);
      setGameState(prev => ({
        ...prev,
        phase: 'finished',
        winner: data.winner,
        isDraw: data.isDraw,
        board: data.board,
      }));
    });

    // Opponent disconnected
    socketService.onOpponentDisconnected(() => {
      console.log('Opponent disconnected');
      // You could show a notification here
    });

    // Opponent reconnected
    socketService.onOpponentReconnected(() => {
      console.log('Opponent reconnected');
      // You could show a notification here
    });

    // Error event
    socketService.onError((error) => {
      console.error('Socket error:', error);

      // Only show alerts for critical errors, not game logic errors
      const criticalErrors = ['DATABASE_ERROR', 'VALIDATION_ERROR', 'JOIN_ERROR'];
      if (criticalErrors.includes(error.errorCode)) {
        alert(`Error: ${error.message}`);
      }
      // Game errors like "Not your turn", "Column full" are already prevented in UI
    });
  };

  // Handle joining game
  const handleJoinGame = (username) => {
    setGameState(prev => ({
      ...prev,
      phase: 'searching',
      username: username,
    }));

    // Send join game request to backend
    socketService.joinGame(username, (response) => {
      if (response && response.error) {
        console.error('Failed to join game:', response.error);
        alert('Failed to join game. Please try again.');
        setGameState(prev => ({
          ...prev,
          phase: 'lobby',
        }));
      }
    });
  };

  // Handle column click
  const handleColumnClick = (colIndex) => {
    if (!gameState.gameId) {
      console.error('No active game');
      return;
    }

    // Send move to backend
    socketService.makeMove(gameState.gameId, colIndex, (response) => {
      if (response && response.error) {
        console.error('Failed to make move:', response.error);
        // Don't show alert - error is already handled by socket error listener
      }
    });
  };

  // Handle new game
  const handleNewGame = () => {
    setGameState({
      phase: 'lobby',
      username: gameState.username, // Keep the username
      gameId: null,
      player1: null,
      player2: null,
      board: null,
      currentPlayer: 1,
      myPlayer: null,
      winner: null,
      isDraw: false,
    });

    // If user wants to play again, rejoin matchmaking
    if (gameState.username) {
      handleJoinGame(gameState.username);
    }
  };

  const isMyTurn = gameState.currentPlayer === gameState.myPlayer;

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-xl">
              4
            </div>
            <h1 className="text-2xl font-bold">4 in a Row</h1>
          </div>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Leaderboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {(gameState.phase === 'lobby' || gameState.phase === 'searching') && (
          <Lobby
            onJoinGame={handleJoinGame}
            isSearching={gameState.phase === 'searching'}
          />
        )}

        {(gameState.phase === 'playing' || gameState.phase === 'finished') && (
          <div className="container mx-auto">
            <GameBoard
              gameState={gameState}
              onColumnClick={handleColumnClick}
              currentPlayer={gameState.currentPlayer}
              isMyTurn={isMyTurn}
            />

            {/* Game Controls */}
            {gameState.phase === 'finished' && (
              <div className="flex justify-center gap-4 pb-8">
                <button
                  onClick={handleNewGame}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  View Leaderboard
                </button>
              </div>
            )}

            {/* Connection Status */}
            <div className="flex justify-center pb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isConnected
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}

export default App;

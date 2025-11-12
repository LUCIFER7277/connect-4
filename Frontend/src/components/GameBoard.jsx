import { useState } from 'react';

const ROWS = 6;
const COLS = 7;

const GameBoard = ({ gameState, onColumnClick, currentPlayer, isMyTurn }) => {
  const [hoveredCol, setHoveredCol] = useState(null);

  // Create empty board if gameState.board doesn't exist
  const board = gameState?.board || Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  const handleColumnClick = (colIndex) => {
    if (!isMyTurn || gameState?.winner || gameState?.isDraw) {
      return;
    }
    onColumnClick(colIndex);
  };

  const getCellClass = (cell) => {
    if (!cell) return 'bg-white/30';
    return cell === 1 ? 'bg-gradient-to-br from-pink-400 to-red-500' : 'bg-gradient-to-br from-yellow-300 to-blue-800';
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Game Info Section */}
      <div className="flex flex-col gap-4 items-center w-full max-w-2xl">
        {/* Players Info */}
        <div className="flex justify-around w-full gap-8">
          <div className={`flex items-center gap-2 px-6 py-3 bg-white/5 rounded-lg border-2 transition-all duration-300 ${
            currentPlayer === 1 ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-transparent'
          }`}>
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-500 shadow-lg"></span>
            <span className="text-white font-semibold">{gameState?.player1?.username || 'Player 1'}</span>
          </div>
          <div className={`flex items-center gap-2 px-6 py-3 bg-white/5 rounded-lg border-2 transition-all duration-300 ${
            currentPlayer === 2 ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-transparent'
          }`}>
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-blue-800 shadow-lg"></span>
            <span className="text-white font-semibold">{gameState?.player2?.username || 'Player 2'}</span>
          </div>
        </div>

        {/* Game Result */}
        {gameState?.winner && (
          <div className="text-2xl font-bold px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white animate-[slideIn_0.5s_ease]">
            {gameState.winner === 'draw'
              ? "It's a Draw!"
              : `${gameState.winner === 1 ? gameState?.player1?.username : gameState?.player2?.username} Wins!`}
          </div>
        )}

        {gameState?.isDraw && (
          <div className="text-2xl font-bold px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white animate-[slideIn_0.5s_ease]">
            It's a Draw!
          </div>
        )}

        {/* Turn Indicator */}
        {!gameState?.winner && !gameState?.isDraw && (
          <div className="text-xl font-bold text-indigo-400 px-4 py-2 bg-indigo-500/10 rounded-lg animate-pulse">
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-2xl">
        <div className="flex flex-col gap-2">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] ${
                    getCellClass(cell)
                  } ${
                    hoveredCol === colIndex && isMyTurn && !gameState?.winner && !gameState?.isDraw
                      ? 'bg-white scale-105'
                      : ''
                  } ${!cell ? 'bg-white/30' : ''}`}
                  onClick={() => handleColumnClick(colIndex)}
                  onMouseEnter={() => setHoveredCol(colIndex)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {cell && (
                    <div className={`w-[55px] h-[55px] rounded-full shadow-lg animate-[dropIn_0.4s_ease] ${
                      cell === 1 ? 'bg-gradient-to-br from-pink-400 to-red-500' : 'bg-gradient-to-br from-yellow-300 to-blue-800'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes dropIn {
          from {
            transform: translateY(-300px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GameBoard;

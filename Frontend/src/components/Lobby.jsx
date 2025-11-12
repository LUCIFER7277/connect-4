import { useState } from 'react';

const Lobby = ({ onJoinGame, isSearching }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onJoinGame(username.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
          4 in a Row
        </h1>
        <p className="text-gray-300 text-center mb-8">Connect four discs to win!</p>

        {!isSearching ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Enter Your Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Join Game
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-gray-200 text-lg font-medium">Finding opponent...</p>
            <p className="text-gray-400 text-sm">Waiting for another player to join</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-gray-400 hover:text-white underline text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Game Rules:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Players take turns dropping discs</li>
            <li>• First to connect 4 discs wins</li>
            <li>• Connections can be horizontal, vertical, or diagonal</li>
            <li>• If board fills with no winner, it's a draw</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Lobby;

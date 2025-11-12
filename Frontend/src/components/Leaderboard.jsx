import { useState, useEffect } from 'react';

const Leaderboard = ({ isOpen, onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/players/leaderboard?limit=10`);
      const result = await response.json();

      if (result.success) {
        // Transform backend data to match frontend format
        const formattedData = result.data.map(player => ({
          username: player.username,
          wins: player.total_wins,
          games: player.total_games,
        }));
        setLeaderboardData(formattedData);
      } else {
        console.error('Failed to fetch leaderboard');
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Show empty state on error
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No players yet. Be the first to play!
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((player, index) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border border-orange-700/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {index === 0 ? '👑' : index + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.username}</p>
                      <p className="text-sm text-gray-400">{player.games} games played</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{player.wins}</p>
                    <p className="text-sm text-gray-400">wins</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

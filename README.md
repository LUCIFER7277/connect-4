# 🎮 Connect-4 Multiplayer Game

A full-stack, real-time multiplayer Connect Four game with intelligent bot opponent, built with **React**, **Node.js**, **Socket.IO**, and **PostgreSQL**.

## ✨ Features

### 🎯 Core Gameplay
- **Real-time Multiplayer**: Play against other players in real-time
- **Smart Matchmaking**: Instant player pairing system
- **Intelligent Bot**: Auto-joins after 10 seconds if no opponent available
- **Three AI Difficulty Levels**: Easy, Medium (default), and Hard
- **Reconnection Support**: Resume games if disconnected
- **Move History**: All moves are tracked in the database

### 🎨 User Interface
- **Modern Design**: Beautiful UI with Tailwind CSS
- **Responsive Layout**: Works on desktop and mobile
- **Interactive Board**: 7×6 grid with smooth animations
- **Real-time Updates**: Live game state synchronization
- **Visual Feedback**: Hover effects, turn indicators, win animations

### 📊 Statistics & Leaderboard
- **Player Stats**: Track wins, losses, draws
- **Global Leaderboard**: View top players
- **Game History**: Complete move records
- **Win Rate Tracking**: Detailed player analytics

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, PostgreSQL |
| **Database** | PostgreSQL (Supabase) |
| **Real-time** | Socket.IO (WebSocket) |
| **Deployment** | Ready for Vercel (Frontend) + Railway/Render (Backend) |

## 📁 Project Structure

```
connect-4-game/
├── Backend/                      # Node.js backend server
│   ├── src/
│   │   ├── config/              # Database & configuration
│   │   ├── constants/           # Game rules & constants
│   │   ├── controllers/         # REST API controllers
│   │   ├── middlewares/         # Error handling middleware
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Game logic & state management
│   │   ├── socket/              # Socket.IO handlers
│   │   ├── utils/               # Bot AI, game logic, logger
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── .env                     # Environment variables
│   └── package.json
│
├── Frontend/                     # React frontend app
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── GameBoard.jsx   # Game board UI
│   │   │   ├── Lobby.jsx        # Matchmaking UI
│   │   │   └── Leaderboard.jsx  # Leaderboard modal
│   │   ├── services/
│   │   │   └── socket.js        # Socket.IO client service
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # App entry point
│   ├── .env                     # Environment variables
│   └── package.json
│
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** database (or Supabase account)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd connect-4-game
```

### 2. Set Up Backend

```bash
cd Backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

**Backend `.env`:**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password

RECONNECT_TIMEOUT=30000
BOT_MOVE_DELAY=1000
MATCHMAKING_TIMEOUT=10000
```

**Start Backend:**
```bash
npm run dev
# Server starts on http://localhost:3000
```

### 3. Set Up Frontend

```bash
cd Frontend
npm install

# Configure environment
cp .env.example .env
```

**Frontend `.env`:**
```env
VITE_BACKEND_URL=http://localhost:3000
```

**Start Frontend:**
```bash
npm run dev
# App starts on http://localhost:5173
```

### 4. Play the Game! 🎉

1. Open http://localhost:5173
2. Enter your username
3. Wait for an opponent (or bot joins after 10 seconds)
4. Play Connect-4!

## 🎮 How to Play

### Game Rules

- **Board**: 7 columns × 6 rows
- **Win Condition**: Connect 4 discs horizontally, vertically, or diagonally
- **Players**: Player 1 (Red) vs Player 2/Bot (Yellow)
- **Turns**: Players alternate dropping discs
- **Gravity**: Discs fall to the lowest available position

### Matchmaking Flow

```
Enter Username
    ↓
Join Matchmaking Queue
    ↓
Waiting for opponent...
    ↓
Another player available?
    ├─ YES → Match instantly with player
    └─ NO → Wait 10 seconds → Bot joins
```

### Gameplay Flow

```
Game Starts (Player 1 goes first)
    ↓
Click a column to drop disc
    ↓
Disc falls to lowest position
    ↓
Check for win/draw
    ↓
Switch turns
    ↓
Repeat until game ends
```

## 🤖 Bot AI System

### Bot Behavior

- **Auto-join**: Joins automatically after 10 seconds
- **Current Difficulty**: Medium (60% win rate)
- **Human-like**: 1-second delay per move
- **Smart Strategy**: Blocks winning moves, prefers center

### AI Difficulty Levels

| Level | Strategy | Win Rate | Description |
|-------|----------|----------|-------------|
| **Easy** | Random + 30% optimal | ~30% | Good for beginners |
| **Medium** | Strategic blocking | ~60% | Balanced challenge |
| **Hard** | Minimax algorithm | ~95% | Near unbeatable |

### Change Bot Difficulty

Edit `Backend/src/services/GameService.js` (line 278):
```javascript
// Change 'medium' to 'easy' or 'hard'
const column = BotAI.getBestMove(game.board, game.currentPlayer, 'medium');
```

## 🔌 API Reference

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinGame` | `{ username: string }` | Join matchmaking |
| `makeMove` | `{ column: number }` | Drop disc (0-6) |
| `leaveGame` | `{ gameId: string }` | Leave game |
| `newGame` | `{ username: string }` | Start new game |
| `getLeaderboard` | `{ limit?: number }` | Fetch leaderboard |
| `reconnectGame` | `{ gameId, playerNumber }` | Reconnect to game |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `gameFound` | `{ gameId, opponent, playerNumber, board, currentPlayer }` | Match found |
| `moveMade` | `{ board, currentPlayer, column }` | Move completed |
| `gameOver` | `{ winner, isDraw, board }` | Game finished |
| `gameUpdate` | `{ gameId, board, currentPlayer, status }` | State updated |
| `opponentDisconnected` | - | Opponent left |
| `opponentReconnected` | - | Opponent returned |
| `leaderboardData` | `{ leaderboard }` | Top players |
| `error` | `{ message, errorCode }` | Error occurred |

### REST API Endpoints

#### GET `/health`
Returns server status and uptime.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T...",
  "uptime": 123.45
}
```

#### GET `/api/players/leaderboard?limit=10`
Returns top players by wins.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "username": "Player1",
      "total_wins": 45,
      "total_games": 80,
      "total_losses": 30,
      "total_draws": 5
    }
  ]
}
```

## 🗄️ Database Schema

### `players` Table
Stores player profiles and statistics.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(50) | Unique username |
| total_games | INTEGER | Games played |
| total_wins | INTEGER | Wins |
| total_losses | INTEGER | Losses |
| total_draws | INTEGER | Draws |
| created_at | TIMESTAMP | Registration date |
| updated_at | TIMESTAMP | Last update |

### `games` Table
Stores game records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| player1_id | INTEGER | Player 1 (or NULL for bot) |
| player2_id | INTEGER | Player 2 (or NULL for bot) |
| winner_id | INTEGER | Winner (NULL for draw) |
| status | VARCHAR(20) | waiting/playing/finished |
| result | VARCHAR(20) | win/draw/forfeit |
| board_state | JSONB | Final board state |
| started_at | TIMESTAMP | Start time |
| ended_at | TIMESTAMP | End time |

### `game_moves` Table
Stores individual moves.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| game_id | UUID | FK to games |
| player_id | INTEGER | FK to players |
| column_index | INTEGER | Column (0-6) |
| row_index | INTEGER | Row (0-5) |
| move_number | INTEGER | Move sequence |
| created_at | TIMESTAMP | Move time |

**Tables are auto-created on first server startup!** ✅

## 🧪 Testing

### Manual Testing

#### Test 1: Two-Player Match
1. Open two browser windows
2. Enter different usernames in each
3. Both should match instantly
4. Play a game

#### Test 2: Bot Match
1. Open one browser window
2. Enter username
3. Wait 10 seconds
4. Bot should join automatically
5. Play against bot

#### Test 3: Reconnection
1. Start a game
2. Refresh page
3. Should reconnect to ongoing game (if within 30s)

### Database Queries

```sql
-- View all players
SELECT * FROM players ORDER BY total_wins DESC;

-- View recent games
SELECT * FROM games ORDER BY created_at DESC LIMIT 10;

-- Player win rates
SELECT
  username,
  total_wins,
  total_games,
  ROUND((total_wins::numeric / NULLIF(total_games, 0) * 100), 2) as win_rate
FROM players
WHERE total_games >= 5
ORDER BY total_wins DESC;
```

## 🚀 Production Deployment

### Deploy Backend

**Option 1: Railway**
1. Connect GitHub repo
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy automatically

**Option 2: Render**
1. Create Web Service
2. Connect GitHub repo
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

**Environment Variables:**
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
DB_HOST=your-production-db.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-secure-password
```

### Deploy Frontend

**Vercel (Recommended):**
```bash
cd Frontend
npm install -g vercel
vercel
```

**Environment Variable:**
```env
VITE_BACKEND_URL=https://your-backend.railway.app
```

**Or use Vercel Dashboard:**
1. Import GitHub repo
2. Select `Frontend` directory
3. Add environment variable: `VITE_BACKEND_URL`
4. Deploy

### Post-Deployment Checklist

- ✅ Backend CORS allows frontend domain
- ✅ Database credentials secure
- ✅ Environment variables set correctly
- ✅ HTTPS enabled on both services
- ✅ Test matchmaking with real users
- ✅ Monitor logs for errors

## 🔧 Configuration

### Game Settings

Edit `Backend/src/constants/gameConstants.js`:

```javascript
const GAME_CONFIG = {
  ROWS: 6,                      // Board height
  COLS: 7,                      // Board width
  WIN_COUNT: 4,                 // Discs to win
  RECONNECT_TIMEOUT: 30000,     // 30s reconnect time
  BOT_MOVE_DELAY: 1000,        // 1s bot delay
  MATCHMAKING_TIMEOUT: 10000,   // 10s before bot joins
};
```

### UI Customization

**Change Disc Colors** (`Frontend/src/components/GameBoard.jsx`):
```jsx
// Player 1 disc
className="from-pink-400 to-red-500"

// Player 2 disc
className="from-yellow-300 to-blue-800"

// Board background
className="from-indigo-600 to-purple-700"
```

**Change Board Size**:
1. Update `ROWS` and `COLS` in both frontend and backend
2. Adjust CSS grid layout accordingly

## 🐛 Troubleshooting

### Backend won't start

**Error:** `EADDRINUSE: port 3000 already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Frontend can't connect to backend

**Error:** `Socket connection failed`

**Solutions:**
1. Check backend is running: `http://localhost:3000/health`
2. Verify `VITE_BACKEND_URL` in `Frontend/.env`
3. Check CORS settings in `Backend/src/app.js`
4. Check browser console for errors

### Database connection failed

**Error:** `ECONNREFUSED` or timeout

**Solutions:**
1. Verify database credentials in `.env`
2. Check database is running/accessible
3. Test connection:
   ```bash
   psql -h your-host -U your-user -d your-db
   ```
4. Check firewall/security groups

### Bot not joining

**Problem:** Bot doesn't join after 10 seconds

**Solutions:**
1. Check `MATCHMAKING_TIMEOUT` in `.env`
2. Restart backend server
3. Check server logs for errors
4. Verify timeout is set in code

### Leaderboard not working

**Problem:** CORS error when fetching leaderboard

**Solution:**
Update `FRONTEND_URL` in `Backend/.env` to match your frontend URL exactly (including port).

## 📊 Logging

The backend uses color-coded logs:

| Level | Symbol | Color | Purpose |
|-------|--------|-------|---------|
| SUCCESS | ✓ | Green | Operations completed |
| INFO | ℹ | Blue | General info |
| WARNING | ⚠ | Yellow | Non-critical issues |
| ERROR | ✗ | Red | Errors & exceptions |
| DEBUG | ◆ | Magenta | Dev debugging |

**Example:**
```
[2025-01-12T15:30:00.000Z] [ℹ INFO] Starting server...
[2025-01-12T15:30:01.000Z] [✓ SUCCESS] Database initialized
[2025-01-12T15:30:01.500Z] [✓ SUCCESS] Server running on port 3000
```

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 🎓 Learning & Extension Ideas

### Beginner
- Add sound effects for moves
- Add confetti animation for wins
- Add player avatars
- Add chat between players

### Intermediate
- Implement game replay feature
- Add different board sizes
- Add tournaments/brackets
- Add player profiles with stats

### Advanced
- Add AI training mode with difficulty progression
- Implement ELO rating system
- Add spectator mode for watching games
- Build mobile app with React Native

## 📝 License

ISC

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by classic Connect Four game
- Community feedback and contributions

---

**🎮 Built with ❤️ using React, Node.js, Socket.IO, and PostgreSQL**

**⭐ Star this repo if you found it helpful!**

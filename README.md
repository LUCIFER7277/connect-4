# 🎮 Connect-4 Multiplayer Game

A real-time multiplayer Connect Four game with intelligent bot opponent. Built with React, Node.js, Socket.IO, and PostgreSQL.

## ✨ Features

- **Real-time Multiplayer** - Play against other players instantly
- **Smart Bot AI** - Auto-joins after 10 seconds, 3 difficulty levels (Easy/Medium/Hard)
- **Player Statistics** - Track wins, losses, and view global leaderboard
- **Reconnection Support** - Resume games after disconnect
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Socket.IO Client
**Backend:** Node.js, Express, Socket.IO, PostgreSQL (Supabase)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL database (or [Supabase](https://supabase.com) account)

### Setup & Run

```bash
# 1. Backend setup
cd Backend
npm install
cp .env.example .env  # Edit with your database credentials
npm run dev           # Starts on http://localhost:3000

# 2. Frontend setup (new terminal)
cd Frontend
npm install
cp .env.example .env  # Set VITE_BACKEND_URL=http://localhost:3000
npm run dev           # Starts on http://localhost:5173

# 3. Open http://localhost:5173 and play! 🎉
```

### Environment Variables

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
MATCHMAKING_TIMEOUT=10000  # 10 seconds before bot joins
```

**Frontend `.env`:**
```env
VITE_BACKEND_URL=http://localhost:3000
```

## 🎮 How to Play

1. **Enter Username** → Join matchmaking queue
2. **Wait for Opponent** → Matches instantly with another player, or bot joins after 10 seconds
3. **Play Connect-4** → Click columns to drop discs, connect 4 to win!
4. **View Stats** → Check leaderboard for top players

**Game Rules:** 7×6 board, connect 4 discs horizontally, vertically, or diagonally to win.

## 🤖 Bot AI

The bot has 3 difficulty levels. Current setting: **Medium** (60% win rate)

**Change difficulty** 
const column = BotAI.getBestMove(game.board, game.currentPlayer, 'medium');
// Change to: 'easy' (30% win rate) or 'hard' (95% win rate)
```

## 📁 Project Structure

```
connect-4-game/
├── Backend/           # Node.js server
│   ├── src/
│   │   ├── config/    # Database setup
│   │   ├── models/    # Database models
│   │   ├── services/  # Game logic & bot AI
│   │   └── socket/    # Socket.IO handlers
│   └── .env
│
├── Frontend/          # React app
│   ├── src/
│   │   ├── components/  # GameBoard, Lobby, Leaderboard
│   │   └── services/    # Socket.IO client
│   └── .env
│
└── README.md
```

## 🔌 Key Socket.IO Events

**Client → Server:**
- `joinGame` - Join matchmaking
- `makeMove` - Drop disc in column
- `getLeaderboard` - Fetch top players

**Server → Client:**
- `gameFound` - Match found, game starts
- `moveMade` - Move completed
- `gameOver` - Game finished
- `error` - Error occurred

## 🗄️ Database

**Tables auto-created on first run:**
- `players` - User profiles and stats
- `games` - Game records
- `game_moves` - Move history

**View leaderboard query:**
```sql
SELECT username, total_wins, total_games
FROM players
ORDER BY total_wins DESC
LIMIT 10;
```

## 🚀 Production Deployment

### Backend (Railway/Render)
1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy

### Frontend (Vercel)
```bash
cd Frontend
vercel
# Set VITE_BACKEND_URL to your backend URL
```

**Change disc colors**
```jsx
// Player 1: from-pink-400 to-red-500
// Player 2: from-yellow-300 to-blue-800
```

## 📚 Tech Details

- **Real-time:** WebSocket via Socket.IO
- **State Management:** In-memory (backend) + React state (frontend)
- **Database:** PostgreSQL with connection pooling
- **Bot AI:** Minimax algorithm with alpha-beta pruning (Hard mode)
- **Logging:** Color-coded console logs (✓ SUCCESS, ℹ INFO, ✗ ERROR)


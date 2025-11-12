# 🎮 Connect-4 Multiplayer Game

A real-time multiplayer Connect Four game with intelligent bot opponent, leaderboard system, and responsive design.

## 🌐 Live Demo

- **Play Now:** [connect-4-frontend-beta.vercel.app](https://connect-4-frontend-beta.vercel.app)
- **Backend API:** [Your Render URL]

## ✨ Features

- 🎯 **Real-time Multiplayer** - Play against other players with instant matching
- 🤖 **Smart Bot AI** - Auto-joins after 10 seconds with 3 difficulty levels
- 🏆 **Leaderboard System** - Track wins, losses, and player rankings
- 💾 **Persistent Stats** - All games and moves saved to database
- 📱 **Responsive Design** - Seamless experience on desktop and mobile
- 🔄 **Reconnection Support** - Resume games after brief disconnections
- ⚡ **Real-time Updates** - Live board updates via WebSocket

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Socket.IO Client

**Backend**
- Node.js + Express
- Socket.IO
- PostgreSQL (Supabase)

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: Supabase (PostgreSQL)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL database ([Get free database on Supabase](https://supabase.com))

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/connect-4.git
cd connect-4
```

**2. Backend Setup**
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Backend runs on `http://localhost:3000`

**3. Frontend Setup**
```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env: VITE_BACKEND_URL=http://localhost:3000
npm run dev
```

Frontend runs on `http://localhost:5173`

**4. Play!**

Open `http://localhost:5173` in your browser 🎉

## 📋 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password

MATCHMAKING_TIMEOUT=10000
BOT_MOVE_DELAY=1000
RECONNECT_TIMEOUT=30000
```

### Frontend `.env`
```env
VITE_BACKEND_URL=http://localhost:3000
```

## 🎮 How to Play

1. **Enter your username** and click "Join Game"
2. **Wait for opponent** - another player joins instantly, or bot joins after 10 seconds
3. **Click columns** to drop your disc
4. **Connect 4 discs** horizontally, vertically, or diagonally to win
5. **Check leaderboard** to see top players

## 🤖 Bot AI

The bot has **3 difficulty levels** (current: Medium):

| Level | Strategy | Win Rate |
|-------|----------|----------|
| **Easy** | 30% optimal, 70% random | ~30% |
| **Medium** | Strategic blocking + center preference | ~60% |
| **Hard** | Minimax with alpha-beta pruning | ~95% |

**Change difficulty** in `Backend/src/services/GameService.js:278`:
```javascript
const column = BotAI.getBestMove(game.board, game.currentPlayer, 'medium');
// Options: 'easy', 'medium', 'hard'
```

## 📁 Project Structure

```
connect-4-game/
├── Backend/
│   ├── src/
│   │   ├── config/         # Database & configuration
│   │   ├── models/         # Database models (Player, Game)
│   │   ├── services/       # Game logic & bot AI
│   │   ├── socket/         # Socket.IO event handlers
│   │   ├── utils/          # Bot AI, game logic, logger
│   │   └── server.js       # Entry point
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # GameBoard, Lobby, Leaderboard
│   │   ├── services/       # Socket.IO client
│   │   └── App.jsx         # Main component
│   └── package.json
│
└── README.md
```

## 🔌 API Reference

### Socket.IO Events

**Client → Server**
- `joinGame` - Join matchmaking with username
- `makeMove` - Drop disc in column (0-6)
- `getLeaderboard` - Fetch top players

**Server → Client**
- `gameFound` - Match found, game starts
- `moveMade` - Move completed
- `gameOver` - Game finished
- `error` - Error occurred

### REST Endpoints

- `GET /health` - Server health check
- `GET /api/players/leaderboard?limit=10` - Get top players

## 🗄️ Database Schema

**Tables** (auto-created on startup):

- **`players`** - User profiles, wins, losses, draws
- **`games`** - Game records, board states, results
- **`game_moves`** - Individual move history

## 🚀 Deployment

### Backend (Render)

1. Create PostgreSQL database on Render
2. Create Web Service from GitHub repo
3. Set Root Directory: `Backend`
4. Set environment variables (see `.env.example`)
5. Deploy

### Frontend (Vercel)

1. Import GitHub repo on Vercel
2. Set Root Directory: `Frontend`
3. Add environment variable: `VITE_BACKEND_URL`
4. Deploy

### Post-Deployment

Update these after deployment:
- Backend `FRONTEND_URL` → your Vercel URL
- Frontend `VITE_BACKEND_URL` → your Render URL

## ⚙️ Configuration

### Change Game Timeout

`Backend/src/constants/gameConstants.js`:
```javascript
MATCHMAKING_TIMEOUT: 10000,  // 10 seconds before bot joins
```

### Change Board Colors

`Frontend/src/components/GameBoard.jsx`:
```javascript
// Player 1: from-pink-400 to-red-500
// Player 2: from-yellow-300 to-blue-800
```

## 📊 Features in Detail

### Real-time Gameplay
- WebSocket connection via Socket.IO
- Instant board updates
- Live turn indicators

### Bot Intelligence
- Easy: Beginner-friendly
- Medium: Balanced challenge (default)
- Hard: Nearly unbeatable with minimax algorithm

### Player Statistics
- Total games played
- Win/loss/draw counts
- Global leaderboard rankings

### Database Persistence
- All games saved
- Complete move history
- Player stats tracking


## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by classic Connect Four
- Bot AI uses minimax algorithm with alpha-beta pruning

---

### 🎯 Quick Commands

```bash
# Start both servers
cd Backend && npm run dev
cd Frontend && npm run dev

# Build for production
cd Frontend && npm run build

# Deploy to Vercel
cd Frontend && vercel --prod

# View logs
cd Backend && npm run dev  # Watch server logs
```

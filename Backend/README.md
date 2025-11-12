# 🎮 Connect-4 Game Backend

Real-time multiplayer Connect Four game backend built with **Node.js**, **Express**, **Socket.IO**, and **PostgreSQL**.

## ✨ Features

- **🎯 Real-time Multiplayer**: WebSocket-based gameplay using Socket.IO
- **🤝 Smart Matchmaking**: Automatic player pairing with instant matching
- **🤖 Intelligent Bot Opponent**: Auto-joins after 10 seconds if no player available
- **🧠 Advanced Bot AI**: Three difficulty levels with Minimax algorithm
- **💾 Persistent Storage**: PostgreSQL database for games, players, and statistics
- **🔄 Reconnection Support**: Players can reconnect to ongoing games
- **🏆 Leaderboard System**: Track player rankings and statistics
- **⚡ Optimized Performance**: Connection pooling and efficient state management
- **🛡️ Robust Error Handling**: Comprehensive error classes and validation
- **📊 Beautiful Logging**: Color-coded console logs for easy debugging

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework for REST API |
| **Socket.IO** | Real-time bidirectional communication |
| **PostgreSQL** | Relational database (via Supabase) |
| **UUID** | Unique game ID generation |
| **dotenv** | Environment configuration |

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection pool & queries
│   ├── constants/
│   │   └── gameConstants.js      # Game rules, timeouts, socket events
│   ├── controllers/
│   │   └── playerController.js   # REST API controllers
│   ├── middlewares/
│   │   └── errorHandler.js       # Global error handling
│   ├── models/
│   │   ├── Game.js               # Game database operations
│   │   └── Player.js             # Player database operations
│   ├── routes/
│   │   └── playerRoutes.js       # REST API routes
│   ├── services/
│   │   └── GameService.js        # Core game logic & state management
│   ├── socket/
│   │   ├── index.js              # Socket.IO server initialization
│   │   └── gameHandlers.js       # Socket event handlers
│   ├── utils/
│   │   ├── botAI.js              # Bot AI implementation (3 levels)
│   │   ├── gameLogic.js          # Game rules & win detection
│   │   ├── logger.js             # Color-coded logging utility
│   │   └── errorTypes.js         # Custom error classes
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** database (local or cloud-hosted like Supabase)
- **npm** or **yarn** package manager

### Installation

1. **Clone and navigate to backend:**
```bash
cd Backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database Configuration (Supabase or local PostgreSQL)
DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Game Configuration
RECONNECT_TIMEOUT=30000        # 30 seconds to reconnect
BOT_MOVE_DELAY=1000           # 1 second delay for bot moves
MATCHMAKING_TIMEOUT=10000     # 10 seconds before bot joins
```

4. **Start the server:**
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

5. **Verify server is running:**
- Server: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- API info: `http://localhost:3000/api`

### Database Setup

The server automatically creates all required tables on first startup:
- `players` - Player profiles and statistics
- `games` - Game records and board states
- `game_moves` - Individual move history

No manual schema setup required! ✅

## 🎮 Game Flow

### 1. Matchmaking

```
Player joins queue
    ↓
Other player waiting?
    ├─ YES → Match instantly
    └─ NO → Wait for opponent
              ↓
         10 seconds elapsed?
              ↓
         Bot joins automatically
```

### 2. Gameplay

```
Game starts
    ↓
Player 1 moves first
    ↓
Alternate turns
    ↓
Check for winner after each move
    ↓
Game ends (Win/Draw/Forfeit)
    ↓
Update player statistics
```

### 3. Game Rules

- **Board**: 7 columns × 6 rows
- **Win Condition**: Connect 4 discs (horizontal, vertical, or diagonal)
- **Players**: Player 1 (Red) vs Player 2/Bot (Yellow)
- **Turn-based**: Players alternate dropping discs
- **Gravity**: Discs fall to lowest available position

## 🤖 Bot AI System

### Bot Behavior

- **Auto-join**: Joins automatically after 10 seconds of waiting
- **Difficulty**: Medium (can be changed in code)
- **Response time**: 1 second delay per move (feels human-like)

### AI Difficulty Levels

| Level | Strategy | Win Rate |
|-------|----------|----------|
| **Easy** | 30% optimal moves, 70% random | ~30% |
| **Medium** | Strategic blocking + center preference | ~60% |
| **Hard** | Minimax with alpha-beta pruning (depth 4) | ~95% |

**Current setting:** Medium (in `GameService.js:278`)

### Changing Bot Difficulty

Edit `Backend/src/services/GameService.js` line 278:
```javascript
// Change 'medium' to 'easy' or 'hard'
const column = BotAI.getBestMove(game.board, game.currentPlayer, 'medium');
```

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinGame` | `{ username: string }` | Join matchmaking queue |
| `makeMove` | `{ column: number }` | Drop disc in column (0-6) |
| `leaveGame` | `{ gameId: string }` | Leave current game |
| `newGame` | `{ username: string }` | Start a new game |
| `getLeaderboard` | `{ limit?: number }` | Fetch top players |
| `reconnectGame` | `{ gameId: string, playerNumber: number }` | Reconnect to game |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `gameFound` | `{ gameId, opponent, playerNumber, board, currentPlayer }` | Match found, game starting |
| `moveMade` | `{ board, currentPlayer, column }` | Move completed successfully |
| `gameOver` | `{ winner, isDraw, board }` | Game finished |
| `gameUpdate` | `{ gameId, board, currentPlayer, status }` | Game state updated |
| `opponentDisconnected` | - | Opponent lost connection |
| `opponentReconnected` | - | Opponent reconnected |
| `leaderboardData` | `{ leaderboard: Array }` | Top players data |
| `error` | `{ message, errorCode }` | Error occurred |

### Example: Join Game

**Client sends:**
```javascript
socket.emit('joinGame', { username: 'PlayerName' });
```

**Server responds with:**
```javascript
socket.on('gameFound', (data) => {
  console.log(data);
  // {
  //   gameId: 'abc-123-def',
  //   opponent: { username: 'Bot', isBot: true },
  //   playerNumber: 1,
  //   board: [[0,0,0...], ...],
  //   currentPlayer: 1
  // }
});
```

## 🗄️ Database Schema

### `players` Table

Stores player profiles and statistics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `username` | VARCHAR(50) | Unique username |
| `total_games` | INTEGER | Games played |
| `total_wins` | INTEGER | Games won |
| `total_losses` | INTEGER | Games lost |
| `total_draws` | INTEGER | Games drawn |
| `created_at` | TIMESTAMP | Registration date |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:** `idx_players_username` on `username`

### `games` Table

Stores game records and outcomes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `player1_id` | INTEGER | FK to players (or NULL for bot) |
| `player2_id` | INTEGER | FK to players (or NULL for bot) |
| `winner_id` | INTEGER | FK to players (NULL for draw) |
| `status` | VARCHAR(20) | waiting/playing/finished/abandoned |
| `result` | VARCHAR(20) | win/draw/forfeit |
| `board_state` | JSONB | Final board state |
| `started_at` | TIMESTAMP | Game start time |
| `ended_at` | TIMESTAMP | Game end time |
| `created_at` | TIMESTAMP | Record creation |

**Indexes:** `idx_games_status`, `idx_games_player1`, `idx_games_player2`

### `game_moves` Table

Stores individual move history for replay and analysis.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `game_id` | UUID | FK to games |
| `player_id` | INTEGER | FK to players |
| `column_index` | INTEGER | Column (0-6) |
| `row_index` | INTEGER | Row (0-5) |
| `move_number` | INTEGER | Move sequence |
| `created_at` | TIMESTAMP | Move timestamp |

**Indexes:** `idx_game_moves_game_id` on `game_id`

## 🌐 REST API Endpoints

### Health Check

**GET** `/health`

Returns server status and uptime.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T...",
  "uptime": 123.45
}
```

### API Information

**GET** `/api`

Returns API documentation and available endpoints.

### Leaderboard

**GET** `/api/players/leaderboard?limit=10`

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

## 🛡️ Error Handling

### Custom Error Classes

All errors inherit from `AppError` base class:

| Error Class | Status Code | Use Case |
|-------------|-------------|----------|
| `ValidationError` | 400 | Invalid input data |
| `GameError` | 400 | Game rule violations |
| `NotFoundError` | 404 | Resource not found |
| `DatabaseError` | 500 | Database operation failed |
| `SocketError` | 400 | WebSocket errors |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Username must be 20 characters or less",
    "errorCode": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2025-01-12T15:30:00.000Z"
  }
}
```

### Handling Errors on Client

```javascript
socket.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  // Handle based on error.errorCode
});
```

## 📊 Logging System

The backend uses color-coded console logging:

| Level | Symbol | Color | When to Use |
|-------|--------|-------|-------------|
| SUCCESS | ✓ | Green | Operations completed successfully |
| INFO | ℹ | Blue | General information |
| WARNING | ⚠ | Yellow | Non-critical issues |
| ERROR | ✗ | Red | Errors and exceptions |
| DEBUG | ◆ | Magenta | Development debugging (dev only) |

**Example output:**
```
[2025-01-12T15:30:00.000Z] [ℹ INFO] Starting 4 in a Row Game Server...
[2025-01-12T15:30:01.000Z] [✓ SUCCESS] Database initialized
[2025-01-12T15:30:01.500Z] [✓ SUCCESS] Socket.IO server initialized
[2025-01-12T15:30:01.501Z] [✓ SUCCESS] Server running on port 3000
```

**Debug logs** are automatically disabled in production (`NODE_ENV=production`).

## 🔧 Configuration

### Game Constants

Edit `src/constants/gameConstants.js`:

```javascript
const GAME_CONFIG = {
  ROWS: 6,                      // Board height
  COLS: 7,                      // Board width
  WIN_COUNT: 4,                 // Discs needed to win
  RECONNECT_TIMEOUT: 30000,     // Reconnection time (ms)
  BOT_MOVE_DELAY: 1000,        // Bot thinking time (ms)
  MATCHMAKING_TIMEOUT: 10000,   // Wait time before bot joins (ms)
};
```

### CORS Configuration

Edit `src/app.js` and `src/socket/index.js` to allow different origins:

```javascript
// app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// socket/index.js
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
```

## 🧪 Testing & Development

### Manual Testing

1. **Test matchmaking:**
   - Open 2 browser tabs
   - Join with different usernames
   - Verify instant matching

2. **Test bot:**
   - Join game alone
   - Wait 10 seconds
   - Verify bot joins

3. **Test gameplay:**
   - Make moves
   - Check win detection
   - Verify game over handling

### Database Queries

```sql
-- View all players
SELECT * FROM players ORDER BY total_wins DESC;

-- View recent games
SELECT * FROM games ORDER BY created_at DESC LIMIT 10;

-- View game moves
SELECT * FROM game_moves WHERE game_id = 'your-game-id';

-- Player statistics
SELECT
  username,
  total_wins,
  total_losses,
  ROUND((total_wins::numeric / NULLIF(total_games, 0) * 100), 2) as win_rate
FROM players
WHERE total_games >= 5
ORDER BY total_wins DESC;
```

### Viewing Logs

```bash
# Development mode (detailed logs)
npm run dev

# Production mode (minimal logs)
NODE_ENV=production npm start
```

## 🚀 Production Deployment

### 1. Environment Setup

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
DB_HOST=your-production-db.supabase.co
# ... other production config
```

### 2. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start src/server.js --name connect4-backend

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

### 3. Monitoring

```bash
# View logs
pm2 logs connect4-backend

# Monitor resources
pm2 monit

# Restart server
pm2 restart connect4-backend
```

### 4. Database

- Use connection pooling (already configured)
- Set up database backups
- Monitor connection limits
- Use read replicas for scaling

### 5. Security Checklist

- ✅ Environment variables properly set
- ✅ CORS configured for production domain
- ✅ Database credentials secure
- ✅ Rate limiting implemented (add if needed)
- ✅ HTTPS enabled on frontend
- ✅ SQL injection protected (parameterized queries)
- ✅ Input validation on all endpoints

## 🐛 Troubleshooting

### Server Won't Start

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process
kill -9 <PID>                 # Mac/Linux
taskkill /PID <PID> /F        # Windows
```

### Database Connection Failed

**Problem:** `ECONNREFUSED` or `Connection timeout`

**Solution:**
1. Verify database is running
2. Check credentials in `.env`
3. Test connection manually:
```bash
psql -h your-host -U your-user -d your-db
```
4. Check firewall/security groups

### Socket.IO Not Connecting

**Problem:** Frontend can't connect to backend

**Solution:**
1. Check `FRONTEND_URL` in backend `.env`
2. Verify CORS settings in `app.js` and `socket/index.js`
3. Check browser console for errors
4. Test Socket.IO directly:
```javascript
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected!'));
```

### Bot Not Joining

**Problem:** Bot doesn't join after 10 seconds

**Solution:**
1. Check `MATCHMAKING_TIMEOUT` in `.env`
2. Restart backend server
3. Check server logs for errors
4. Verify `GameService.js` timeout is set

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add proper error handling
5. Test your changes
6. Submit a pull request

---

**Built with ❤️ using Node.js, Socket.IO, and PostgreSQL**

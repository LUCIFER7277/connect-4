# 4 in a Row - Frontend

A real-time multiplayer Connect Four game built with React, Vite, and Tailwind CSS.

## Features

- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Real-time Gameplay**: Socket.IO integration for live multiplayer experience
- **Lobby System**: Username entry and matchmaking interface
- **Game Board**: Interactive 7x6 grid with smooth animations
- **Leaderboard**: Track player wins and statistics
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time bidirectional communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure your backend URL in `.env`:
```
VITE_BACKEND_URL=http://localhost:3000
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx      # 7x6 game board component
│   │   ├── Lobby.jsx           # Username entry and matchmaking
│   │   └── Leaderboard.jsx     # Leaderboard modal
│   ├── services/
│   │   └── socket.js           # Socket.IO service for backend communication
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles with Tailwind
│   └── main.jsx                # App entry point
├── public/                     # Static assets
├── .env                        # Environment variables
├── .env.example                # Environment variables template
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## Components

### Lobby
- Username input form
- "Finding opponent..." loading state
- Game rules display

### GameBoard
- 7x6 interactive grid
- Player indicators with disc colors
- Turn indicator
- Win/draw display
- Hover effects on columns

### Leaderboard
- Modal overlay
- Player rankings
- Win statistics
- Top 3 players highlighted

## Socket Events

### Emitting (Frontend → Backend)

- `joinGame` - Join game with username
- `makeMove` - Make a move (drop disc)
- `leaveGame` - Leave current game
- `newGame` - Request new game
- `getLeaderboard` - Fetch leaderboard data

### Listening (Backend → Frontend)

- `gameFound` - Matchmaking successful
- `gameUpdate` - Game state updated
- `moveMade` - Move completed
- `gameOver` - Game finished
- `opponentDisconnected` - Opponent left
- `opponentReconnected` - Opponent rejoined
- `error` - Error occurred

## Backend Integration

The frontend is ready to connect to your backend. Update the socket service in `src/services/socket.js` if you need to customize the events or add new functionality.

### Expected Backend API Structure

The frontend expects the following game state structure from the backend:

```javascript
{
  gameId: string,
  phase: 'lobby' | 'searching' | 'playing' | 'finished',
  player1: { username: string },
  player2: { username: string },
  board: number[][], // 6x7 array, null=empty, 1=player1, 2=player2
  currentPlayer: 1 | 2,
  myPlayer: 1 | 2,
  winner: 1 | 2 | 'draw' | null,
  isDraw: boolean
}
```

## Customization

### Changing Colors

Edit the Tailwind classes in the components:
- Player 1 disc: `from-pink-400 to-red-500`
- Player 2 disc: `from-yellow-300 to-blue-800`
- Board background: `from-indigo-600 to-purple-700`

### Changing Board Size

Currently hardcoded as 7x6 (COLS x ROWS). To change:
1. Update `ROWS` and `COLS` constants in `GameBoard.jsx`
2. Update backend game logic accordingly

## Development Notes

- All game logic is handled by the backend
- Frontend only handles UI and user interactions
- Socket.IO manages real-time communication
- Mock data is used for leaderboard (replace with API call)

## TODO for Backend Integration

1. Implement backend socket server
2. Remove mock setTimeout in `handleJoinGame` (App.jsx:34-45)
3. Uncomment socket emit calls in event handlers
4. Replace mock leaderboard data with API call (Leaderboard.jsx:18)
5. Handle reconnection logic for disconnected players

## License

MIT

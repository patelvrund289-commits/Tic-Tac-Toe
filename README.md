# 🎮 Tic-Tac-Toe Games

A complete implementation of Tic-Tac-Toe with both **real-time multiplayer** and **AI opponent** modes using Node.js, Socket.IO, and the Minimax algorithm.

## ✨ Features

- **🎯 Multiplayer Mode**: Real-time gameplay with Socket.IO
- **🤖 AI Mode**: Unbeatable AI using Minimax algorithm
- **📱 Responsive Design**: Works on desktop and mobile
- **🎨 Modern UI**: Clean, glassmorphism design
- **🔄 Game Management**: Reset, leave, and rematch functionality
- **⚡ Real-time Updates**: Instant board synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone or download** this project
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   # or
   node server/index.js
   ```

4. **Open your browser** and go to: `http://localhost:3000`

5. **Create/Login Account**:
   - New users: Click "New Player? Create Account" → Get GOT name + PIN
   - Returning users: Enter username + PIN to login

6. **Choose Your Game**:
   - **👥 Multiplayer**: Real-time matches with other players
   - **🤖 AI Game**: Play against unbeatable AI
   - **👑 Admin Panel**: Monitor player statistics (admin only)

## 📁 Project Structure

```
tictactoe-games/
├── server/
│   ├── index.js              # Main server setup & API endpoints
│   ├── games/
│   │   └── tictactoe.js      # Game logic & Minimax AI
│   └── socket/
│       └── gameHandler.js    # Socket.IO multiplayer logic
├── public/
│   ├── index.html            # Main menu (login required)
│   ├── login.html            # User authentication
│   ├── multiplayer.html      # Multiplayer game
│   ├── ai.html               # AI game
│   ├── admin.html            # Admin panel
│   └── README.md
├── package.json
└── README.md
```

## 🏗️ Architecture

### Backend Architecture

#### **Server Setup** (`server/index.js`)
- Express server with static file serving
- Socket.IO integration with CORS enabled
- Routes all game logic through socket handlers

#### **Game Logic** (`server/games/tictactoe.js`)
```javascript
class TicTacToe {
    constructor()        // Initialize 3x3 board
    makeMove(index)      // Validate and execute moves
    checkWinner()        // Detect win/draw conditions
    getGameState()       // Return current board state
    minimax()           // AI decision algorithm
    getBestMove()       // Calculate optimal AI move
}
```

#### **Multiplayer Handler** (`server/socket/gameHandler.js`)
- **Matchmaking**: Queue system for pairing players
- **Room Management**: Socket.IO rooms for game isolation
- **Turn Validation**: Server-side move verification
- **Disconnect Handling**: Graceful opponent disconnection
- **Game State Sync**: Real-time board updates

### Frontend Architecture

#### **Multiplayer Game** (`public/multiplayer.html`)
- Socket.IO client connection
- Real-time event handling
- Turn-based UI updates
- Winner/draw notifications

#### **AI Game** (`public/ai.html`)
- Client-side TicTacToe class
- Minimax algorithm implementation
- Instant AI responses
- Game state management

## 🧠 Minimax Algorithm

The AI uses the **Minimax algorithm** with **alpha-beta pruning** to guarantee unbeatable gameplay:

### How Minimax Works

1. **Recursive Evaluation**: Explores all possible game states
2. **Scoring System**:
   - AI win: `+10 - depth` (prefer faster wins)
   - Player win: `depth - 10` (delay losses)
   - Draw: `0`
3. **Optimal Move Selection**: Chooses move with highest score

### Example Decision Tree
```
Current Board: [X, O, X,
                 O, X,  ,
                  ,  ,  ]

AI (O) evaluates moves:
- Move to index 5: Leads to AI win → Score: +9
- Move to index 6: Player can win → Score: -9
- Move to index 7: Draw → Score: 0
- Move to index 8: Draw → Score: 0

AI chooses index 5 (best score: +9)
```

## 🎮 Game Rules

- **3x3 Grid**: Classic Tic-Tac-Toe board
- **Players**: X (first) and O (second)
- **Objective**: Get 3 in a row (horizontal, vertical, diagonal)
- **Turn-based**: Players alternate moves
- **Validation**: Server prevents invalid moves

## 🔧 API Reference

### REST API Endpoints

#### Authentication
- `POST /api/create-user` - Create new user account
- `POST /api/login` - User authentication
- `POST /api/admin/login` - Admin authentication
- `POST /api/update-stats` - Update user game statistics

#### Admin
- `GET /api/admin/players` - Get player statistics (admin only)

### Socket.IO Events (Multiplayer)

#### Client → Server
- `joinGame`: Join matchmaking queue
- `makeMove`: { roomId, index } - Make a move
- `resetGame`: Reset current game
- `leaveGame`: Leave current game

#### Server → Client
- `waitingForOpponent`: Added to matchmaking queue
- `gameStart`: { roomId, yourSymbol, opponentSymbol, currentPlayer }
- `gameUpdate`: { board, currentPlayer, lastMove }
- `gameEnd`: { winner, message }
- `gameReset`: { board, currentPlayer }
- `opponentDisconnected`: Opponent left unexpectedly

## 🚀 Deployment

### Local Development
```bash
npm start
# Server runs on http://localhost:3000
```

### Production Deployment
1. **Backend**: Deploy to Heroku, Railway, or Render
2. **Frontend**: Can be served statically from backend
3. **Update Socket.IO URL**: Change connection URL in frontend

### Cloudflare Pages (Frontend Only)
```bash
# Deploy static files only
wrangler pages deploy public --project-name tic-tac-toe
```

## 🧪 Testing

### Multiplayer Testing
1. Open two browser tabs to `http://localhost:3000/multiplayer.html`
2. Click "Join Game" in both tabs
3. Players will be automatically matched
4. Test moves, reset, and disconnect scenarios

### AI Testing
1. Open `http://localhost:3000/ai.html`
2. Play against the AI - it should never lose
3. Test edge cases and draw conditions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🎯 Learning Outcomes

This project demonstrates:
- **Real-time Web Applications** with Socket.IO
- **Game AI** with Minimax algorithm
- **Full-Stack JavaScript** development
- **Server-Side Validation** and security
- **Modern Web Development** practices
- **Responsive UI/UX** design

---

**Built with ❤️ using Node.js, Socket.IO, and vanilla JavaScript**

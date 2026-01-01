const TicTacToe = require('../games/tictactoe');

const games = new Map(); // roomId -> game instance
const players = new Map(); // socketId -> { roomId, playerSymbol, username, userId }
const waitingPlayers = []; // Queue for matchmaking
const socketToUser = new Map(); // socketId -> username

function gameHandler(io, users) {
  io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

  // Join matchmaking queue
  socket.on('joinGame', () => {
    console.log('Player joining game:', socket.id);

    // If there's a waiting player, create a room
    if (waitingPlayers.length > 0) {
      const opponentId = waitingPlayers.shift();
      const roomId = `room_${socket.id}_${opponentId}`;

      // Create game instance
      const game = new TicTacToe();

      // Assign players
      players.set(socket.id, { roomId, playerSymbol: 'X' });
      players.set(opponentId, { roomId, playerSymbol: 'O' });

      // Store game
      games.set(roomId, game);

      // Join room
      socket.join(roomId);
      io.sockets.sockets.get(opponentId).join(roomId);

      // Get player names from localStorage (sent via socket handshake or stored)
      const playerXName = socketToUser.get(socket.id) || 'Player X';
      const playerOName = socketToUser.get(opponentId) || 'Player O';

      // Store player data
      players.set(socket.id, { roomId, playerSymbol: 'X', username: playerXName, userId: null });
      players.set(opponentId, { roomId, playerSymbol: 'O', username: playerOName, userId: null });

      // Notify both players
      io.to(roomId).emit('gameStart', {
        roomId,
        yourSymbol: 'X',
        opponentSymbol: 'O',
        currentPlayer: 'X',
        playerXName: playerXName,
        playerOName: playerOName
      });

      console.log(`Game started in room ${roomId} between ${socket.id} (X) and ${opponentId} (O)`);
    } else {
      // Add to waiting queue
      waitingPlayers.push(socket.id);
      socket.emit('waitingForOpponent');
      console.log('Player added to waiting queue:', socket.id);
    }
  });

  // Handle player move
  socket.on('makeMove', (data) => {
    const { roomId, index } = data;
    const player = players.get(socket.id);

    if (!player || player.roomId !== roomId) {
      socket.emit('error', 'Invalid room or player');
      return;
    }

    const game = games.get(roomId);
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }

    // Check if it's the player's turn
    if (game.currentPlayer !== player.playerSymbol) {
      socket.emit('error', 'Not your turn');
      return;
    }

    // Make the move
    const moveSuccess = game.makeMove(index);
    if (!moveSuccess) {
      socket.emit('error', 'Invalid move');
      return;
    }

    // Broadcast updated game state to both players
    const gameState = game.getGameState();
    io.to(roomId).emit('gameUpdate', {
      ...gameState,
      lastMove: { player: player.playerSymbol, index }
    });

    // Check for game end
    if (game.gameOver) {
      let winnerUsername = null;
      let winnerUserId = null;

      if (game.winner) {
        // Find the winner's data
        for (const [socketId, playerData] of players) {
          if (playerData.roomId === roomId && playerData.playerSymbol === game.winner) {
            winnerUsername = playerData.username;
            winnerUserId = playerData.userId;
            break;
          }
        }

        io.to(roomId).emit('gameEnd', {
          winner: game.winner,
          winnerUsername: winnerUsername,
          message: `${winnerUsername} (${game.winner}) wins!`
        });

        // Update stats for both players
        for (const [socketId, playerData] of players) {
          if (playerData.roomId === roomId && playerData.userId) {
            const result = playerData.playerSymbol === game.winner ? 'win' : 'loss';
            // Emit to update stats (will be handled by client)
            io.to(socketId).emit('updateStats', {
              userId: playerData.userId,
              result: result
            });
          }
        }
      } else {
        io.to(roomId).emit('gameEnd', {
          winner: null,
          message: 'It\'s a draw!'
        });

        // Update stats for draw
        for (const [socketId, playerData] of players) {
          if (playerData.roomId === roomId && playerData.userId) {
            io.to(socketId).emit('updateStats', {
              userId: playerData.userId,
              result: 'draw'
            });
          }
        }
      }
      console.log(`Game ended in room ${roomId}`);
    }
  });

  // Handle game reset
  socket.on('resetGame', () => {
    const player = players.get(socket.id);
    if (!player) return;

    const game = games.get(player.roomId);
    if (!game) return;

    game.reset();

    // Notify both players
    io.to(player.roomId).emit('gameReset', game.getGameState());
    console.log(`Game reset in room ${player.roomId}`);
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    const player = players.get(socket.id);
    if (player) {
      const { roomId } = player;
      const game = games.get(roomId);

      // Remove from players map
      players.delete(socket.id);

      // Remove from waiting queue if present
      const waitingIndex = waitingPlayers.indexOf(socket.id);
      if (waitingIndex > -1) {
        waitingPlayers.splice(waitingIndex, 1);
      }

      // Notify opponent and end game
      socket.to(roomId).emit('opponentDisconnected');
      socket.to(roomId).emit('gameEnd', {
        winner: null,
        message: 'Opponent disconnected. Game ended.'
      });

      // Clean up game
      games.delete(roomId);

      console.log(`Game ended due to disconnect in room ${roomId}`);
    }
  });

  // Handle leave game
  socket.on('leaveGame', () => {
    const player = players.get(socket.id);
    if (player) {
      const { roomId } = player;

      // Remove from players map
      players.delete(socket.id);

      // Notify opponent
      socket.to(roomId).emit('opponentLeft');
      socket.to(roomId).emit('gameEnd', {
        winner: null,
        message: 'Opponent left the game.'
      });

      // Clean up game
      games.delete(roomId);

      // Leave socket room
      socket.leave(roomId);

      console.log(`Player ${socket.id} left game in room ${roomId}`);
    }
  });
  }); // Close io.on('connection') callback
} // Close gameHandler function

module.exports = gameHandler;

const TicTacToe = require('../games/tictactoe');

const games = {}; // Store active games by room ID
const players = {}; // Store player info by socket ID

function gameHandler(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Join a game room
    socket.on('joinGame', (roomId) => {
      if (!games[roomId]) {
        games[roomId] = {
          game: new TicTacToe(),
          players: [],
          spectators: []
        };
      }

      const room = games[roomId];
      if (room.players.length < 2) {
        room.players.push(socket.id);
        players[socket.id] = { roomId, symbol: room.players.length === 1 ? 'X' : 'O' };
        socket.join(roomId);

        // Notify players in the room
        io.to(roomId).emit('playerJoined', {
          playerCount: room.players.length,
          gameState: room.game.getGameState()
        });

        // Start game if two players
        if (room.players.length === 2) {
          io.to(roomId).emit('gameStart', {
            players: room.players.map(id => ({ id, symbol: players[id].symbol })),
            gameState: room.game.getGameState()
          });
        }
      } else {
        // Room full, add as spectator
        room.spectators.push(socket.id);
        socket.join(roomId);
        socket.emit('spectatorJoined', room.game.getGameState());
      }
    });

    // Handle player move
    socket.on('makeMove', (data) => {
      const { roomId, index } = data;
      const room = games[roomId];
      if (!room || !room.players.includes(socket.id)) return;

      const player = players[socket.id];
      if (room.game.currentPlayer !== player.symbol) return;

      if (room.game.makeMove(index)) {
        io.to(roomId).emit('moveMade', {
          index,
          player: player.symbol,
          gameState: room.game.getGameState()
        });

        // Check for game end
        if (room.game.winner || room.game.isDraw) {
          io.to(roomId).emit('gameEnd', {
            winner: room.game.winner,
            isDraw: room.game.isDraw
          });
        }
      }
    });

    // Reset game
    socket.on('resetGame', (roomId) => {
      const room = games[roomId];
      if (!room || !room.players.includes(socket.id)) return;

      room.game.reset();
      io.to(roomId).emit('gameReset', room.game.getGameState());
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      const player = players[socket.id];
      if (player) {
        const room = games[player.roomId];
        if (room) {
          room.players = room.players.filter(id => id !== socket.id);
          room.spectators = room.spectators.filter(id => id !== socket.id);

          // Notify remaining players
          io.to(player.roomId).emit('playerDisconnected', {
            disconnectedPlayer: socket.id,
            remainingPlayers: room.players.length
          });

          // If no players left, delete the room
          if (room.players.length === 0) {
            delete games[player.roomId];
          }
        }
        delete players[socket.id];
      }
    });
  });
}

module.exports = gameHandler;

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const gameHandler = require('./socket/gameHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Socket.IO game handler
gameHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Room-password mapping
const roomPasswords = {
  "SSSJIS": "#7430$",
  "WAGON": "PAZz0%",
  "Y2M$": "7R0Mnk(i)",
  "CHUPk0": "Az1Bu42&"
};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ username, room, password }, callback) => {
    // Validate room and password
    if (!roomPasswords[room]) {
      return callback({ error: 'Invalid room name.' });
    }
    if (roomPasswords[room] !== password) {
      return callback({ error: 'Incorrect password for this room.' });
    }

    socket.join(room);
    socket.data.username = username;
    socket.data.room = room;

    callback({ success: true });

    io.to(room).emit('message', `${username} has joined the room.`);
  });

  socket.on('chatMessage', (msg) => {
    const username = socket.data.username;
    const room = socket.data.room;
    if (!username || !room) return; // Not joined properly

    io.to(room).emit('message', `${username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    const username = socket.data.username;
    const room = socket.data.room;
    if (username && room) {
      io.to(room).emit('message', `${username} has left the room.`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',    // allow all origins - tighten this in production
    methods: ['GET', 'POST']
  }
});

// Fixed room-password mapping
const roomPasswords = {
  "SSSJIS": "#7430$",
  "WAGON": "PAZz0%",
  "Y2M$": "7R0Mnk(i)",
  "CHUPk0": "Az1Bu42&"
};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('joinRoom', ({ username, room, password }) => {
    if (!roomPasswords[room]) {
      socket.emit('errorMessage', 'Invalid room name.');
      return;
    }
    if (roomPasswords[room] !== password) {
      socket.emit('errorMessage', 'Incorrect password for this room.');
      return;
    }

    socket.join(room);
    socket.emit('joined', room);
    io.to(room).emit('message', `${username} has joined the room.`);
  });

  socket.on('chatMessage', ({ room, username, message }) => {
    if (roomPasswords[room]) {
      io.to(room).emit('message', `${username}: ${message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

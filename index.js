const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Fixed room-password mapping
const roomPasswords = {
  "SSSJIS": "#7430$",
  "WAGON": "PAZz0%",
  "Y2M$": "7R0Mnk(i)",
  "CHUPk0": "Az1Bu42&"
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ user, room, password }) => {
    if (!roomPasswords[room]) {
      socket.emit('errorMessage', 'Invalid room name');
      return;
    }
    if (roomPasswords[room] !== password) {
      socket.emit('errorMessage', 'Incorrect password');
      return;
    }

    socket.join(room);
    console.log(`${user} joined ${room}`);

    socket.emit('message', { user: 'System', text: `Welcome ${user} to room ${room}` });
    socket.to(room).emit('message', { user: 'System', text: `${user} has joined the chat` });
  });

  socket.on('chatMessage', ({ user, room, text }) => {
    io.to(room).emit('message', { user, text });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ✅ Room-password mapping
const roomPasswords = {
  SSSJIS: "#7430$",
  WAGON: "PAZz0%",
  "Y2M$": "7R0Mnk(i)",
  CHUPk0: "Az1Bu42&"
};

// ✅ Serve static files (e.g., public/index.html)
app.use(express.static('public'));

io.on('connection', socket => {
  console.log('🔌 New socket connected:', socket.id);

  // 🔐 Handle join room
  socket.on('joinRoom', ({ username, room, password }) => {
    if (!username || !room || !password) {
      socket.emit('errorMessage', 'All fields are required.');
      return;
    }

    const expectedPassword = roomPasswords[room];

    if (!expectedPassword) {
      socket.emit('errorMessage', '❌ Room does not exist.');
      return;
    }

    if (expectedPassword !== password) {
      socket.emit('errorMessage', '❌ Incorrect password.');
      return;
    }

    // ✅ Join room
    socket.join(room);
    socket.username = username;
    socket.room = room;

    socket.emit('joined', room);
    io.to(room).emit('message', { username: 'System', message: `${username} joined the room.` });

    updateActiveUserCount(room);
  });

  // 💬 Chat message
  socket.on('chatMessage', ({ room, username, message }) => {
    if (!room || !username || !message) return;

    io.to(room).emit('message', { username, message });
  });

  // ❌ Disconnection handling
  socket.on('disconnect', () => {
    const room = socket.room;
    const username = socket.username;

    if (room && username) {
      io.to(room).emit('message', { username: 'System', message: `${username} left the room.` });
      updateActiveUserCount(room);
    }

    console.log(`⚠️ Socket disconnected: ${socket.id}`);
  });

  // Helper: Update user count
  function updateActiveUserCount(room) {
    const clients = io.sockets.adapter.rooms.get(room) || new Set();
    io.to(room).emit('activeUsers', clients.size);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

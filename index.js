const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const roomPasswords = {
  "SSSJIS": "#7430$",
  "WAGON": "PAZz0%",
  "Y2M$": "7R0Mnk(i)",
  "CHUPk0": "Az1Bu42&"
};

function isValidRoomPassword(room, password) {
  return roomPasswords[room] === password;
}

app.use(express.static('public')); // Serve static files from public/

io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room, password }) => {
    if (!roomPasswords[room]) {
      socket.emit('errorMessage', 'Room does not exist');
      return;
    }
    if (!isValidRoomPassword(room, password)) {
      socket.emit('errorMessage', 'Invalid room password');
      return;
    }

    socket.join(room);
    socket.username = username;
    socket.room = room;

    socket.emit('joined', room);

    const clients = io.sockets.adapter.rooms.get(room) || new Set();
    io.to(room).emit('activeUsers', clients.size);
    io.to(room).emit('message', { username: 'System', message: `${username} joined the room.` });
  });

  socket.on('chatMessage', ({ room, username, message }) => {
    if (!room || !username || !message) return;
    io.to(room).emit('message', { username, message });
  });

  socket.on('disconnect', () => {
    const room = socket.room;
    const username = socket.username;

    if (room && username) {
      io.to(room).emit('message', { username: 'System', message: `${username} left the room.` });
      const clients = io.sockets.adapter.rooms.get(room) || new Set();
      io.to(room).emit('activeUsers', clients.size);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

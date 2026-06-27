const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const GameRoom = require('./GameRoom');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const rooms = new Map();       // code -> GameRoom
const socketToRoom = new Map(); // socketId -> roomCode

const PORT = process.env.PORT || 3001;
const TIME_LIMIT_MS = 20000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ name }) => {
    const room = new GameRoom(socket.id, name);
    rooms.set(room.code, room);
    socketToRoom.set(socket.id, room.code);
    socket.join(room.code);
    socket.emit('joined-room', { code: room.code, isHost: true });
    io.to(room.code).emit('room-update', room.getRoomUpdate());
  });

  socket.on('join-room', ({ code, name }) => {
    const upperCode = (code || '').toUpperCase().trim();
    const room = rooms.get(upperCode);
    if (!room) { socket.emit('join-error', { message: 'Room not found. Check your code and try again.' }); return; }
    if (room.state !== 'lobby') { socket.emit('join-error', { message: 'This game has already started.' }); return; }
    const result = room.addPlayer(socket.id, name);
    if (result.error) { socket.emit('join-error', { message: result.error }); return; }
    socketToRoom.set(socket.id, upperCode);
    socket.join(upperCode);
    socket.emit('joined-room', { code: upperCode, isHost: false });
    io.to(upperCode).emit('room-update', room.getRoomUpdate());
  });

  socket.on('submit-profile', ({ answers }) => {
    const code = socketToRoom.get(socket.id);
    const room = rooms.get(code);
    if (!room) return;
    room.submitProfile(socket.id, answers);
    io.to(code).emit('room-update', room.getRoomUpdate());
    socket.emit('profile-accepted');
  });

  socket.on('start-game', () => {
    const code = socketToRoom.get(socket.id);
    const room = rooms.get(code);
    if (!room || socket.id !== room.hostId) return;
    const result = room.startGame();
    if (result.error) { socket.emit('game-error', { message: result.error }); return; }
    io.to(code).emit('game-started');
    sendNextQuestion(room, code);
  });

  socket.on('submit-guess', ({ optionId }) => {
    const code = socketToRoom.get(socket.id);
    const room = rooms.get(code);
    if (!room) return;
    const result = room.submitGuess(socket.id, optionId);
    if (result.error) return;
    io.to(code).emit('guess-count', { count: result.guessCount, total: result.eligibleCount });
    if (room.allGuessesIn()) triggerReveal(room, code);
  });

  socket.on('next-round', () => {
    const code = socketToRoom.get(socket.id);
    const room = rooms.get(code);
    if (!room || socket.id !== room.hostId) return;
    const result = room.nextRound();
    if (result.finished) {
      io.to(code).emit('game-over', { finalScores: result.finalScores });
    } else {
      sendNextQuestion(room, code);
    }
  });

  socket.on('disconnect', () => {
    const code = socketToRoom.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;
    room.removePlayer(socket.id);
    socketToRoom.delete(socket.id);
    if (room.players.size === 0) { rooms.delete(code); return; }
    io.to(code).emit('room-update', room.getRoomUpdate());
    if (room.state === 'playing' && room.allGuessesIn()) triggerReveal(room, code);
  });
});

function sendNextQuestion(room, code) {
  const data = room.buildCurrentQuestion();

  io.to(code).emit('new-question', {
    question: data.question,
    subjectName: data.subjectName,
    subjectId: data.subjectId,
    options: data.options,
    roundNum: data.roundNum,
    totalRounds: data.totalRounds,
    totalPlayers: data.totalPlayers,
    timeLimit: TIME_LIMIT_MS
  });

  const subjectSocket = io.sockets.sockets.get(data.subjectId);
  if (subjectSocket) {
    subjectSocket.emit('you-are-subject', { question: data.question, yourAnswer: data.correctAnswer });
  }

  setTimeout(() => {
    if (room.state === 'playing' && room.currentRound) triggerReveal(room, code);
  }, TIME_LIMIT_MS + 500);
}

function triggerReveal(room, code) {
  const reveal = room.calculateReveal();
  if (!reveal) return;
  io.to(code).emit('round-reveal', reveal);
}

server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));

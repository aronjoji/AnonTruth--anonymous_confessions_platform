const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Determine allowed origins for CORS/Socket
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join_confession', (confessionId) => {
    socket.join(confessionId);
  });

  socket.on('join_user', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('join_chat', (chatId) => {
    if (chatId) socket.join(`chat_${chatId}`);
  });
  socket.on('leave_chat', (chatId) => {
    if (chatId) socket.leave(`chat_${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Pass io to routes
app.set('socketio', io);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/confessions', require('./routes/confessions'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chats', require('./routes/chats'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle client-side routing — serve index.html for all non-API routes
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('AnonTruth API is running...');
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── Graceful env check ───────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'AES_ENCRYPTION_KEY'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const errorHandler = require('./middleware/errorHandler');
const { generateQRPayload } = require('./utils/crypto');
const { verifyToken } = require('./utils/jwt');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io globally accessible for route handlers
global.io = io;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Socket.io QR Engine ─────────────────────────────────────────────────────

// Track active QR intervals per session: Map<sessionId, intervalId>
const activeQRIntervals = new Map();

io.use((socket, next) => {
  // Authenticate socket connections via JWT in handshake auth
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = verifyToken(token);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id} (${socket.user?.role})`);

  // Teacher joins a session room and starts receiving QR codes
  socket.on('join_session', ({ sessionId }) => {
    if (socket.user.role !== 'teacher') return;

    const room = `session_${sessionId}`;
    socket.join(room);
    console.log(`👩‍🏫 Teacher joined room: ${room}`);

    // Start QR refresh interval if not already running
    if (!activeQRIntervals.has(sessionId)) {
      const sendQR = () => {
        try {
          const payload = generateQRPayload(sessionId, socket.user.id);
          io.to(room).emit('qr_refresh', { payload, timestamp: Date.now() });
        } catch (err) {
          console.error('QR generation error:', err.message);
        }
      };

      sendQR(); // Send immediately
      const intervalId = setInterval(sendQR, 10000); // Every 10 seconds
      activeQRIntervals.set(sessionId, intervalId);
    }
  });

  // Teacher leaves/ends session — clean up interval
  socket.on('leave_session', ({ sessionId }) => {
    const room = `session_${sessionId}`;
    socket.leave(room);

    // If no teachers left in this room, stop the interval
    const roomData = io.sockets.adapter.rooms.get(room);
    const teachersInRoom = roomData ? roomData.size : 0;
    if (teachersInRoom === 0 && activeQRIntervals.has(sessionId)) {
      clearInterval(activeQRIntervals.get(sessionId));
      activeQRIntervals.delete(sessionId);
      console.log(`🛑 QR interval stopped for session: ${sessionId}`);
    }
  });

  // Student joins a session room to receive live updates
  socket.on('join_session_as_student', ({ sessionId }) => {
    if (socket.user.role !== 'student') return;
    socket.join(`session_${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── MongoDB + Server Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`🚀 QuickPass server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.io ready`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;

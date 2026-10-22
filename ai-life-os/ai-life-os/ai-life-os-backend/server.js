const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: '*', // Allow all origins in dev/prod or configure process.env.FRONTEND_URL
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Rate limiting ───────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many AI requests. Please wait a few minutes.' }
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(globalLimiter);

// ── Routes ──────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/ai',      aiLimiter, require('./routes/ai'));
app.use('/api/movies',  require('./routes/movies'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/daily',   require('./routes/daily'));
app.use('/api/startup', require('./routes/startup'));
app.use('/api/coach',   require('./routes/coach'));
app.use('/api/admin',   require('./routes/admin'));

// ── Comprehensive Health Check ──────────────────────
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
    },
    aiProviders: {
      groqConfigured: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq_api_key')),
      groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      ollamaModel: process.env.OLLAMA_MODEL || 'llama3.1:8b',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Internal Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 ====================================================');
  console.log(`✅  AI Life OS Production Backend running on port ${PORT}`);
  console.log(`⚡  Groq Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
  console.log(`🦙  Ollama Model: ${process.env.OLLAMA_MODEL || 'llama3.1:8b'}`);
  console.log(`🔒  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ====================================================\n');
});
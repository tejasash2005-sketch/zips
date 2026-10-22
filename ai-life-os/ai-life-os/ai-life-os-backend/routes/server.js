const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Rate limiting ───────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many AI requests. Wait 15 minutes.' }
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
app.use(globalLimiter);

// ── Routes ──────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/ai',      aiLimiter, require('./routes/ai'));
app.use('/api/movies',  require('./routes/movies'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/daily',   require('./routes/daily'));
app.use('/api/startup', require('./routes/startup'));

// ── Health check ────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    model: process.env.OLLAMA_MODEL,
    env: process.env.NODE_ENV,
  });
});

// ── 404 ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 ==========================================');
  console.log(`✅  AI Life OS Backend running on port ${PORT}`);
  console.log(`🦙  Model: ${process.env.OLLAMA_MODEL}`);
  console.log(`🌐  Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`📦  MongoDB: connecting...`);
  console.log('🚀 ==========================================\n');
});
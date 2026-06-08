/**
 * @file server.js
 * @description BhoomiChain Express API server.
 * Handles routing, CORS, request logging, chain integrity checks on startup,
 * and exposes all API endpoints for the land registry blockchain system.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const propertiesRouter = require('./routes/properties');
const transactionsRouter = require('./routes/transactions');
const fraudRouter = require('./routes/fraud');
const reitRouter = require('./routes/reit');
const { errorHandler } = require('./middleware/errorHandler');
const blockchain = require('./services/blockchain');
const stampDutyService = require('./services/stampDuty');
const { SUPPORTED_CITIES } = require('./constants/circleRates');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS Configuration ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)\x1b[0m`);
  });
  next();
});

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const chainLength = await blockchain.getTotalBlocks();
    const validation = await blockchain.validateChain();
    res.json({
      status: 'ok',
      service: 'BhoomiChain API',
      version: '1.0.0',
      chainLength,
      chainValid: validation.valid,
      validationMessage: validation.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ─── Reset Demo Data ────────────────────────────────────────────────────────────
const { initDatabase, seedDemoData } = require('./database/init')
const pool = require('./database/db')
app.post('/api/reset-demo', async (req, res) => {
  try {
    await pool.query('DELETE FROM blocks')
    await pool.query('DELETE FROM fraud_rejections')
    await seedDemoData()
    res.json({ success: true, message: 'Demo data reset successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
});

// ─── Test Alert Route ───────────────────────────────────────────────────────────
app.post('/api/test-alert', async (req, res) => {
  try {
    const { sendPropertyAlert } = require('./services/notifications')
    const result = await sendPropertyAlert('REGISTRATION', {
      propertyId: 'BHC-TEST-0001',
      ownerName: 'Test Owner',
      city: 'Mumbai',
      propertyType: 'residential',
      area: 1000,
      declaredValue: 10000000,
      stampDuty: 500000,
      blockNumber: 99
    })
    res.json({ success: true, result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── Dashboard Stats (with Cache) ───────────────────────────────────────────
let dashboardCache = null
let cacheTime = null
const CACHE_TTL = 30000 // 30 seconds

app.get('/api/dashboard/stats', async (req, res, next) => {
  try {
    console.log('📊 Dashboard stats requested')
    
    const now = Date.now()
    if (dashboardCache && cacheTime && (now - cacheTime) < 30000) {
      console.log('📊 Returning cached stats')
      return res.json(dashboardCache)
    }
    
    const { getDashboardStats } = require('./services/blockchain')
    const stats = await getDashboardStats()
    
    console.log('📊 Stats fetched:', JSON.stringify({
      totalProperties: stats.totalProperties,
      transactionsToday: stats.transactionsToday,
      cities: Object.keys(stats.registrationsByCity || {}).length
    }))
    
    dashboardCache = stats
    cacheTime = now
    res.json(stats)
  } catch (err) {
    console.error('Dashboard stats error:', err.message)
    next(err)
  }
})

// ─── API Routes ──────────────────────────────────────────────────────────────────
app.use('/api/properties', propertiesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api', transactionsRouter);           // expose /api/ledger under /api too
app.use('/api/fraud', fraudRouter);
app.use('/api/reit', reitRouter);

// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found.`,
    code: 'ROUTE_NOT_FOUND',
    availableRoutes: [
      'GET  /api/health',
      'GET  /api/dashboard/stats',
      'GET  /api/properties',
      'GET  /api/properties/search?q=',
      'POST /api/properties/register',
      'GET  /api/properties/:propertyId',
      'POST /api/properties/verify-integrity/:propertyId',
      'GET  /api/ledger',
      'POST /api/transactions/add',
      'POST /api/fraud/analyze',
      'GET  /api/fraud/alerts',
      'GET  /api/fraud/analytics',
      'GET  /api/reit/properties',
      'POST /api/reit/due-diligence',
    ],
  });
});

// ─── Global Error Handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

// ─── Startup ─────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await initDatabase()
  } catch (err) {
    console.error('⚠️  Could not connect to database:', err.message)
    console.error('⚠️  Check DATABASE_URL in your .env file')
    console.error('⚠️  Server will NOT start until database is connected')
    process.exit(1)
  }
  
  app.listen(PORT, () => {
    console.log('══════════════════════════════════════════════')
    console.log('  🏛️  BhoomiChain API Server — Running')
    console.log('══════════════════════════════════════════════')
    console.log(`🚀 Port: ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing'}`)
    console.log('══════════════════════════════════════════════')
  })
}

startServer()

module.exports = app; // for testing

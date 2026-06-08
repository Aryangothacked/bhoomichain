const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 3,
  min: 1,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
})

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully')
})

pool.on('error', (err, client) => {
  if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
    console.log('⚠️ DB connection reset — pool will reconnect automatically')
    return
  }
  console.error('❌ Unexpected DB error:', err.message)
})

module.exports = pool

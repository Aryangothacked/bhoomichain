const express = require('express')
const router = express.Router()
const { getLatestProperties, getPropertyHistory } = require('../services/blockchain')
const { analyzeForFraud } = require('../services/claude')

// GET /api/reit/properties
router.get('/properties', async (req, res, next) => {
  try {
    const filters = {}
    
    if (req.query.city && req.query.city !== 'all' && req.query.city !== 'All Cities' && req.query.city !== '') {
      filters.city = req.query.city
    }
    if (req.query.type && req.query.type !== 'all' && req.query.type !== 'All Types' && req.query.type !== '') {
      filters.propertyType = req.query.type
    }
    if (req.query.minArea && req.query.minArea !== '') {
      filters.minArea = parseFloat(req.query.minArea)
    }

    const properties = await getLatestProperties(filters)
    
    const result = await Promise.all(
      properties.map(async (prop) => {
        try {
          const history = await getPropertyHistory(prop.data.propertyId)
          return {
            ...prop,
            historyLength: history.length,
            lastTransaction: history[history.length - 1]?.timestamp || prop.timestamp
          }
        } catch (err) {
          return { ...prop, historyLength: 1, lastTransaction: prop.timestamp }
        }
      })
    )

    res.json({ success: true, properties: result, total: result.length })
  } catch (err) {
    console.error('REIT properties error:', err.message)
    next(err)
  }
})

// POST /api/reit/due-diligence
router.post('/due-diligence', async (req, res, next) => {
  try {
    const { propertyId } = req.body
    if (!propertyId) return res.status(400).json({ error: 'propertyId is required' })

    const history = await getPropertyHistory(propertyId)
    if (!history || history.length === 0) {
      return res.status(404).json({ error: 'Property not found' })
    }

    const latest = history[history.length - 1]
    const report = await analyzeForFraud(
      JSON.stringify({ property: latest.data, history: history.map(h => ({ blockNumber: h.blockNumber, eventType: h.data.eventType, timestamp: h.timestamp, owner: h.data.ownerName || h.data.newOwner })) }),
      'due_diligence'
    )

    res.json({ success: true, propertyId, report, property: latest.data, historyLength: history.length })
  } catch (err) {
    console.error('Due diligence error:', err.message)
    next(err)
  }
})

module.exports = router

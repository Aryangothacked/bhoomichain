/**
 * @file routes/properties.js
 * @description Property registration, retrieval, search, and integrity verification routes.
 */

'use strict';

const express = require('express');
const router = express.Router();

const { getLatestProperties, addBlock, getPropertyHistory, searchProperties, validateChain, getAllBlocks, generatePropertyId, saveFraudRejection, getFraudRejections, verifyPropertyIntegrity } = require('../services/blockchain');
const blockchain = require('../services/blockchain');
const fraudService = require('../services/fraud');
const stampDutyService = require('../services/stampDuty');
const { CIRCLE_RATES, SUPPORTED_CITIES } = require('../constants/circleRates');
const {
  registerPropertyRules,
  searchQueryRules,
  handleValidationErrors,
} = require('../middleware/validateRequest');

// ─── GET /api/properties ────────────────────────────────────────────────────────
/**
 * List properties with optional filters: city, type, minArea, status.
 * Returns the most recent block state for each unique property.
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {}
    if (req.query.city && req.query.city !== '') filters.city = req.query.city
    if (req.query.type && req.query.type !== '') filters.propertyType = req.query.type
    if (req.query.minArea && req.query.minArea !== '') filters.minArea = parseFloat(req.query.minArea)
    if (req.query.status && req.query.status !== '') filters.status = req.query.status

    const properties = await getLatestProperties(filters)
    res.json({ success: true, properties, total: properties.length })
  } catch (err) {
    console.error('GET /api/properties error:', err.message)
    next(err)
  }
});

// ─── GET /api/properties/search ─────────────────────────────────────────────────
/**
 * Full-text search across propertyId, ownerName, surveyNo.
 */
router.get('/search', searchQueryRules, handleValidationErrors, async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await blockchain.searchProperties(q);

    if (!results.length) {
      return res.status(404).json({ message: 'No properties matching your query.', results: [] });
    }

    res.json({
      count: results.length,
      results: results.map(({ registrationBlock, history }) => ({
        property: registrationBlock.data,
        registrationBlock: {
          blockNumber: registrationBlock.blockNumber,
          hash: registrationBlock.hash,
          prevHash: registrationBlock.prevHash,
          timestamp: registrationBlock.timestamp,
        },
        history: history.map((b) => ({
          blockNumber: b.blockNumber,
          eventType: b.data.eventType,
          ownerName: b.data.ownerName || b.data.newOwner,
          status: b.data.status,
          notes: b.data.notes,
          timestamp: b.timestamp,
          hash: b.hash,
        })),
        qrData: `BhoomiChain://verify/${registrationBlock.data.propertyId}/${history[history.length - 1]?.hash || registrationBlock.hash}`,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/properties/register ─────────────────────────────────────────────
/**
 * Register a new property on the blockchain.
 * Runs fraud checks, calculates stamp duty, and mines a new block.
 */
router.post(
  '/register',
  registerPropertyRules,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const {
        ownerName, aadhaarLast4, pan, surveyNo, khasraNo,
        area, declaredValue, gpsLat, gpsLng, city, propertyType, notes,
      } = req.body;

      // Generate property ID
      const propertyId = blockchain.generatePropertyId(city);

      // Run fraud detection checks
      const fraudResult = await fraudService.runAllChecks({
        city, area, declaredValue, surveyNo, khasraNo, aadhaarLast4,
      });

      // Hard block if any critical fraud alerts
      if (!fraudResult.approved) {
        await blockchain.saveFraudRejection({
          propertyId,
          ownerName,
          city,
          area,
          declaredValue,
          surveyNo,
          aadhaarLast4,
          pan,
        }, fraudResult.alerts);

        const { sendPropertyAlert } = require('../services/notifications')
        sendPropertyAlert('FRAUD_REJECTED', {
          ownerName: req.body.ownerName,
          city: req.body.city,
          declaredValue: req.body.declaredValue,
          rejectionReason: fraudResult.alerts.join(' | ')
        }).catch(err => console.error('Fraud alert failed silently:', err.message))

        return res.status(422).json({
          success: false,
          approved: false,
          alerts: fraudResult.alerts,
          warnings: fraudResult.warnings,
          message: 'Registration rejected due to fraud detection.',
        });
      }

      // Calculate stamp duty
      const circleRate = CIRCLE_RATES[city];
      const stampDuty = stampDutyService.calculate(city, declaredValue, propertyType);

      // Simulate 800ms mining delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Build block data
      const blockData = {
        propertyId,
        ownerName,
        aadhaarLast4,
        pan,
        surveyNo,
        khasraNo,
        area: parseFloat(area),
        circleRate,
        declaredValue: parseFloat(declaredValue),
        gpsLat: parseFloat(gpsLat),
        gpsLng: parseFloat(gpsLng),
        city,
        propertyType,
        eventType: 'REGISTRATION',
        status: 'CLEAR',
        notes: notes || '',
        newOwner: '',
        stampDuty: stampDuty.stampDuty,
        registrationFee: stampDuty.registrationFee,
      };

      const block = await blockchain.addBlock(blockData);

      const { sendPropertyAlert } = require('../services/notifications')
      sendPropertyAlert('REGISTRATION', {
        propertyId: block.data.propertyId,
        ownerName: block.data.ownerName,
        city: block.data.city,
        propertyType: block.data.propertyType,
        area: block.data.area,
        declaredValue: block.data.declaredValue,
        stampDuty: block.data.stampDuty,
        blockNumber: block.blockNumber
      }).catch(err => console.error('Alert send failed silently:', err.message))

      return res.status(201).json({
        success: true,
        approved: true,
        propertyId,
        block: {
          blockNumber: block.blockNumber,
          hash: block.hash,
          prevHash: block.prevHash,
          timestamp: block.timestamp,
        },
        stampDuty,
        warnings: fraudResult.warnings,
        qrData: `BhoomiChain://verify/${propertyId}/${block.hash}`,
        message: `Property ${propertyId} successfully registered in Block #${block.blockNumber}.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/properties/:propertyId ────────────────────────────────────────────
/**
 * Get full details of a single property with transaction history and chain integrity.
 */
router.get('/:propertyId', async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const history = await blockchain.getPropertyHistory(propertyId);
    
    // Find the registration block
    const regBlock = history.find(
      (b) => b.data?.propertyId === propertyId && b.data?.eventType === 'REGISTRATION'
    );

    if (!regBlock) {
      return res.status(404).json({ error: `Property ${propertyId} not found.`, code: 'NOT_FOUND' });
    }
    const latestBlock = history[history.length - 1];
    const chainIntegrity = await blockchain.verifyPropertyIntegrity(propertyId);

    res.json({
      property: latestBlock.data,
      registrationBlock: {
        blockNumber: regBlock.blockNumber,
        hash: regBlock.hash,
        prevHash: regBlock.prevHash,
        timestamp: regBlock.timestamp,
      },
      latestBlock: {
        blockNumber: latestBlock.blockNumber,
        hash: latestBlock.hash,
        prevHash: latestBlock.prevHash,
        timestamp: latestBlock.timestamp,
      },
      history: history.map((b) => ({
        blockNumber: b.blockNumber,
        hash: b.hash,
        prevHash: b.prevHash,
        timestamp: b.timestamp,
        eventType: b.data.eventType,
        ownerName: b.data.ownerName || b.data.newOwner,
        status: b.data.status,
        declaredValue: b.data.declaredValue,
        notes: b.data.notes,
      })),
      chainIntegrity,
      qrData: `BhoomiChain://verify/${propertyId}/${latestBlock.hash}`,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/properties/verify-integrity/:propertyId ──────────────────────────
/**
 * Re-hash all blocks for this property and return match status per block.
 */
router.post('/verify-integrity/:propertyId', async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const result = await blockchain.verifyPropertyIntegrity(propertyId);

    if (!result.blocks.length) {
      return res.status(404).json({ error: `No blocks found for property ${propertyId}.` });
    }

    res.json({
      propertyId,
      valid: result.valid,
      totalBlocks: result.blocks.length,
      blocks: result.blocks,
      message: result.valid
        ? 'All block hashes verified — property chain is intact.'
        : 'Hash mismatch detected — chain may have been tampered!',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

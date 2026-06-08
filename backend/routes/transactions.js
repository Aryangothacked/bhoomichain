/**
 * @file routes/transactions.js
 * @description Blockchain ledger and transaction management routes.
 */

'use strict';

const express = require('express');
const router = express.Router();

const blockchain = require('../services/blockchain');
const { addTransactionRules, handleValidationErrors } = require('../middleware/validateRequest');

// ─── GET /api/ledger ────────────────────────────────────────────────────────────
/**
 * Return the full blockchain ledger.
 * If ?export=true is passed, respond as a downloadable JSON file.
 */
router.get('/ledger', async (req, res, next) => {
  try {
    const chain = await blockchain.getAllBlocks();
    const validation = await blockchain.validateChain();

    if (req.query.export === 'true') {
      const filename = `bhoomichain_ledger_${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(chain, null, 2));
    }

    res.json({
      chainLength: chain.length,
      chainValid: validation.valid,
      validationMessage: validation.message,
      corruptedBlock: validation.corruptedBlock || null,
      chain: chain.map((block) => ({
        blockNumber: block.blockNumber,
        hash: block.hash,
        prevHash: block.prevHash,
        timestamp: block.timestamp,
        data: block.data
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/transactions/add ──────────────────────────────────────────────────
/**
 * Add a new event (SALE, MUTATION, LIEN, etc.) to an existing property.
 */
router.post('/add', addTransactionRules, handleValidationErrors, async (req, res, next) => {
  try {
    const { propertyId, eventType, newOwner, newValue, notes } = req.body;

    // Verify property exists
    const history = await blockchain.getPropertyHistory(propertyId);

    if (!history.length) {
      return res.status(404).json({
        error: `Property ${propertyId} not found in ledger.`,
        code: 'PROPERTY_NOT_FOUND',
      });
    }

    const latestBlock = history[history.length - 1];

    // Determine new status based on event type
    const statusMap = {
      SALE: 'CLEAR',
      MUTATION: 'CLEAR',
      INHERITANCE: 'CLEAR',
      LIEN: 'UNDER_LIEN',
      COURT_FREEZE: 'COURT_FREEZE',
    };
    const newStatus = statusMap[eventType] || latestBlock.data.status;

    // Build transaction block data
    const blockData = {
      propertyId,
      ownerName: newOwner || latestBlock.data.ownerName,
      newOwner: newOwner || '',
      city: latestBlock.data.city,
      propertyType: latestBlock.data.propertyType,
      area: latestBlock.data.area,
      circleRate: latestBlock.data.circleRate,
      declaredValue: parseFloat(newValue) || latestBlock.data.declaredValue,
      eventType,
      status: newStatus,
      notes: notes || '',
      stampDuty: eventType === 'SALE' && newValue ? Math.round(parseFloat(newValue) * 0.05) : 0,
      registrationFee: eventType === 'SALE' && newValue ? Math.round(parseFloat(newValue) * 0.01) : 0,
    };

    // Simulate 800ms mining delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newBlock = await blockchain.addBlock(blockData);

    res.status(201).json({
      success: true,
      message: `${eventType} transaction mined in Block #${newBlock.blockNumber}.`,
      block: {
        blockNumber: newBlock.blockNumber,
        hash: newBlock.hash,
        prevHash: newBlock.prevHash,
        timestamp: newBlock.timestamp,
        eventType,
        propertyId,
        newOwner: newOwner || '',
        newStatus,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

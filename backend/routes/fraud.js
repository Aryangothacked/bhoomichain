/**
 * @file routes/fraud.js
 * @description Fraud detection routes — AI analysis, local rule checks, and alert retrieval.
 */

'use strict';

const express = require('express');
const router = express.Router();

const groqService = require('../services/groq');
const fraudService = require('../services/fraud');
const blockchain = require('../services/blockchain');
const { fraudAnalyzeRules, handleValidationErrors } = require('../middleware/validateRequest');

// ─── POST /api/fraud/analyze ────────────────────────────────────────────────────
/**
 * Run AI-powered fraud analysis via Claude + local rule-based checks.
 * Body: { propertyDetails: string | object }
 */
router.post('/analyze', fraudAnalyzeRules, handleValidationErrors, async (req, res, next) => {
  try {
    const { propertyDetails } = req.body;

    // Run local rule-based checks if structured data is provided
    let localChecks = null;
    if (typeof propertyDetails === 'object') {
      const { city, area, declaredValue, surveyNo, khasraNo, aadhaarLast4 } = propertyDetails;
      if (city && area && declaredValue) {
        localChecks = await fraudService.runAllChecks({
          city, area: parseFloat(area), declaredValue: parseFloat(declaredValue),
          surveyNo: surveyNo || '', khasraNo: khasraNo || '',
          aadhaarLast4: aadhaarLast4 || '',
        });
      }
    }

    // Run Groq AI analysis
    let aiAnalysis = null;
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey && apiKey !== 'your_groq_api_key_here') {
      try {
        aiAnalysis = await groqService.analyzeForFraud(propertyDetails);
      } catch (err) {
        console.error('[Fraud Route] Groq API error:', err.message);
        // Non-fatal — still return local checks
        aiAnalysis = { error: err.message };
      }
    } else {
      aiAnalysis = { error: 'GROQ_API_KEY not configured. Add it to your .env file.' };
    }

    res.json({
      success: true,
      localChecks,
      aiAnalysis,
      combinedRiskScore: aiAnalysis?.riskScore ?? (localChecks?.approved === false ? 80 : 20),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/fraud/alerts ──────────────────────────────────────────────────────
/**
 * Return all rejected registration attempts (stored in rejects.json).
 * Also returns fraud analytics (above/below circle rate stats).
 */
router.get('/alerts', async (req, res, next) => {
  try {
    const [rejectedAttempts, analytics] = await Promise.all([
      blockchain.getFraudRejections(),
      fraudService.getFraudAnalytics(),
    ]);

    res.json({
      totalAlerts: rejectedAttempts.length,
      rejectedAttempts,
      analytics: {
        aboveCircleRate: analytics.aboveCircleRate,
        belowCircleRate: analytics.belowCircleRate,
        fraudAttemptsByCity: analytics.byCity,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/fraud/analytics ───────────────────────────────────────────────────
/**
 * Return fraud analytics only — number of above/below circle rate registrations and city breakdown.
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await fraudService.getFraudAnalytics();
    res.json({
      aboveCircleRate: analytics.aboveCircleRate,
      belowCircleRate: analytics.belowCircleRate,
      fraudAttemptsByCity: analytics.byCity,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

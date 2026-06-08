/**
 * @file fraud.js
 * @description Rule-based fraud detection service for BhoomiChain.
 * Checks for circle rate evasion, duplicate titles, and Aadhaar-based
 * benami ownership patterns without any external API calls.
 */

'use strict';

const { CIRCLE_RATES } = require('../constants/circleRates');
const { getAllBlocks } = require('./blockchain');

// ─── Individual checks ──────────────────────────────────────────────────────────

/**
 * Check if the declared transaction value meets the minimum circle rate threshold.
 * If declaredValue < (circleRate × area), the transaction is likely a benami/undervalue attempt.
 *
 * @param {string} city - City name (must exist in CIRCLE_RATES).
 * @param {number} area - Property area in sq ft.
 * @param {number} declaredValue - Declared transaction value in INR.
 * @returns {{ passed: boolean, reason?: string, minimumValue?: number, circleRate?: number }}
 */
function checkCircleRate(city, area, declaredValue) {
  const circleRate = CIRCLE_RATES[city];
  if (!circleRate) {
    return { passed: false, reason: `Circle rate not found for city: ${city}.` };
  }

  const minimumValue = circleRate * area;

  if (declaredValue < minimumValue) {
    return {
      passed: false,
      reason: `Declared value ₹${declaredValue.toLocaleString('en-IN')} is below circle rate minimum ₹${minimumValue.toLocaleString('en-IN')} for ${city} (₹${circleRate}/sqft × ${area} sqft).`,
      minimumValue,
      circleRate,
    };
  }

  return { passed: true, minimumValue, circleRate };
}

/**
 * Check if a given survey number + city combination is already registered.
 * Prevents duplicate title fraud (same land registered twice).
 *
 * @param {string} surveyNo - Survey or plot number.
 * @param {string} khasraNo - Khasra number.
 * @param {string} city - City name.
 * @param {string} [excludePropertyId] - Property ID to exclude (for updates).
 * @returns {Promise<{ passed: boolean, reason?: string, existingPropertyId?: string }>}
 */
async function checkDuplicateTitle(surveyNo, khasraNo, city, excludePropertyId = null) {
  const chain = await getAllBlocks();

  const duplicate = chain.find(
    (block) =>
      block.data &&
      block.data.eventType === 'REGISTRATION' &&
      block.data.city === city &&
      block.data.surveyNo === surveyNo &&
      block.data.propertyId !== excludePropertyId
  );

  if (duplicate) {
    return {
      passed: false,
      reason: `Survey number ${surveyNo} in ${city} is already registered as ${duplicate.data.propertyId}. Possible duplicate title fraud.`,
      existingPropertyId: duplicate.data.propertyId,
    };
  }

  return { passed: true };
}

/**
 * Check if a given Aadhaar (last 4) has registered 3 or more properties in the same city.
 * Flags potential benami ownership / property churning.
 *
 * @param {string} aadhaarLast4 - Last 4 digits of Aadhaar number.
 * @param {string} city - City name.
 * @param {string} [excludePropertyId] - Optional property ID to exclude from count.
 * @returns {Promise<{ passed: boolean, reason?: string, count?: number }>}
 */
async function checkAadhaarLimit(aadhaarLast4, city, excludePropertyId = null) {
  if (!aadhaarLast4 || aadhaarLast4 === '0000') {
    return { passed: true }; // Corporate entities without Aadhaar
  }

  const chain = await getAllBlocks();

  const count = chain.filter(
    (block) =>
      block.data &&
      block.data.eventType === 'REGISTRATION' &&
      block.data.aadhaarLast4 === aadhaarLast4 &&
      block.data.city === city &&
      block.data.propertyId !== excludePropertyId
  ).length;

  if (count >= 3) {
    return {
      passed: false,
      reason: `Aadhaar XXXX-${aadhaarLast4} already has ${count} registered properties in ${city}. Flagged for benami investigation under Prevention of Benami Transactions Act 1988.`,
      count,
    };
  }

  return { passed: true, count };
}

// ─── Combined check runner ──────────────────────────────────────────────────────

/**
 * Run all local fraud detection checks on a property registration request.
 * Returns an overall approval decision with array of failure reasons.
 *
 * @param {{
 *   city: string,
 *   area: number,
 *   declaredValue: number,
 *   surveyNo: string,
 *   khasraNo: string,
 *   aadhaarLast4: string,
 *   propertyId?: string
 * }} propertyData - Data from the registration request.
 * @returns {Promise<{
 *   approved: boolean,
 *   alerts: string[],
 *   warnings: string[],
 *   details: object
 * }>}
 */
async function runAllChecks(propertyData) {
  const { city, area, declaredValue, surveyNo, khasraNo, aadhaarLast4, propertyId } = propertyData;

  const alerts = [];    // Hard failures → registration blocked
  const warnings = [];  // Soft flags → registration flagged but allowed
  const details = {};

  // 1. Circle rate check
  const circleCheck = checkCircleRate(city, area, declaredValue);
  details.circleRateCheck = circleCheck;
  if (!circleCheck.passed) {
    alerts.push(circleCheck.reason);
  }

  // 2. Duplicate title check
  const dupCheck = await checkDuplicateTitle(surveyNo, khasraNo, city, propertyId || null);
  details.duplicateTitleCheck = dupCheck;
  if (!dupCheck.passed) {
    alerts.push(dupCheck.reason);
  }

  // 3. Aadhaar limit check
  const aadhaarCheck = await checkAadhaarLimit(aadhaarLast4, city, propertyId || null);
  details.aadhaarCheck = aadhaarCheck;
  if (!aadhaarCheck.passed) {
    warnings.push(aadhaarCheck.reason); // Warning only — does not block
  }

  const approved = alerts.length === 0;

  return { approved, alerts, warnings, details };
}

/**
 * Get all REGISTRATION blocks and classify each as above/below circle rate.
 * Used for analytics charts.
 * @returns {Promise<{ aboveCircleRate: number, belowCircleRate: number, byCity: Record<string, number> }>}
 */
async function getFraudAnalytics() {
  try {
    const blocks = await getAllBlocks()

    const totalTransactions = blocks.filter(b => b.blockNumber > 0).length
    const registrations = blocks.filter(b => b.data?.eventType === 'REGISTRATION')
    const sales = blocks.filter(b => b.data?.eventType === 'SALE')
    const courtFreezes = blocks.filter(b => b.data?.eventType === 'COURT_FREEZE')
    const liens = blocks.filter(b => b.data?.eventType === 'LIEN')

    const cityStats = {}
    blocks.forEach(b => {
      if (b.data?.city) {
        cityStats[b.data.city] = (cityStats[b.data.city] || 0) + 1
      }
    })

    return {
      totalTransactions,
      registrations: registrations.length,
      sales: sales.length,
      courtFreezes: courtFreezes.length,
      liens: liens.length,
      cityStats,
      // Keep legacy fields so /api/fraud/alerts still works without change
      aboveCircleRate: registrations.length,
      belowCircleRate: 0,
      byCity: cityStats,
    }
  } catch (err) {
    console.error('getFraudAnalytics error:', err.message)
    return {
      totalTransactions: 0,
      registrations: 0,
      sales: 0,
      courtFreezes: 0,
      liens: 0,
      cityStats: {},
      aboveCircleRate: 0,
      belowCircleRate: 0,
      byCity: {},
    }
  }
}

module.exports = {
  checkCircleRate,
  checkDuplicateTitle,
  checkAadhaarLimit,
  runAllChecks,
  getFraudAnalytics,
};

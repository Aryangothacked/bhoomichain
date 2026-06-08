/**
 * @file stampDuty.js
 * @description Stamp duty and registration fee calculation service for BhoomiChain.
 * Follows Indian state government rates with city-specific surcharges.
 */

'use strict';

const { SUPPORTED_CITIES } = require('../constants/circleRates');

// Cities with additional surcharges on stamp duty
const METRO_SURCHARGE_CITIES = { Mumbai: 0.01 }; // 1% Mumbai metro surcharge

/**
 * Calculate stamp duty, registration fee, and surcharges for a property transaction.
 *
 * Rates applied:
 * - Stamp Duty: 5% of declared value (standard across states for simplicity)
 * - Registration Fee: 1% of declared value
 * - Mumbai Metro Surcharge: additional 1% for Mumbai
 *
 * @param {string} city - City where the property is located.
 * @param {number} declaredValue - Declared transaction value in INR.
 * @param {string} propertyType - "residential" | "commercial" | "agricultural"
 * @returns {{
 *   stampDuty: number,
 *   registrationFee: number,
 *   surcharge: number,
 *   surchargeLabel: string,
 *   total: number,
 *   breakdown: string,
 *   baseValue: number
 * }}
 */
function calculate(city, declaredValue, propertyType) {
  const base = parseFloat(declaredValue) || 0;

  // Core rates
  const stampDutyRate = 0.05;
  const registrationFeeRate = 0.01;

  const stampDuty = Math.round(base * stampDutyRate);
  const registrationFee = Math.round(base * registrationFeeRate);

  // City-level surcharge
  const surchargeRate = METRO_SURCHARGE_CITIES[city] || 0;
  const surcharge = Math.round(base * surchargeRate);
  const surchargeLabel = surchargeRate > 0
    ? `${city} Metro Surcharge (${(surchargeRate * 100).toFixed(0)}%)`
    : 'None';

  const total = stampDuty + registrationFee + surcharge;

  const breakdown = [
    `Base Transaction Value: ₹${base.toLocaleString('en-IN')}`,
    `Stamp Duty @ 5%: ₹${stampDuty.toLocaleString('en-IN')}`,
    `Registration Fee @ 1%: ₹${registrationFee.toLocaleString('en-IN')}`,
    surchargeRate > 0
      ? `${surchargeLabel}: ₹${surcharge.toLocaleString('en-IN')}`
      : 'No surcharge applicable',
    `Total Payable: ₹${total.toLocaleString('en-IN')}`,
  ].join(' | ');

  return {
    baseValue: base,
    stampDuty,
    registrationFee,
    surcharge,
    surchargeLabel,
    total,
    breakdown,
  };
}

/**
 * Sum up all stamp duty collected across all registered transactions in the chain.
 * @param {object[]} chain - Full blockchain array.
 * @returns {number} Total stamp duty collected in INR.
 */
function getTotalStampDutyCollected(chain) {
  return chain.reduce((sum, block) => {
    if (block.data && typeof block.data.stampDuty === 'number') {
      return sum + block.data.stampDuty;
    }
    return sum;
  }, 0);
}

/**
 * Convert INR to Crore representation (for display).
 * @param {number} inr - Value in INR.
 * @returns {number} Value in Crore, rounded to 2 decimal places.
 */
function toCrore(inr) {
  return Math.round((inr / 10000000) * 100) / 100;
}

module.exports = { calculate, getTotalStampDutyCollected, toCrore };

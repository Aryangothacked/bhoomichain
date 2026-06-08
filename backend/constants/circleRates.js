/**
 * @file circleRates.js
 * @description Government-mandated circle rates per square foot (in INR)
 * for major Indian cities. Used for minimum transaction value validation.
 */

'use strict';

/** @type {Record<string, number>} Circle rate in ₹ per sq ft */
const CIRCLE_RATES = {
  Mumbai: 18000,
  Delhi: 12000,
  Bengaluru: 9500,
  Hyderabad: 7200,
  Pune: 8000,
  Chennai: 6500,
  Ahmedabad: 4500,
  Kolkata: 5000,
  Jaipur: 3800,
  Surat: 3500,
};

/** @type {Record<string, string>} Short 3-letter city codes for Property ID generation */
const CITY_CODES = {
  Mumbai: 'MUM',
  Delhi: 'DEL',
  Bengaluru: 'BLR',
  Hyderabad: 'HYD',
  Pune: 'PUN',
  Chennai: 'CHN',
  Ahmedabad: 'AMD',
  Kolkata: 'KOL',
  Jaipur: 'JAI',
  Surat: 'SRT',
};

/** @type {string[]} All supported cities */
const SUPPORTED_CITIES = Object.keys(CIRCLE_RATES);

/** @type {string[]} Supported property types */
const PROPERTY_TYPES = ['residential', 'commercial', 'agricultural'];

/** @type {string[]} Supported event types for blockchain transactions */
const EVENT_TYPES = ['REGISTRATION', 'SALE', 'MUTATION', 'INHERITANCE', 'LIEN', 'COURT_FREEZE'];

/** @type {string[]} Supported property status values */
const PROPERTY_STATUSES = ['CLEAR', 'DISPUTED', 'UNDER_LIEN', 'FROZEN', 'COURT_FREEZE'];

/** Genesis block hash constant */
const GENESIS_HASH = 'GENESIS_BHOOMICHAIN_INDIA_2024';

module.exports = {
  CIRCLE_RATES,
  CITY_CODES,
  SUPPORTED_CITIES,
  PROPERTY_TYPES,
  EVENT_TYPES,
  PROPERTY_STATUSES,
  GENESIS_HASH,
};

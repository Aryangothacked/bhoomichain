/**
 * @file validateRequest.js
 * @description Reusable express-validator middleware helpers for BhoomiChain.
 * Validates and sanitizes incoming request bodies using declarative rules.
 */

'use strict';

const { validationResult, body, param, query } = require('express-validator');
const { SUPPORTED_CITIES, PROPERTY_TYPES, EVENT_TYPES } = require('../constants/circleRates');

/**
 * Middleware: run validationResult and forward any errors to the next error handler.
 * Always place this after your validation rule arrays.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }
  next();
}

// ─── Validation rule sets ───────────────────────────────────────────────────────

/**
 * Validation rules for POST /api/properties/register
 */
const registerPropertyRules = [
  body('ownerName')
    .trim()
    .notEmpty().withMessage('Owner name is required.')
    .isLength({ min: 2, max: 120 }).withMessage('Owner name must be 2–120 characters.'),

  body('aadhaarLast4')
    .trim()
    .notEmpty().withMessage('Aadhaar last 4 digits are required.')
    .matches(/^\d{4}$/).withMessage('Aadhaar last 4 must be exactly 4 digits.'),

  body('pan')
    .trim()
    .notEmpty().withMessage('PAN number is required.')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).withMessage('PAN must be in format ABCDE1234F.')
    .toUpperCase(),

  body('surveyNo')
    .trim()
    .notEmpty().withMessage('Survey number is required.')
    .isLength({ max: 50 }).withMessage('Survey number must be under 50 characters.'),

  body('khasraNo')
    .trim()
    .notEmpty().withMessage('Khasra number is required.')
    .isLength({ max: 30 }).withMessage('Khasra number must be under 30 characters.'),

  body('area')
    .notEmpty().withMessage('Area is required.')
    .isFloat({ min: 1, max: 10000000 }).withMessage('Area must be a positive number in sq ft.')
    .toFloat(),

  body('declaredValue')
    .notEmpty().withMessage('Declared transaction value is required.')
    .isFloat({ min: 1 }).withMessage('Declared value must be a positive number in INR.')
    .toFloat(),

  body('gpsLat')
    .notEmpty().withMessage('GPS latitude is required.')
    .isFloat({ min: 6, max: 38 }).withMessage('Latitude must be a valid India coordinate (6–38).')
    .toFloat(),

  body('gpsLng')
    .notEmpty().withMessage('GPS longitude is required.')
    .isFloat({ min: 68, max: 98 }).withMessage('Longitude must be a valid India coordinate (68–98).')
    .toFloat(),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required.')
    .isIn(SUPPORTED_CITIES).withMessage(`City must be one of: ${SUPPORTED_CITIES.join(', ')}.`),

  body('propertyType')
    .trim()
    .notEmpty().withMessage('Property type is required.')
    .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}.`)
    .toLowerCase(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be under 500 characters.'),
];

/**
 * Validation rules for POST /api/transactions/add
 */
const addTransactionRules = [
  body('propertyId')
    .trim()
    .notEmpty().withMessage('Property ID is required.')
    .matches(/^BHC-[A-Z]{3}-\d{4}-\d{5}$/).withMessage('Invalid Property ID format (e.g. BHC-MUM-2024-00001).'),

  body('eventType')
    .trim()
    .notEmpty().withMessage('Event type is required.')
    .isIn(EVENT_TYPES).withMessage(`Event type must be one of: ${EVENT_TYPES.join(', ')}.`),

  body('newOwner')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('New owner name must be under 120 characters.'),

  body('newValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('New value must be a non-negative number.')
    .toFloat(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be under 500 characters.'),
];

/**
 * Validation rules for POST /api/fraud/analyze
 */
const fraudAnalyzeRules = [
  body('propertyDetails')
    .notEmpty().withMessage('propertyDetails is required.')
    .custom((val) => {
      if (typeof val !== 'string' && typeof val !== 'object') {
        throw new Error('propertyDetails must be a string or object.');
      }
      return true;
    }),
];

/**
 * Validation rules for POST /api/reit/due-diligence
 */
const dueDiligenceRules = [
  body('propertyId')
    .trim()
    .notEmpty().withMessage('Property ID is required.')
    .matches(/^BHC-[A-Z]{3}-\d{4}-\d{5}$/).withMessage('Invalid Property ID format.'),
];

/**
 * Validation rules for GET /api/properties/search
 */
const searchQueryRules = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query (q) is required.')
    .isLength({ min: 2 }).withMessage('Query must be at least 2 characters.'),
];

module.exports = {
  handleValidationErrors,
  registerPropertyRules,
  addTransactionRules,
  fraudAnalyzeRules,
  dueDiligenceRules,
  searchQueryRules,
};

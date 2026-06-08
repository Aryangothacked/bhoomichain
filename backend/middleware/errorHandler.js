/**
 * @file errorHandler.js
 * @description Global Express error handling middleware for BhoomiChain.
 * Catches all errors bubbled up via next(err) and returns structured JSON responses.
 */

'use strict';

/**
 * Global error handler middleware.
 * Must be registered as the last middleware in Express (after all routes).
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV !== 'production';

  // Determine HTTP status code
  let status = err.status || err.statusCode || 500;

  // Handle Axios/external API errors
  if (err.response) {
    status = err.response.status || 502;
    const apiMessage = err.response.data?.error?.message || 'External API error';
    console.error(`[ErrorHandler] External API error [${status}]: ${apiMessage}`);
    return res.status(status).json({
      error: apiMessage,
      code: 'EXTERNAL_API_ERROR',
      path: req.path,
    });
  }

  // Handle express-validator ValidationError (passed as array)
  if (Array.isArray(err)) {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err,
    });
  }

  console.error(`[ErrorHandler] ${req.method} ${req.path} → ${status}: ${err.message}`);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  return res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    path: req.path,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler };

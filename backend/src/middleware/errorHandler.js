function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Zod validation errors → 400 with detailed issues
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'validation_error',
      details: err.errors
    });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'internal_error'
  });
}

module.exports = { errorHandler };

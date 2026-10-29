const { validationResult } = require('express-validator');
const { AppError } = require('./errorMiddleware');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    const message = extractedErrors.map((e) => `${e.field}: ${e.message}`).join(', ');
    return next(new AppError(`Validation failed: ${message}`, 400));
  };
};

module.exports = { validate };

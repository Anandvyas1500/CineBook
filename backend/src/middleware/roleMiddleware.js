const { AppError } = require('./errorMiddleware');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { authorize };

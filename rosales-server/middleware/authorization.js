const { HttpStatus } = require("../config/constants");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: "Access denied",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = authorize;

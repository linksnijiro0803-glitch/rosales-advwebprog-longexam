const jwt = require("jsonwebtoken");
const { HttpStatus } = require("../config/constants");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: "Authorization header is required",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: "Authorization header must use Bearer token format",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: "Token is required",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: "JWT secret is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "Token has expired",
      });
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: "Invalid token",
    });
  }
};

module.exports = authenticate;

const Log = require("../models/logModel");

const getLogLevel = (statusCode) => {
  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "info";
};

const getRequestIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress;
};

const auditLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const level = getLogLevel(statusCode);
    const userId = req.user?.id || null;
    const username = req.user?.email || null;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const ipAddress = getRequestIp(req);

    const metadata = {
      method,
      path,
      ipAddress,
      userId,
      username,
      statusCode,
      durationMs,
    };

    Log.create({
      level,
      message: `${method} ${path} ${statusCode} - ${durationMs}ms`,
      metadata,
    }).catch((error) => {
      console.error("Audit logging failed:", error);
    });
  });

  next();
};

module.exports = auditLoggerMiddleware;

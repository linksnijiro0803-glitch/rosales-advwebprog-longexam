const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const progressiveLoginAttempts = new Map();

const lockoutRules = [
  { failedAttempts: 5, lockoutMinutes: 3 },
  { failedAttempts: 8, lockoutMinutes: 5 },
  { failedAttempts: 10, lockoutMinutes: 30 },
];

const getLoginAttemptKey = (req) => req.body?.email?.toLowerCase().trim();

const getLockoutRule = (failedAttempts) =>
  failedAttempts >= 10
    ? lockoutRules[lockoutRules.length - 1]
    : lockoutRules.find((rule) => rule.failedAttempts === failedAttempts);

const getRemainingLockoutSeconds = (lockedUntil) =>
  Math.ceil((lockedUntil - Date.now()) / 1000);

const sendLockoutResponse = (
  res,
  failedAttempts,
  lockoutMinutes,
  retryAfter,
  sendJson = res.json.bind(res)
) => {
  res.set("Retry-After", retryAfter.toString());
  res.status(429);

  return sendJson({
    message: `Too many failed login attempts. Please try again after ${lockoutMinutes} minutes.`,
    failedAttempts,
    lockoutMinutes,
  });
};

const progressiveLoginProtection = (req, res, next) => {
  const attemptKey = getLoginAttemptKey(req);

  if (!attemptKey) {
    return next();
  }

  const attemptState = progressiveLoginAttempts.get(attemptKey);

  if (attemptState?.lockedUntil && attemptState.lockedUntil > Date.now()) {
    const retryAfter = getRemainingLockoutSeconds(attemptState.lockedUntil);

    return sendLockoutResponse(
      res,
      attemptState.failedAttempts,
      attemptState.lockoutMinutes,
      retryAfter
    );
  }

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode === 401 && body?.message === "Invalid credentials") {
      const currentState = progressiveLoginAttempts.get(attemptKey) || {
        failedAttempts: 0,
      };
      const failedAttempts = currentState.failedAttempts + 1;
      const lockoutRule = getLockoutRule(failedAttempts);

      if (lockoutRule) {
        const lockedUntil = Date.now() + lockoutRule.lockoutMinutes * 60 * 1000;

        progressiveLoginAttempts.set(attemptKey, {
          failedAttempts,
          lockedUntil,
          lockoutMinutes: lockoutRule.lockoutMinutes,
        });

        const retryAfter = getRemainingLockoutSeconds(lockedUntil);

        return sendLockoutResponse(
          res,
          failedAttempts,
          lockoutRule.lockoutMinutes,
          retryAfter,
          originalJson
        );
      }

      progressiveLoginAttempts.set(attemptKey, {
        failedAttempts,
        lockedUntil: null,
        lockoutMinutes: null,
      });
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      progressiveLoginAttempts.delete(attemptKey);
    }

    return originalJson(body);
  };

  return next();
};

module.exports = {
  loginLimiter,
  progressiveLoginProtection,
};

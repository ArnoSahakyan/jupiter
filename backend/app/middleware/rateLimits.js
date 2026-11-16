const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const common = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res, next, options) =>
    res.status(options.statusCode).json({ message: 'Too many attempts, please try again later.' })
};

// Failed logins, counted per IP + username. Students on the same campus
// network share an IP, so keying on the username too stops password guessing
// against one account without locking everyone else out.
const loginLimiter = rateLimit({
  ...common,
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip)}:${String(req.body?.username || '').toLowerCase()}`
});

// Overall cap on auth requests from one IP (signup spam, username probing).
const authIpLimiter = rateLimit({
  ...common,
  windowMs: FIFTEEN_MINUTES,
  limit: 100
});

const signupLimiter = rateLimit({
  ...common,
  windowMs: ONE_HOUR,
  limit: 20
});

module.exports = { loginLimiter, authIpLimiter, signupLimiter };

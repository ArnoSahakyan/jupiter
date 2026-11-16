// Server-side checks for signup/signin. The frontend runs the same rules,
// but the API must not trust it: requests can be sent directly.

const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isString = (value) => typeof value === 'string';

const passwordProblem = (password) => {
  if (!isString(password) || password.length < 8) return 'Password must be at least 8 characters long';
  // bcrypt only uses the first 72 bytes of a password
  if (Buffer.byteLength(password, 'utf8') > 72) return 'Password must be at most 72 characters long';
  if (!/[0-9]/.test(password)) return 'Password requires a number';
  if (!/[a-z]/.test(password)) return 'Password requires a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password requires an uppercase letter';
  if (!/[^\w]/.test(password)) return 'Password requires a symbol';
  return null;
};

const signupProblem = ({ fname, username, email, password } = {}) => {
  if (!isString(fname) || fname.trim().length < 4 || fname.trim().length > 30) {
    return 'Full name must be 4-30 characters long';
  }
  if (!isString(username) || username.length < 3 || username.length > 20) {
    return 'Username must be 3-20 characters long';
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, "_" and "."';
  }
  if (!isString(email) || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return 'Please enter a valid email address';
  }
  return passwordProblem(password);
};

const validateSignup = (req, res, next) => {
  const problem = signupProblem(req.body);
  if (problem) return res.status(400).json({ message: problem });
  req.body.fname = req.body.fname.trim();
  next();
};

const validateSignin = (req, res, next) => {
  const { username, password } = req.body || {};
  if (!isString(username) || !username || username.length > 20 || !isString(password) || !password || password.length > 200) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  next();
};

module.exports = { validateSignup, validateSignin, signupProblem };

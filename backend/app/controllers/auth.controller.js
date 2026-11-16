require('dotenv').config()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const { setRefreshCookie, clearRefreshCookie, readRefreshCookie } = require("../utils/refreshCookie");

const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

// Cost 12: about a quarter second per hash. Older cost-8 hashes still verify.
const BCRYPT_ROUNDS = 12;
// Compared against when the username doesn't exist, so a wrong username takes
// as long as a wrong password and response times don't reveal valid usernames.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);
const INVALID_LOGIN = "Invalid username or password";

const generateAccessToken = (user) => {
  const accessToken = jwt.sign({ id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: '1hr',
    });
  return accessToken
}

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: "1d",
    });
  return refreshToken
}

exports.signup = async (req, res) => {
  try {
    // Create the user and its role together, so a failure never leaves a
    // half-registered account that blocks the username/email.
    await db.sequelize.transaction(async (transaction) => {
      const user = await User.create({
        fname: req.body.fname,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: await bcrypt.hash(req.body.password, BCRYPT_ROUNDS)
      }, { transaction });

      // Every new account gets the plain "user" role (id 1). Roles sent by the
      // client are ignored so nobody can sign themselves up as admin/moderator.
      await user.setRoles([1], { transaction });
    });

    res.send({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username.toLowerCase()
      }
    });

    // Same message and same bcrypt work whether the username or the password
    // is wrong, so the response doesn't reveal which usernames exist.
    const passwordIsValid = await bcrypt.compare(req.body.password, user ? user.password : DUMMY_HASH);
    if (!user || !passwordIsValid) {
      return res.status(401).send({ accessToken: null, message: INVALID_LOGIN });
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    const roles = await user.getRoles();
    const authorities = roles.map(role => "ROLE_" + role.name.toUpperCase());

    // The refresh token goes into an httpOnly cookie, not the response body.
    setRefreshCookie(res, refreshToken);

    res.status(200).send({
      id: user.id,
      fname: user.fname,
      username: user.username,
      email: user.email,
      pfp: user.pfp,
      coverPhoto: user.coverPhoto,
      job: user.job,
      onlineStatus: user.onlineStatus,
      accessToken,
      roles: authorities,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = readRefreshCookie(req);

  if (!refreshToken) {
    return res.status(401).json({ message: "Not logged in" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    const userId = decoded.id;

    User.findByPk(userId)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found!" });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user);

        // Send the new access token in the response
        res.status(200).json({ accessToken: accessToken });
      })
      .catch(err => {
        res.status(500).json({ message: err.message });
      });
  });
};

exports.logout = (req, res) => {
  clearRefreshCookie(res);
  res.status(200).json({ message: "Logged out" });
};

exports.userInfo = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'fname', 'username', 'email', 'pfp', 'coverPhoto', 'onlineStatus', 'job']
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      id: user.id,
      fname: user.fname,
      username: user.username,
      email: user.email,
      pfp: user.pfp,
      coverPhoto: user.coverPhoto,
      onlineStatus: user.onlineStatus,
      job: user.job
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving user information",
      error: error.message
    });
  }
};

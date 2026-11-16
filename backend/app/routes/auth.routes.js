const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/authJwt");
const { validateSignup, validateSignin } = require("../middleware/validateAuth");
const { loginLimiter, authIpLimiter, signupLimiter } = require("../middleware/rateLimits");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      authIpLimiter,
      signupLimiter,
      validateSignup,
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.signup
  );

  app.post("/api/auth/signin", [authIpLimiter, loginLimiter, validateSignin], controller.signin);

  app.post("/api/auth/refresh", authIpLimiter, controller.refreshToken);

  app.get("/api/user/info", verifyToken, controller.userInfo);

  app.get("/api/user/:id", verifyToken, controller.getUserById);
};
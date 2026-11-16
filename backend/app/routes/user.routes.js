const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  app.patch('/api/user/update', authJwt.verifyToken, controller.updateUserData)

  app.patch('/api/user/status', authJwt.verifyToken, controller.updateUserStatus)

  app.get('/api/search-user', authJwt.verifyToken, controller.searchUsers)
};

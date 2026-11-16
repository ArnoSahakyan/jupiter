const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/profile.controller');

module.exports = function (app) {
  app.get('/api/users/:id', verifyToken, controller.getProfile);
  app.get('/api/users/:id/posts', verifyToken, controller.getPosts);
  app.get('/api/users/:id/photos', verifyToken, controller.getPhotos);
  app.get('/api/users/:id/friends', verifyToken, controller.getFriends);
};

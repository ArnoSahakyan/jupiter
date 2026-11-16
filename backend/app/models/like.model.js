module.exports = (sequelize, Sequelize) => {
  const Like = sequelize.define("likes", {
    likeId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
    // matches migration 20261116-04-unique-likes
    indexes: [{ unique: true, fields: ['userId', 'postId'], name: 'likes_user_post_unique' }]
  });

  return Like;
};

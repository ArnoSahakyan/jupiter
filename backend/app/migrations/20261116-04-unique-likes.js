// One like per user per post, enforced by the database, and like counts
// recalculated from the actual likes (two quick clicks used to be able to
// create duplicate likes and double-count).

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DELETE FROM likes a USING likes b
        WHERE a."userId" = b."userId" AND a."postId" = b."postId" AND a."likeId" > b."likeId";
      ALTER TABLE likes ADD CONSTRAINT likes_user_post_unique UNIQUE ("userId", "postId");
      UPDATE posts SET "likeCount" = (SELECT COUNT(*) FROM likes WHERE likes."postId" = posts."postId");
    `);
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_post_unique;`);
  }
};

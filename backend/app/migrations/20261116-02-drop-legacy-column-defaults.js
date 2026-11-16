// Older databases have column defaults baked in by sync(): the template's
// "TV Model" job and image URLs from a Supabase project that no longer exists.
// The app supplies image defaults itself (see models/user.model.js), and new
// users start without a job.

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users ALTER COLUMN pfp DROP DEFAULT;
      ALTER TABLE users ALTER COLUMN "coverPhoto" DROP DEFAULT;
      ALTER TABLE users ALTER COLUMN job DROP DEFAULT;
      UPDATE users SET job = NULL WHERE job = 'TV Model';
    `);
  },

  async down() {
    // nothing to restore: the old defaults were wrong
  }
};

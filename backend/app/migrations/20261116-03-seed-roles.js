// Every new user gets role 1 ("user"), so the roles must exist.

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      INSERT INTO roles (id, name, "createdAt", "updatedAt") VALUES
        (1, 'user', NOW(), NOW()),
        (2, 'moderator', NOW(), NOW()),
        (3, 'admin', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`DELETE FROM roles WHERE id IN (1, 2, 3);`);
  }
};

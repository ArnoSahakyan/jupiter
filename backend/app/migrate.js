// Database migrations (app/migrations/*.js), tracked in the "SequelizeMeta"
// table. They run automatically when the server starts; to run them by hand:
//   npm run migrate          apply pending migrations
//   npm run migrate:down     undo the last one
// To change the schema, add a new file to app/migrations (never edit an old one)
// and update the matching model in app/models.

const { Umzug, SequelizeStorage } = require('umzug');
const db = require('./models');

const umzug = new Umzug({
  migrations: { glob: ['migrations/*.js', { cwd: __dirname }] },
  context: db.sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db.sequelize }),
  logger: { info: ({ event, name }) => event === 'migrated' && console.log(`Migrated: ${name}`), warn: console.warn, error: console.error, debug: () => {} }
});

const runMigrations = () => umzug.up();

module.exports = { runMigrations, umzug };

if (require.main === module) {
  const action = process.argv[2] === 'down' ? umzug.down() : umzug.up();
  action
    .then(() => db.sequelize.close())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

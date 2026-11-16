// Default images live in the configured Supabase project's "winku" bucket.
const DEFAULT_PFP = `${process.env.SUPABASE_IMAGE_URL}winku/default/pfp.jpg`;
const DEFAULT_COVER = `${process.env.SUPABASE_IMAGE_URL}winku/default/cover.jpg`;

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    fname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    pfp: {
      type: Sequelize.STRING,
      defaultValue: DEFAULT_PFP

    },
    coverPhoto: {
      type: Sequelize.STRING,
      defaultValue: DEFAULT_COVER
    },
    onlineStatus: {
      type: Sequelize.STRING,
      defaultValue: "online"
    },
    job: {
      type: Sequelize.STRING,
      allowNull: true
    }

  });

  return User;
};

module.exports.DEFAULT_PFP = DEFAULT_PFP;
module.exports.DEFAULT_COVER = DEFAULT_COVER;

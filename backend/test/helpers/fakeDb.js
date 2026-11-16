// Minimal in-memory stand-in for the Sequelize models used by chat/messages.
// Supports the where-clauses those modules use: plain equality plus [Op.or].

const Op = { or: Symbol('or') };

const matches = (row, where) =>
  Object.entries(where).every(([key, value]) => row[key] === value) &&
  (where[Op.or] ? where[Op.or].some(condition => matches(row, condition)) : true);

const createFakeDb = ({ friendships = [] } = {}) => {
  const savedMessages = [];
  return {
    Sequelize: { Op },
    friend: { findOne: async ({ where }) => friendships.find(row => matches(row, where)) || null },
    message: {
      create: async (message) => {
        savedMessages.push(message);
        return { messageId: savedMessages.length, createdAt: new Date(), ...message };
      }
    },
    savedMessages
  };
};

module.exports = { createFakeDb };

// Shared rules for direct messages, used by the REST endpoint and the socket chat.

// messages.message is a Sequelize STRING, i.e. varchar(255) in Postgres.
const MAX_MESSAGE_LENGTH = 255;

// Returns the trimmed message, or null if it is empty, not a string or too long.
const cleanMessage = (message) => {
  if (typeof message !== 'string') return null;
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
};

// Friendship row between these two users (either direction), or null.
const findFriendshipBetween = (db, userId, otherId) =>
  db.friend.findOne({
    where: {
      [db.Sequelize.Op.or]: [
        { userId, friendId: otherId },
        { userId: otherId, friendId: userId }
      ]
    }
  });

module.exports = { MAX_MESSAGE_LENGTH, cleanMessage, findFriendshipBetween };

// Real-time chat handlers.
// Every chat room belongs to one friendship. The server decides which room a
// socket may join and where a message goes, so nobody can listen to or post
// into a chat they are not part of.

const MAX_MESSAGE_LENGTH = 2000;

const roomName = (friendshipId) => `chat:${friendshipId}`;

module.exports = function registerChatHandlers(io, db) {
  const { Op } = db.Sequelize;

  // Friendship row by id, only if this user is one of the two friends.
  const findOwnFriendship = (friendshipId, userId) =>
    db.friend.findOne({
      where: {
        friendshipId,
        [Op.or]: [{ userId }, { friendId: userId }]
      }
    });

  // Friendship row between these two users, in either direction.
  const findFriendshipBetween = (userId, otherId) =>
    db.friend.findOne({
      where: {
        [Op.or]: [
          { userId, friendId: otherId },
          { userId: otherId, friendId: userId }
        ]
      }
    });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    socket.on('join_room', async (friendshipId) => {
      try {
        const id = Number(friendshipId);
        if (!Number.isInteger(id)) return;

        const friendship = await findOwnFriendship(id, userId);
        if (!friendship) return; // not your chat: silently refuse

        socket.join(roomName(friendship.friendshipId));
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const receiverId = Number(data?.receiverId);
        const message = typeof data?.message === 'string' ? data.message.trim() : '';
        if (!Number.isInteger(receiverId) || !message || message.length > MAX_MESSAGE_LENGTH) return;

        const friendship = await findFriendshipBetween(userId, receiverId);
        if (!friendship) return; // can only message friends

        await db.message.create({ senderId: userId, receiverId, message });

        // Build the payload on the server; never forward client data as-is.
        socket.to(roomName(friendship.friendshipId)).emit('receive_message', {
          senderId: userId,
          receiverId,
          message
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });
};

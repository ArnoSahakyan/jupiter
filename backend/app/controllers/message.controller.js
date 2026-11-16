const db = require("../models");
const { MAX_MESSAGE_LENGTH, cleanMessage, findFriendshipBetween } = require("../helpers/messages");

exports.saveMessage = async (req, res) => {
  const senderId = req.userId;
  const receiverId = Number(req.body.receiverId);
  const message = cleanMessage(req.body.message);

  if (!Number.isInteger(receiverId)) {
    return res.status(400).json({ error: 'A valid receiverId is required' });
  }

  if (!message) {
    return res.status(400).json({ error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters` });
  }

  try {
    const friendship = await findFriendshipBetween(db, senderId, receiverId);
    if (!friendship) {
      return res.status(403).json({ error: 'You can only message your friends' });
    }

    const newMessage = await db.message.create({
      senderId,
      receiverId,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Error saving message' });
  }
};

exports.getMessages = async (req, res) => {
  const userId = req.userId;
  const { friendId } = req.params;

  try {
    const messages = await db.message.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      attributes: ['messageId', 'senderId', 'receiverId', 'message', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });
    const response = {
      messages,
      friendId
    }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
};

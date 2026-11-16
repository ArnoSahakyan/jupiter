const db = require('../models');

const parsePostId = (req) => {
  const postId = Number(req.body?.postId);
  return Number.isInteger(postId) ? postId : null;
};

exports.likePost = async (req, res) => {
  const userId = req.userId;
  const postId = parsePostId(req);
  if (!postId) return res.status(400).json({ message: "A valid postId is required." });

  try {
    const post = await db.post.findByPk(postId, { attributes: ['postId'] });
    if (!post) return res.status(404).json({ message: "Post not found." });

    // The like and the counter change together; the database's unique
    // (userId, postId) constraint rejects a second like, even from two
    // simultaneous requests.
    await db.sequelize.transaction(async (transaction) => {
      await db.like.create({ userId, postId }, { transaction });
      await db.post.increment('likeCount', { by: 1, where: { postId }, transaction });
    });

    res.status(201).json({ message: "Post liked successfully.", postId, userId });
  } catch (error) {
    if (error instanceof db.Sequelize.UniqueConstraintError) {
      return res.status(400).json({ message: "You already liked this post." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.unlikePost = async (req, res) => {
  const userId = req.userId;
  const postId = parsePostId(req);
  if (!postId) return res.status(400).json({ message: "A valid postId is required." });

  try {
    // Only lower the counter if a like was actually removed.
    const removed = await db.sequelize.transaction(async (transaction) => {
      const count = await db.like.destroy({ where: { userId, postId }, transaction });
      if (count > 0) {
        await db.post.decrement('likeCount', { by: count, where: { postId }, transaction });
      }
      return count;
    });

    if (removed === 0) {
      return res.status(400).json({ message: "You haven't liked this post." });
    }
    res.status(200).json({ message: "Post unliked successfully.", postId, userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

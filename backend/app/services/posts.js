const db = require('../models');

// A new object each time: Sequelize mutates include definitions, so they can't be shared.
const author = () => ({ model: db.user, attributes: ['fname', 'pfp'] });

const toInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
};

const formatComment = (comment) => ({
  commentId: comment.commentId,
  userId: comment.userId,
  content: comment.content,
  parentId: comment.parentId,
  createdAt: comment.createdAt,
  fname: comment.user.fname,
  pfp: comment.user.pfp
});

// A page of posts (newest first) with author, comments + replies, and
// whether `viewerId` liked each one. Shared by the newsfeed, your timeline
// and other people's profiles.
const listPosts = async ({ where, viewerId, limit, offset }) => {
  const pageSize = Math.min(toInt(limit, 3) || 3, 50);
  const skip = toInt(offset, 0);

  // Counted separately: counting through the comment joins over-counts posts.
  const count = await db.post.count({ where });
  const posts = await db.post.findAll({
    where,
    limit: pageSize,
    offset: skip,
    include: [
      author(),
      {
        model: db.comment,
        where: { parentId: null },
        required: false,
        attributes: ['commentId', 'userId', 'content', 'parentId', 'createdAt'],
        include: [
          author(),
          { model: db.comment, as: 'replies', include: author() }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const likes = await db.like.findAll({
    where: { userId: viewerId, postId: posts.map(post => post.postId) },
    attributes: ['postId']
  });
  const likedPosts = new Set(likes.map(like => like.postId));

  return {
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: Math.floor(skip / pageSize) + 1,
    data: posts.map(post => ({
      postId: post.postId,
      content: post.content,
      image: post.image,
      likeCount: post.likeCount,
      createdAt: post.createdAt,
      fname: post.user.fname,
      pfp: post.user.pfp,
      userId: post.userId,
      likedByUser: likedPosts.has(post.postId),
      comments: post.comments.length > 0 ? post.comments.map(comment => ({
        ...formatComment(comment),
        replies: comment.replies.length > 0 ? comment.replies.map(formatComment) : null
      })) : null
    }))
  };
};

// A page of a user's posts that have an image.
const listPhotos = async ({ userId, limit, offset }) => {
  const pageSize = Math.min(toInt(limit, 3) || 3, 50);
  const skip = toInt(offset, 0);
  const { count, rows } = await db.post.findAndCountAll({
    where: { userId, image: { [db.Sequelize.Op.ne]: null } },
    limit: pageSize,
    offset: skip,
    attributes: ['postId', 'image'],
    order: [['postId', 'DESC']]
  });
  return {
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: Math.floor(skip / pageSize) + 1,
    data: rows.map(post => ({ postId: post.postId, image: post.image }))
  };
};

module.exports = { listPosts, listPhotos };

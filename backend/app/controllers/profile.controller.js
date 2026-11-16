// Other people's profiles: /api/users/:id[/posts|/photos|/friends]

const db = require('../models');
const { listPosts, listPhotos } = require('../services/posts');

const { Op } = db.Sequelize;
const PUBLIC_FIELDS = ['id', 'fname', 'username', 'pfp', 'coverPhoto', 'onlineStatus', 'job'];

// Resolve :id to an existing user, or answer 400/404 and return null.
const findTarget = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid user id' });
    return null;
  }
  const user = await db.user.findByPk(id, { attributes: [...PUBLIC_FIELDS, 'email'] });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return null;
  }
  return user;
};

const friendshipBetween = (a, b) => db.friend.findOne({
  where: { [Op.or]: [{ userId: a, friendId: b }, { userId: b, friendId: a }] }
});

// How the viewer relates to the profile owner, for the profile's action button.
const relationship = async (viewerId, targetId) => {
  if (viewerId === targetId) return { relationship: 'self', friendshipId: null };
  const friendship = await friendshipBetween(viewerId, targetId);
  if (friendship) return { relationship: 'friends', friendshipId: friendship.friendshipId };
  const sent = await db.friendRequest.findOne({ where: { senderId: viewerId, receiverId: targetId } });
  if (sent) return { relationship: 'request_sent', friendshipId: null };
  const received = await db.friendRequest.findOne({ where: { senderId: targetId, receiverId: viewerId } });
  if (received) return { relationship: 'request_received', friendshipId: null };
  return { relationship: 'none', friendshipId: null };
};

const friendIdsOf = async (userId) => {
  const rows = await db.friend.findAll({
    where: { [Op.or]: [{ userId }, { friendId: userId }] },
    attributes: ['userId', 'friendId']
  });
  return rows.map(row => (row.userId === userId ? row.friendId : row.userId));
};

exports.getProfile = async (req, res) => {
  try {
    const user = await findTarget(req, res);
    if (!user) return;
    const isSelf = user.id === req.userId;
    const [rel, friendsCount, postsCount] = await Promise.all([
      relationship(req.userId, user.id),
      db.friend.count({ where: { [Op.or]: [{ userId: user.id }, { friendId: user.id }] } }),
      db.post.count({ where: { userId: user.id } })
    ]);
    const profile = user.toJSON();
    if (!isSelf) delete profile.email; // email stays private
    res.status(200).json({ ...profile, ...rel, friendsCount, postsCount });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const user = await findTarget(req, res);
    if (!user) return;
    res.status(200).json(await listPosts({
      where: { userId: user.id }, viewerId: req.userId, limit: req.query.limit, offset: req.query.offset
    }));
  } catch (error) {
    console.error('Error fetching profile posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const user = await findTarget(req, res);
    if (!user) return;
    res.status(200).json(await listPhotos({ userId: user.id, limit: req.query.limit, offset: req.query.offset }));
  } catch (error) {
    console.error('Error fetching profile photos:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await findTarget(req, res);
    if (!user) return;
    const ids = await friendIdsOf(user.id);
    const friends = await db.user.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'fname', 'username', 'pfp', 'job', 'onlineStatus'],
      order: [['fname', 'ASC']]
    });
    res.status(200).json(friends);
  } catch (error) {
    console.error('Error fetching profile friends:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
};

// Demo data for trying Jupiter or taking screenshots:
//   docker compose exec api npm run seed
// Creates nine students with friendships, posts (some with pictures), comments,
// likes and chats. Every demo account uses the password below. Running it again
// replaces the previous demo data; other accounts are never touched.

require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const db = require('../app/models');
const supabase = require('../supabaseClient');
const art = require('./art');
const { PEOPLE, FRIENDS, REQUESTS, POST_PICTURES, POSTS, CHATS } = require('./data');

const PASSWORD = 'Jupiter-demo1';
const EMAIL_DOMAIN = 'demo.jupiter.test';
const BUCKET = 'winku';
const { Op } = db.Sequelize;

const ago = (hours) => new Date(Date.now() - hours * 3600 * 1000);

// Upload a generated image to the bucket's demo/ folder and return its public URL.
// Falls back to the default image when storage isn't set up.
const upload = async (path, makeImage) => {
  try {
    const { error } = await supabase.storage.from(BUCKET)
      .upload(`demo/${path}`, await makeImage(), { contentType: 'image/webp', upsert: true });
    if (error) throw error;
    return `${process.env.SUPABASE_IMAGE_URL}${BUCKET}/demo/${path}`;
  } catch (error) {
    console.warn(`  ! could not upload demo/${path} (${error.message}); using the default image`);
    return undefined;
  }
};

// Remove earlier demo accounts and everything that points at them.
const removeOldDemo = async (transaction) => {
  const old = await db.user.findAll({ where: { email: { [Op.like]: `%@${EMAIL_DOMAIN}` } }, attributes: ['id'], transaction });
  const ids = old.map(user => user.id);
  if (!ids.length) return 0;
  const posts = (await db.post.findAll({ where: { userId: ids }, attributes: ['postId'], transaction })).map(p => p.postId);
  const either = (a, b) => ({ [Op.or]: [{ [a]: ids }, { [b]: ids }] });
  await db.message.destroy({ where: either('senderId', 'receiverId'), transaction });
  await db.friend.destroy({ where: either('userId', 'friendId'), transaction });
  await db.friendRequest.destroy({ where: either('senderId', 'receiverId'), transaction });
  await db.like.destroy({ where: { [Op.or]: [{ userId: ids }, { postId: posts }] }, transaction });
  // replies first, then top-level comments
  await db.comment.destroy({ where: { parentId: { [Op.ne]: null }, [Op.or]: [{ userId: ids }, { postId: posts }] }, transaction });
  await db.comment.destroy({ where: { [Op.or]: [{ userId: ids }, { postId: posts }] }, transaction });
  await db.post.destroy({ where: { userId: ids }, transaction });
  await db.user.destroy({ where: { id: ids }, transaction });
  return ids.length;
};

async function seed() {
  console.log('Drawing and uploading pictures…');
  const images = {};
  await Promise.all(PEOPLE.map(async (person) => {
    images[person.key] = {
      pfp: await upload(`${person.key}-pfp.webp`, () => art.avatar(person.look)),
      coverPhoto: await upload(`${person.key}-cover.webp`, () => art.cover(...person.cover)),
    };
  }));
  const pictures = {};
  await Promise.all(Object.entries(POST_PICTURES).map(async ([name, [kind, options]]) => {
    pictures[name] = await upload(`post-${name}.webp`, () => art.picture(kind, options));
  }));

  const password = await bcrypt.hash(PASSWORD, 12);
  await db.sequelize.transaction(async (transaction) => {
    const removed = await removeOldDemo(transaction);
    if (removed) console.log(`Removed ${removed} earlier demo accounts`);

    const taken = await db.user.findAll({ where: { username: PEOPLE.map(p => p.key) }, attributes: ['username'], transaction });
    if (taken.length) {
      throw new Error(`These usernames already belong to real accounts: ${taken.map(u => u.username).join(', ')}`);
    }

    const users = {};
    for (const person of PEOPLE) {
      const user = await db.user.create({
        fname: person.fname,
        username: person.key,
        email: `${person.key}@${EMAIL_DOMAIN}`,
        password,
        job: person.job,
        onlineStatus: person.status,
        ...(images[person.key].pfp && { pfp: images[person.key].pfp }),
        ...(images[person.key].coverPhoto && { coverPhoto: images[person.key].coverPhoto }),
        createdAt: ago(person.joined * 24),
      }, { transaction });
      await user.setRoles([1], { transaction });
      users[person.key] = user.id;
    }

    for (const [a, b] of FRIENDS) {
      await db.friend.create({ userId: users[a], friendId: users[b], createdAt: ago(24 * 30) }, { transaction });
    }
    for (const [sender, receiver] of REQUESTS) {
      await db.friendRequest.create({ senderId: users[sender], receiverId: users[receiver], createdAt: ago(20) }, { transaction });
    }

    for (const post of POSTS) {
      const created = await db.post.create({
        userId: users[post.by],
        content: post.content,
        image: post.picture ? pictures[post.picture] ?? null : null,
        likeCount: post.likes.length,
        createdAt: ago(post.hoursAgo),
      }, { transaction });
      for (const liker of post.likes) {
        await db.like.create({ userId: users[liker], postId: created.postId }, { transaction });
      }
      for (const [author, content, hoursAgo, replies = []] of post.comments) {
        const comment = await db.comment.create({ postId: created.postId, userId: users[author], content, createdAt: ago(hoursAgo) }, { transaction });
        for (const [replyAuthor, replyContent, replyAgo] of replies) {
          await db.comment.create({ postId: created.postId, userId: users[replyAuthor], parentId: comment.commentId, content: replyContent, createdAt: ago(replyAgo) }, { transaction });
        }
      }
    }

    for (const [friend, messages] of Object.entries(CHATS)) {
      for (const [sender, message, minutesAgo] of messages) {
        const receiver = sender === 'ani' ? friend : 'ani';
        await db.message.create({ senderId: users[sender], receiverId: users[receiver], message, createdAt: ago(minutesAgo / 60) }, { transaction });
      }
    }
  });

  console.log(`Done: ${PEOPLE.length} people, ${POSTS.length} posts, ${Object.keys(CHATS).length} chats.`);
  console.log(`Log in as "ani" (or any other demo username) with the password "${PASSWORD}".`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.sequelize.close());

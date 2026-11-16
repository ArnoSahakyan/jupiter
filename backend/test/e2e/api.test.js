// End-to-end tests against a running API (e.g. `docker compose up`).
//   API_URL=http://localhost:8080 npm run test:e2e
// Each run signs up its own users (random suffix), so runs don't collide.
// Skipped when the API isn't reachable.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { io } = require('socket.io-client');

const API = process.env.API_URL || 'http://localhost:8080';
const PASSWORD = 'Passw0rd!';
const run = Date.now().toString(36).slice(-6);
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const call = async (method, path, { token, body, cookie } = {}) => {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(cookie && { Cookie: cookie })
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data, setCookie: res.headers.get('set-cookie') || '' };
};

const signupAndLogin = async (name) => {
  const username = `${name}_${run}`;
  const signup = await call('POST', '/api/auth/signup', {
    body: { fname: `Test ${name}`, username, email: `${username}@example.test`, password: PASSWORD }
  });
  assert.equal(signup.status, 200, `signup ${username}: ${JSON.stringify(signup.data)}`);
  const login = await call('POST', '/api/auth/signin', { body: { username, password: PASSWORD } });
  assert.equal(login.status, 200, `login ${username}`);
  return { ...login.data, cookie: login.setCookie.split(';')[0] };
};

test('Jupiter API end to end', async (t) => {
  try {
    await fetch(API + '/');
  } catch {
    t.skip(`API not reachable at ${API}`);
    return;
  }

  let alice, bob, eve, postId, commentId, friendshipId;

  await t.test('signup and login', async () => {
    [alice, bob, eve] = await Promise.all(['alice', 'bob', 'eve'].map(signupAndLogin));
    assert.ok(alice.accessToken);
    assert.equal(alice.job, null, 'new users start without a job');
  });

  await t.test('login errors do not reveal which usernames exist', async () => {
    const unknownUser = await call('POST', '/api/auth/signin', { body: { username: `nobody_${run}`, password: PASSWORD } });
    const wrongPassword = await call('POST', '/api/auth/signin', { body: { username: alice.username, password: 'Wr0ngPass!' } });
    assert.equal(unknownUser.status, 401);
    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownUser.data.message, wrongPassword.data.message);
  });

  await t.test('signup validates input and rejects duplicates', async () => {
    assert.equal((await call('POST', '/api/auth/signup', { body: {} })).status, 400);
    const duplicate = await call('POST', '/api/auth/signup', {
      body: { fname: 'Dup User', username: alice.username.toUpperCase(), email: `dup_${run}@example.test`, password: PASSWORD }
    });
    assert.equal(duplicate.status, 400);
    assert.match(duplicate.data.message, /Username is already in use/);
  });

  await t.test('refresh token lives in an httpOnly cookie', async () => {
    assert.ok(!('refreshToken' in alice), 'not in the login response body');
    const refreshed = await call('POST', '/api/auth/refresh', { cookie: alice.cookie });
    assert.equal(refreshed.status, 200);
    const info = await call('GET', '/api/user/info', { token: refreshed.data.accessToken });
    assert.equal(info.data.username, alice.username);
    assert.equal((await call('POST', '/api/auth/refresh', { body: { refreshToken: 'x' } })).status, 401);
  });

  await t.test('protected routes need a valid token', async () => {
    assert.equal((await call('GET', '/api/user/info')).status, 403);
    assert.equal((await call('GET', '/api/user/info', { token: 'garbage' })).status, 401);
  });

  await t.test('profile: edit name and job, status, search', async () => {
    const edited = await call('PATCH', '/api/user/update', { token: alice.accessToken, body: { fname: 'Alice Tester', job: ' Student ' } });
    assert.deepEqual(edited.data, { fname: 'Alice Tester', job: 'Student' });
    const cleared = await call('PATCH', '/api/user/update', { token: alice.accessToken, body: { fname: 'Alice Tester', job: '' } });
    assert.equal(cleared.data.job, null);
    const status = await call('PATCH', '/api/user/status', { token: alice.accessToken, body: { onlineStatus: 'away' } });
    assert.equal(status.data.onlineStatus, 'away');
    const search = await call('GET', `/api/search-user?query=${run}`, { token: alice.accessToken });
    const found = search.data.users.map(user => user.username).sort();
    assert.deepEqual(found, [bob.username, eve.username].sort(), 'finds the others, not yourself');
  });

  await t.test('posts, likes, comments and replies', async () => {
    const form = new FormData();
    form.append('content', `Hello from test run ${run}`);
    const created = await fetch(API + '/api/post', { method: 'POST', headers: { Authorization: `Bearer ${alice.accessToken}` }, body: form });
    assert.equal(created.status, 201);
    postId = (await created.json()).postId;

    const feed = await call('GET', '/api/posts?limit=50&offset=0', { token: bob.accessToken });
    assert.ok(feed.data.data.some(post => post.postId === postId), "Bob sees Alice's post");

    assert.equal((await call('POST', '/api/like', { token: bob.accessToken, body: { postId } })).status, 201);
    assert.equal((await call('POST', '/api/like', { token: bob.accessToken, body: { postId } })).status, 400, 'no double likes');
    const comment = await call('POST', '/api/comment', { token: bob.accessToken, body: { postId, content: 'Nice post!' } });
    commentId = comment.data.commentId;
    const reply = await call('POST', '/api/comment', { token: alice.accessToken, body: { postId, content: 'Thanks!', parentId: commentId } });
    assert.equal(reply.data.parentId, commentId);

    const mine = await call('GET', '/api/user-posts?limit=3&offset=0', { token: alice.accessToken });
    const post = mine.data.data.find(p => p.postId === postId);
    assert.equal(post.likeCount, 1);
    assert.equal(post.comments[0].replies[0].content, 'Thanks!');

    assert.equal((await call('POST', '/api/unlike', { token: bob.accessToken, body: { postId } })).status, 200);
  });

  await t.test('only the author can delete a post', async () => {
    assert.equal((await call('DELETE', `/api/delete-post/${postId}`, { token: eve.accessToken })).status, 403);
    assert.equal((await call('DELETE', `/api/delete-post/${postId}`, { token: alice.accessToken })).status, 200);
  });

  await t.test('friend requests', async () => {
    assert.equal((await call('POST', '/api/send-request', { token: alice.accessToken, body: { receiverId: bob.id } })).status, 200);
    assert.equal((await call('POST', '/api/send-request', { token: alice.accessToken, body: { receiverId: bob.id } })).status, 400, 'no duplicates');
    const requests = await call('GET', '/api/requests', { token: bob.accessToken });
    assert.ok(requests.data.some(request => request.senderId === alice.id));
    assert.equal((await call('POST', '/api/respond-request', { token: bob.accessToken, body: { senderId: alice.id, status: 'accepted' } })).status, 200);
    const friends = await call('GET', '/api/friends', { token: alice.accessToken });
    friendshipId = friends.data.find(friend => friend.id === bob.id)?.friendshipId;
    assert.ok(friendshipId, 'Alice and Bob are friends');
    const suggestions = await call('GET', '/api/unassociated-users', { token: alice.accessToken });
    assert.ok(!suggestions.data.some(user => user.id === bob.id || user.id === alice.id));
  });

  await t.test('real-time chat is private to the two friends', async () => {
    const connectAs = (user) => new Promise((resolve, reject) => {
      const socket = io(API, { auth: { token: user.accessToken } });
      socket.inbox = [];
      socket.on('receive_message', message => socket.inbox.push(message));
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', reject);
    });
    const [sa, sb, se] = await Promise.all([alice, bob, eve].map(connectAs));
    try {
      [sa, sb, se].forEach(socket => socket.emit('join_room', friendshipId));
      await wait(300);
      sa.emit('send_message', { receiverId: bob.id, message: `chat test ${run}` });
      await wait(500);
      assert.ok(sb.inbox.some(m => m.message === `chat test ${run}` && m.senderId === alice.id), 'Bob receives it');
      assert.equal(se.inbox.length, 0, 'Eve does not');
    } finally {
      [sa, sb, se].forEach(socket => socket.close());
    }
    const history = await call('GET', `/api/messages/${alice.id}`, { token: bob.accessToken });
    assert.ok(history.data.messages.some(m => m.message === `chat test ${run}`), 'saved in history');
    assert.equal((await call('POST', '/api/messages', { token: eve.accessToken, body: { receiverId: alice.id, message: 'spam' } })).status, 403);
  });

  await t.test('unfriend', async () => {
    assert.equal((await call('DELETE', `/api/delete-friend/${alice.id}`, { token: bob.accessToken })).status, 200);
  });

  await t.test('repeated failed logins are rate limited per account', async () => {
    let last;
    for (let i = 0; i < 11; i++) {
      last = await call('POST', '/api/auth/signin', { body: { username: eve.username, password: 'Wr0ngPass!' } });
    }
    assert.equal(last.status, 429);
    const otherUser = await call('POST', '/api/auth/signin', { body: { username: bob.username, password: PASSWORD } });
    assert.equal(otherUser.status, 200, 'other accounts on the same IP are not affected');
  });

  await t.test('logout clears the refresh cookie', async () => {
    const res = await call('POST', '/api/auth/logout', { cookie: bob.cookie });
    assert.equal(res.status, 200);
    assert.match(res.setCookie, /jupiter_rt=;/);
  });
});

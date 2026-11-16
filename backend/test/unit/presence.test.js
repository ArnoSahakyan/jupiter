// Online status follows real connections (app/socket/presence.js).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const registerPresence = require('../../app/socket/presence');

const OFFLINE_DELAY = 150;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const users = new Map([[1, { onlineStatus: 'online' }], [2, { onlineStatus: 'offline' }]]);
const db = {
  user: {
    findByPk: async (id) => users.get(id) || null,
    update: async (values, { where }) => { Object.assign(users.get(where.id), values); return [1]; }
  }
};
let server, io, url;

const connectAs = (userId) => new Promise((resolve) => {
  const socket = connect(url, { auth: { token: userId }, reconnection: false });
  socket.presence = [];
  socket.on('presence', (data) => socket.presence.push(data.onlineStatus));
  socket.on('connect', () => resolve(socket));
});

before(async () => {
  server = http.createServer();
  io = new Server(server);
  io.use((socket, next) => { socket.userId = socket.handshake.auth.token; next(); });
  registerPresence(io, db, { offlineDelayMs: OFFLINE_DELAY });
  await new Promise(resolve => server.listen(0, resolve));
  url = `http://localhost:${server.address().port}`;
});

after(() => { io.close(); server.close(); });

test('closing the app marks you offline after the delay, coming back marks you online', async () => {
  const first = await connectAs(1);
  await wait(50);
  assert.deepEqual(first.presence, ['online'], 'server tells the client its status');

  first.close();
  await wait(OFFLINE_DELAY / 3);
  assert.equal(users.get(1).onlineStatus, 'online', 'not offline yet (a reload reconnects quickly)');
  await wait(OFFLINE_DELAY * 2);
  assert.equal(users.get(1).onlineStatus, 'offline');

  const again = await connectAs(1);
  await wait(50);
  assert.equal(users.get(1).onlineStatus, 'online');
  assert.deepEqual(again.presence, ['online']);
  again.close();
});

test('a quick reconnect (page reload) never shows you offline', async () => {
  users.get(1).onlineStatus = 'online';
  const tab = await connectAs(1);
  tab.close();
  await wait(OFFLINE_DELAY / 3);
  const reloaded = await connectAs(1);
  await wait(OFFLINE_DELAY * 2);
  assert.equal(users.get(1).onlineStatus, 'online');
  reloaded.close();
  await wait(OFFLINE_DELAY * 2);
});

test('with two tabs open, closing one keeps you online', async () => {
  users.get(1).onlineStatus = 'online';
  const [tabA, tabB] = await Promise.all([connectAs(1), connectAs(1)]);
  tabA.close();
  await wait(OFFLINE_DELAY * 2);
  assert.equal(users.get(1).onlineStatus, 'online');
  tabB.close();
  await wait(OFFLINE_DELAY * 2);
  assert.equal(users.get(1).onlineStatus, 'offline');
});

test('choosing "offline" yourself is respected when you reconnect', async () => {
  // user 2 set themselves offline; connecting must not flip them online
  const socket = await connectAs(2);
  await wait(50);
  assert.equal(users.get(2).onlineStatus, 'offline');
  assert.deepEqual(socket.presence, ['offline']);
  socket.close();
});

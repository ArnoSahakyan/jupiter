// Chat privacy: a real Socket.IO server with an in-memory database.
// Alice (1) and Bob (2) are friends (friendship 10); Eve (3) is not.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const registerChatHandlers = require('../../app/socket/chat');
const { createFakeDb } = require('../helpers/fakeDb');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let server, io, db, url;
const clients = [];

const connectAs = (userId) => new Promise((resolve) => {
  const socket = connect(url, { auth: { token: userId } });
  socket.inbox = [];
  socket.on('receive_message', message => socket.inbox.push(message));
  socket.on('connect', () => resolve(socket));
  clients.push(socket);
});

before(async () => {
  db = createFakeDb({ friendships: [{ friendshipId: 10, userId: 1, friendId: 2 }] });
  server = http.createServer();
  io = new Server(server);
  // In the app the user id comes from a verified JWT; here the token is the id.
  io.use((socket, next) => { socket.userId = socket.handshake.auth.token; next(); });
  registerChatHandlers(io, db);
  await new Promise(resolve => server.listen(0, resolve));
  url = `http://localhost:${server.address().port}`;
});

after(() => {
  clients.forEach(socket => socket.close());
  io.close();
  server.close();
});

test('only friends can join a chat, and only friends can post to it', async () => {
  const [alice, bob, eve] = await Promise.all([connectAs(1), connectAs(2), connectAs(3)]);
  alice.emit('join_room', 10);
  bob.emit('join_room', 10);
  eve.emit('join_room', 10);      // not her friendship
  eve.emit('join_room', '10');
  await wait(150);

  alice.emit('send_message', { receiverId: 2, message: '  hi bob  ', senderId: 999, room: 10 });
  eve.emit('send_message', { receiverId: 2, message: 'spam from eve', room: 10 });
  eve.emit('send_message', { receiverId: 1, message: 'also spam', room: 10 });
  await wait(200);

  assert.equal(bob.inbox.length, 1, 'Bob gets exactly one message');
  assert.equal(bob.inbox[0].message, 'hi bob', 'message is trimmed');
  assert.equal(bob.inbox[0].senderId, 1, 'sender comes from the login, not the payload');
  assert.equal(eve.inbox.length, 0, 'Eve cannot listen in');
  assert.equal(alice.inbox.length, 0, 'Eve cannot message Alice');
  assert.deepEqual(db.savedMessages, [{ senderId: 1, receiverId: 2, message: 'hi bob' }]);
});

test('empty, too long and malformed messages are dropped', async () => {
  const before = db.savedMessages.length;
  const alice = await connectAs(1);
  alice.emit('send_message', { receiverId: 2, message: '   ' });
  alice.emit('send_message', { receiverId: 2, message: 'x'.repeat(256) });
  alice.emit('send_message', { receiverId: 'two', message: 'hi' });
  alice.emit('send_message', { receiverId: 2, message: { text: 'object' } });
  alice.emit('send_message', null);
  await wait(200);
  assert.equal(db.savedMessages.length, before);
});

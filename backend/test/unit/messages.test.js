// POST /api/messages controller, with the models swapped for an in-memory db.

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createFakeDb } = require('../helpers/fakeDb');

const db = createFakeDb({ friendships: [{ friendshipId: 10, userId: 1, friendId: 2 }] });
// The real models module connects to PostgreSQL; replace it before loading the controller.
require.cache[require.resolve(path.join(__dirname, '../../app/models/index.js'))] = { exports: db, loaded: true };
const { saveMessage } = require('../../app/controllers/message.controller');

const send = async (userId, body) => {
  const result = {};
  const res = {
    status(code) { result.status = code; return this; },
    json(payload) { result.body = payload; return this; }
  };
  await saveMessage({ userId, body }, res);
  return result;
};

beforeEach(() => { db.savedMessages.length = 0; });

test('a friend can send a message; the sender comes from the login', async () => {
  const { status, body } = await send(1, { receiverId: 2, message: '  hi  ', senderId: 999 });
  assert.equal(status, 201);
  assert.equal(body.message, 'hi');
  assert.deepEqual(db.savedMessages, [{ senderId: 1, receiverId: 2, message: 'hi' }]);
});

test('messages to non-friends are rejected', async () => {
  assert.equal((await send(3, { receiverId: 2, message: 'spam' })).status, 403);
  assert.equal((await send(1, { receiverId: 3, message: 'hey' })).status, 403);
  assert.equal(db.savedMessages.length, 0);
});

test('invalid input is rejected', async () => {
  for (const body of [
    { receiverId: 2, message: '   ' },
    { receiverId: 2, message: 'a'.repeat(256) },
    { receiverId: 'abc', message: 'x' },
    { receiverId: 2, message: { text: 'object' } }
  ]) {
    assert.equal((await send(1, body)).status, 400, JSON.stringify(body));
  }
  assert.equal((await send(1, { receiverId: 2, message: 'a'.repeat(255) })).status, 201, '255 characters is allowed');
});

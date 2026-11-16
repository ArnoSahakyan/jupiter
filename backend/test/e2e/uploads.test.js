// Image uploads against a running API. These write to the real Supabase
// bucket from .env (and delete what they create), so they only run when asked:
//   RUN_UPLOAD_TESTS=1 npm run test:e2e

require('dotenv').config({ quiet: true });
const { test } = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');

const API = process.env.API_URL || 'http://localhost:8080';
const run = Date.now().toString(36).slice(-6);

test('image uploads', { skip: process.env.RUN_UPLOAD_TESTS !== '1' && 'set RUN_UPLOAD_TESTS=1 to run' }, async (t) => {
  const supabase = require('../../supabaseClient');
  const bucketUrl = `${process.env.SUPABASE_IMAGE_URL}winku/`;
  const createdFiles = [];

  const username = `upload_${run}`;
  await fetch(`${API}/api/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fname: 'Upload Tester', username, email: `${username}@example.test`, password: 'Passw0rd!' })
  });
  const user = await (await fetch(`${API}/api/auth/signin`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'Passw0rd!' })
  })).json();
  const auth = { Authorization: `Bearer ${user.accessToken}` };

  const image = await sharp({ create: { width: 400, height: 400, channels: 3, background: '#6D3FD6' } }).png().toBuffer();
  const form = (fields) => {
    const data = new FormData();
    data.append('file', new Blob([image], { type: 'image/png' }), 'test.png');
    Object.entries(fields).forEach(([key, value]) => data.append(key, value));
    return data;
  };

  try {
    await t.test('profile picture replaces the default image', async () => {
      const res = await fetch(`${API}/api/upload/user-images`, { method: 'POST', headers: auth, body: form({ type: 'pfp' }), signal: AbortSignal.timeout(20000) });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.ok(body.pfp.startsWith(bucketUrl));
      createdFiles.push(body.pfp.replace(bucketUrl, ''));
      assert.equal((await fetch(body.pfp)).status, 200, 'uploaded image is reachable');
      const defaults = await supabase.storage.from('winku').list('default');
      assert.deepEqual(defaults.data.map(f => f.name).sort(), ['cover.jpg', 'pfp.jpg'], 'shared defaults untouched');
    });

    await t.test('only pfp/coverPhoto can be set', async () => {
      const res = await fetch(`${API}/api/upload/user-images`, { method: 'POST', headers: auth, body: form({ type: 'password' }) });
      assert.equal(res.status, 400);
    });

    await t.test('post image is stored and removed with the post', async () => {
      const res = await fetch(`${API}/api/post`, { method: 'POST', headers: auth, body: form({ content: 'Photo post test' }) });
      const post = await res.json();
      assert.equal(res.status, 201);
      assert.ok(post.image.startsWith(bucketUrl));
      const path = post.image.replace(bucketUrl, '');
      const photos = await (await fetch(`${API}/api/photos?limit=3&offset=0`, { headers: auth })).json();
      assert.ok(photos.data.some(p => p.postId === post.postId), 'shows on the Photos page');
      assert.equal((await fetch(`${API}/api/delete-post/${post.postId}`, { method: 'DELETE', headers: auth })).status, 200);
      const folder = await supabase.storage.from('winku').list(path.split('/').slice(0, -1).join('/'));
      assert.ok(!folder.data.some(file => path.endsWith(file.name)), 'file deleted from storage');
    });
  } finally {
    if (createdFiles.length) await supabase.storage.from('winku').remove(createdFiles);
  }
});

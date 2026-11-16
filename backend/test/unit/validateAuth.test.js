const { test } = require('node:test');
const assert = require('node:assert/strict');
const { signupProblem } = require('../../app/middleware/validateAuth');

const valid = { fname: 'Test User', username: 'test_user.1', email: 'test@example.com', password: 'Passw0rd!' };

test('accepts a valid signup', () => {
  assert.equal(signupProblem(valid), null);
});

test('rejects bad signups with a clear message', () => {
  const cases = [
    [{}, /Full name/],
    [{ ...valid, fname: 'Al' }, /Full name/],
    [{ ...valid, username: 'ab' }, /3-20/],
    [{ ...valid, username: 'has space' }, /letters, numbers/],
    [{ ...valid, username: 42 }, /3-20/],
    [{ ...valid, email: 'not-an-email' }, /email/],
    [{ ...valid, password: 'Sh0rt!' }, /at least 8/],
    [{ ...valid, password: 'Aa1!' + 'x'.repeat(70) }, /at most 72/],
    [{ ...valid, password: 'password1!' }, /uppercase/],
    [{ ...valid, password: 'PASSWORD1!' }, /lowercase/],
    [{ ...valid, password: 'Password!' }, /number/],
    [{ ...valid, password: 'Password1' }, /symbol/]
  ];
  for (const [input, expected] of cases) {
    assert.match(signupProblem(input) ?? 'accepted', expected, JSON.stringify(input));
  }
});

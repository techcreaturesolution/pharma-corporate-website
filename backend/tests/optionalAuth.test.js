import { test } from 'node:test';
import assert from 'node:assert/strict';
import { optionalAuth, isAdminRequest } from '../src/modules/shared/optionalAuth.js';

test('optionalAuth proceeds without user if no token provided', async () => {
  const req = { headers: {}, cookies: {} };
  let calledNext = false;
  await optionalAuth(req, {}, () => {
    calledNext = true;
  });
  assert.equal(calledNext, true);
  assert.equal(req.user, undefined);
  assert.equal(isAdminRequest(req), false);
});

test('optionalAuth proceeds gracefully with invalid or expired token without throwing error', async () => {
  const req = { headers: { authorization: 'Bearer invalid.token.value' }, cookies: {} };
  let calledNext = false;
  await optionalAuth(req, {}, () => {
    calledNext = true;
  });
  assert.equal(calledNext, true);
  assert.equal(req.user, undefined);
  assert.equal(isAdminRequest(req), false);
});

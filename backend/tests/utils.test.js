import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSlug } from '../src/utils/slug.js';
import { parsePagination, parseSort, escapeRegex } from '../src/utils/pagination.js';

test('toSlug normalises names to URL-safe slugs', () => {
  assert.equal(toSlug('Paracetamol IP / BP  (Grade A)'), 'paracetamol-ip-bp-grade-a');
  assert.equal(toSlug(''), '');
});

test('parsePagination clamps page and limit', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 12, skip: 0 });
  assert.deepEqual(parsePagination({ page: '3', limit: '500' }), { page: 3, limit: 100, skip: 200 });
  assert.deepEqual(parsePagination({ page: '-4', limit: 'x' }), { page: 1, limit: 12, skip: 0 });
});

test('parseSort only accepts allow-listed fields', () => {
  assert.equal(parseSort({ sort: 'name', order: 'asc' }, ['name']), 'name');
  assert.equal(parseSort({ sort: 'name' }, ['name']), '-name');
  assert.equal(parseSort({ sort: 'password' }, ['name']), '-createdAt');
});

test('escapeRegex neutralises regex metacharacters', () => {
  const re = new RegExp(escapeRegex('C9H8O4.*(aspirin)'));
  assert.ok(re.test('C9H8O4.*(aspirin)'));
  assert.ok(!re.test('C9H8O4XX(aspirin)'));
});

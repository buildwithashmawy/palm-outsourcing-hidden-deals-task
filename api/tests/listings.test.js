import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { load } from '../src/lib/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../../data/listings.json');

await load(DATA);
const app = createApp();

test('health reports listings count and ok=true', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.listings > 0);
  assert.ok(res.body.loadedAt);
});

test('unfiltered listings returns count, total, results', async () => {
  const res = await request(app).get('/api/listings');
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.total, 'number');
  assert.ok(Array.isArray(res.body.results));
  assert.ok(res.body.results.length <= 50);
});

test('minPrice filter excludes cheaper listings', async () => {
  const res = await request(app).get('/api/listings?minPrice=200000');
  assert.equal(res.status, 200);
  for (const l of res.body.results) {
    assert.ok(l.price >= 200000, `expected >=200000 got ${l.price}`);
  }
});

test('price_desc sort orders by price descending', async () => {
  const res = await request(app).get('/api/listings?sort=price_desc&limit=10');
  const prices = res.body.results.map((l) => l.price);
  for (let i = 1; i < prices.length; i += 1) {
    assert.ok(prices[i - 1] >= prices[i]);
  }
});

test('bad sort value returns 400 with issues', async () => {
  const res = await request(app).get('/api/listings?sort=banana');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'bad_request');
  assert.ok(res.body.issues?.length > 0);
});

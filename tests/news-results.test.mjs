import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNews } from '../src/lib/news/results.mjs';
const item = (id, category = 'world', region = '') => ({ url: `https://example.com/${id}`, title: `A distinct headline number ${id}`, summary: '', publishedAt: `2026-10-${String(id).padStart(2, '0')}T00:00:00Z`, category, region });
const options = { page: 1, pageSize: 2 };
test('deduplicates before sorting and paginates the same snapshot once', () => {
  const data = [item(1), item(2), item(3), { ...item(2), url: 'https://example.com/2?tracking=1' }];
  assert.deepEqual(selectNews(data, options).articles.map(a => a.url), ['https://example.com/3', 'https://example.com/2']);
  const second = selectNews(data, { ...options, page: 2 });
  assert.equal(second.total, 3);
  assert.deepEqual(second.articles.map(a => a.url), ['https://example.com/1']);
});
test('filters categories, regions, and query without unrelated fallback', () => {
  const data = [item(1), item(2, 'tech'), { ...item(3, 'india', 'IN'), summary: 'Climate update' }];
  assert.equal(selectNews(data, { ...options, category: 'tech' }).articles[0].category, 'tech');
  assert.equal(selectNews(data, { ...options, region: 'IN', query: 'climate' }).total, 1);
  assert.equal(selectNews(data, { ...options, region: 'IN', query: 'missing' }).total, 0);
});

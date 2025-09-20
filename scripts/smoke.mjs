#!/usr/bin/env node
// Lightweight smoke test for the Flagged Posts API.
// Run while dev server is up: `npm run dev` (in another terminal) then: `node scripts/smoke.mjs`
// Exits with code 1 if any assertion fails.

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function json(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} => ${text}`);
  }
  return res.json();
}

function assert(cond, message) {
  if (!cond) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

(async () => {
  console.log(`Running smoke tests against ${BASE}`);

  // 1. Basic list fetch
  const list1 = await json(await fetch(`${BASE}/api/posts`));
  assert(Array.isArray(list1.data) && list1.data.length > 0, 'GET /api/posts returns non-empty list');

  const first = list1.data[0];
  const originalStatus = first.status;

  // 2. Status filter
  const flagged = await json(await fetch(`${BASE}/api/posts?status=flagged`));
  assert(flagged.data.every(p => p.status === 'flagged'), 'Status filter (flagged) only returns flagged posts');

  // 3. Pagination (limit & cursor)
  const page1 = await json(await fetch(`${BASE}/api/posts?limit=3`));
  assert(page1.data.length === 3, 'limit=3 returns exactly 3 posts');
  if (page1.nextCursor) {
    const page2 = await json(await fetch(`${BASE}/api/posts?limit=3&cursor=${page1.nextCursor}`));
    const ids1 = new Set(page1.data.map(p => p.id));
    assert(page2.data.every(p => !ids1.has(p.id)), 'Second page has no overlapping IDs');
  } else {
    console.log('INFO: Only one page of data (nextCursor missing).');
  }

  // 4. Search filter (if text length > 5, pick a middle substring)
  if (first.text && first.text.length > 5) {
    const fragment = first.text.slice(1, 4).toLowerCase();
    const searchRes = await json(await fetch(`${BASE}/api/posts?search=${encodeURIComponent(fragment)}`));
    assert(
      searchRes.data.every(p => p.text.toLowerCase().includes(fragment)),
      'Search results include fragment in text'
    );
  } else {
    console.log('INFO: Skipping search test (text too short).');
  }

  // 5. PATCH status (toggle)
  const newStatus = originalStatus === 'flagged' ? 'under_review' : 'flagged';
  const patched = await json(await fetch(`${BASE}/api/posts/${first.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  }));
  assert(patched.status === newStatus, 'PATCH status updates post');

  // 6. Add tag
  const testTag = `smoke_tag_${Date.now()}`.toLowerCase();
  const withTag = await json(await fetch(`${BASE}/api/posts/${first.id}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag: testTag })
  }));
  assert(withTag.tags.includes(testTag), 'POST tag adds new tag');

  // 7. Delete tag (204)
  const delRes = await fetch(`${BASE}/api/posts/${first.id}/tags/${encodeURIComponent(testTag)}`, { method: 'DELETE' });
  assert(delRes.status === 204, 'DELETE tag returns 204');

  console.log('\nAll smoke tests passed.');
  process.exit(0);
})().catch(err => {
  console.error('Smoke test error:', err);
  process.exit(1);
});

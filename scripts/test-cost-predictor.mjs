import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const dir = mkdtempSync(join(tmpdir(), 'cost-predictor-test-'));
try {
  for (const name of ['pricing', 'handler']) {
    const source = readFileSync(`supabase/functions/cost-predictor/${name}.ts`, 'utf8').replace('./pricing.ts', './pricing.mjs');
    writeFileSync(join(dir, `${name}.mjs`), ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText);
  }
  const { createHandler } = await import(pathToFileURL(join(dir, 'handler.mjs')));
  const token = 'a'.repeat(64);
  const expiresAt = '2026-09-15T07:00:00Z';
  let grants = [{ tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt, label: 'Test club' }];
  let now = Date.parse(expiresAt) - 1;
  const handler = createHandler(() => JSON.stringify(grants), () => now);
  const request = (overrides = {}) => handler(new Request('https://example.test', {
    method: 'POST', body: JSON.stringify({ token, garment: 'tshirt', decoration: 'printing', quantity: 50, ...overrides }),
  }));
  let res = await request();
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await res.json(), { status: 'ok', expiresAt, label: 'Test club', unitPrice: 12, totalPrice: 600 });
  for (const [quantity, unitPrice] of [[20, 15], [49, 15], [50, 12], [79, 12], [80, 10], [99, 10], [100, 8.5], [149, 8.5], [150, 8], [199, 8]]) {
    const quote = await (await request({ quantity })).json();
    assert.equal(quote.unitPrice, unitPrice);
    assert.equal(quote.totalPrice, unitPrice * quantity);
    assert.equal('tier' in quote, false);
  }
  assert.equal((await (await request({ garment: 'hoodie', decoration: 'printing-embroidery' })).json()).unitPrice, 27);
  assert.equal((await (await request({ quantity: 19 })).json()).status, 'below-minimum');
  assert.equal((await (await request({ quantity: 200 })).json()).status, 'custom-quote');
  for (const input of [{ quantity: 20.5 }, { quantity: -1 }, { quantity: '50' }, { garment: '__proto__' }, { decoration: 'invalid' }]) {
    assert.equal((await request(input)).status, 400);
  }
  for (const badToken of [null, '', 'b'.repeat(64), token + 'b']) assert.equal((await request({ token: badToken })).status, 403);
  now++;
  res = await request();
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { status: 'expired' });
  now--;
  grants = [];
  assert.deepEqual(await (await request()).json(), { status: 'denied' });
  const brokenHandler = createHandler(() => 'not json');
  assert.equal((await brokenHandler(new Request('https://example.test', { method: 'POST', body: JSON.stringify({ token }) }))).status, 503);
  assert.equal((await handler(new Request('https://example.test'))).status, 405);
  assert.equal((await handler(new Request('https://example.test', { method: 'OPTIONS' }))).status, 200);
  console.log('PASS: price boundaries, private fields, invalid requests, exact expiry, revocation, fail-closed configuration and CORS.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

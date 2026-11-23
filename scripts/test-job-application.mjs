import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const dir = mkdtempSync(join(tmpdir(), 'job-application-test-'));
try {
  const source = readFileSync('supabase/functions/job-application/handler.ts', 'utf8');
  writeFileSync(join(dir, 'handler.mjs'), ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText);
  const { createHandler, renderNotification, JOB_SLUG, MAX_RESUME_BYTES } = await import(pathToFileURL(join(dir, 'handler.mjs')));

  const pdf = () => new File([Buffer.from('%PDF-1.7 resume')], '../../My Resume.pdf', { type: 'application/pdf' });
  const docx = () => new File([Buffer.from('PK\x03\x04[Content_Types].xml word/document.xml', 'latin1')], 'resume.docx');
  const valid = {
    jobSlug: JOB_SLUG, fullName: 'Asha Rahman', email: 'Asha@Example.com', location: 'Toronto',
    linkedinUrl: 'https://www.linkedin.com/in/asha', website: '',
  };
  const formOf = (fields = {}, resume = pdf()) => {
    const form = new FormData();
    for (const [key, value] of Object.entries({ ...valid, ...fields })) form.append(key, value);
    if (resume) form.append('resume', resume);
    return form;
  };
  const setup = ({ checkResult = 'ok', submitResult = 'created', ...overrides } = {}) => {
    const calls = { check: [], upload: [], remove: [], submit: [], notify: [] };
    const handler = createHandler({
      ipHashSecret: 'test-secret',
      check: async (app, hash) => { calls.check.push({ app, hash }); return checkResult; },
      upload: async (path, resume) => { calls.upload.push({ path, resume }); },
      remove: async (path) => { calls.remove.push(path); },
      submit: async (app, path, hash) => { calls.submit.push({ app, path, hash }); return submitResult; },
      notify: async (app, resume) => { calls.notify.push({ app, resume }); },
      ...overrides,
    });
    return { handler, calls };
  };
  const post = (handler, body, headers = {}) => handler(new Request('https://example.test', {
    method: 'POST', headers: { origin: 'https://www.formme.io', 'cf-connecting-ip': '203.0.113.9', ...headers }, body,
  }));

  let t = setup();
  let res = await post(t.handler, formOf());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(t.calls.submit[0].app.email, 'asha@example.com');
  assert.match(t.calls.submit[0].hash, /^[a-f0-9]{64}$/);
  assert.match(t.calls.upload[0].path, new RegExp(`^${JOB_SLUG}/[0-9a-f-]{36}\\.pdf$`));
  assert.equal(t.calls.upload[0].path.includes('Resume'), false);
  assert.equal(t.calls.notify.length, 1);
  assert.equal(t.calls.remove.length, 0);

  t = setup();
  assert.equal((await post(t.handler, formOf({}, docx()))).status, 200);
  assert.match(t.calls.upload[0].path, /\.docx$/);
  t = setup();
  assert.equal((await post(t.handler, formOf({ location: '', linkedinUrl: '' }))).status, 200);
  assert.equal(t.calls.submit[0].app.location, null);

  // Duplicates and rate limits never reach storage.
  t = setup({ checkResult: 'duplicate' });
  assert.deepEqual(await (await post(t.handler, formOf())).json(), { success: true });
  assert.equal(t.calls.upload.length + t.calls.notify.length, 0);
  t = setup({ checkResult: 'rate_limited' });
  assert.equal((await post(t.handler, formOf())).status, 429);
  assert.equal(t.calls.upload.length, 0);

  // Losing a concurrent race removes the uploaded file.
  t = setup({ submitResult: 'duplicate' });
  assert.equal((await post(t.handler, formOf())).status, 200);
  assert.deepEqual(t.calls.remove, [t.calls.upload[0].path]);
  assert.equal(t.calls.notify.length, 0);
  t = setup({ submitResult: 'rate_limited' });
  assert.equal((await post(t.handler, formOf())).status, 429);
  assert.equal(t.calls.remove.length, 1);

  t = setup();
  assert.equal((await post(t.handler, formOf(), { origin: 'https://evil.example' })).status, 403);
  assert.equal((await t.handler(new Request('https://example.test', { method: 'POST', body: formOf() }))).status, 403);
  assert.equal((await t.handler(new Request('https://example.test', { headers: { origin: 'https://www.formme.io' } }))).status, 405);
  assert.equal((await post(t.handler, JSON.stringify(valid), { 'content-type': 'application/json' })).status, 400);

  for (const bad of [
    { jobSlug: 'other' }, { fullName: 'x' }, { fullName: 'A\nBcc: x@y.z' }, { email: 'nope' }, { email: 'a@b.co\nx' },
    { linkedinUrl: 'javascript:alert(1)' }, { linkedinUrl: 'https://linkedin.com.evil.example/in/a' },
    { linkedinUrl: 'http://linkedin.com/in/a' }, { location: 'x'.repeat(121) },
  ]) assert.equal((await post(t.handler, formOf(bad))).status, 400, JSON.stringify(bad));

  for (const badFile of [
    null,
    new File([], 'empty.pdf'),
    new File(['<script>alert(1)</script>'], 'resume.pdf', { type: 'application/pdf' }),
    new File(['%PDF-1.7'], 'resume.exe'),
    new File(['%PDF-1.7'], 'resume.html', { type: 'application/pdf' }),
    new File(['PK\x03\x04 not a document'], 'resume.docx'),
    new File([Buffer.from('PK\x03\x04[Content_Types].xml word/document.xml word/vbaProject.bin', 'latin1')], 'resume.docx'),
  ]) assert.equal((await post(t.handler, formOf({}, badFile))).status, 400, badFile?.name ?? 'missing');

  const huge = new Uint8Array(MAX_RESUME_BYTES + 1);
  huge.set(Buffer.from('%PDF-'));
  assert.equal((await post(t.handler, formOf({}, new File([huge], 'huge.pdf')))).status, 413);
  assert.equal((await post(t.handler, formOf({}, new File([new Uint8Array(MAX_RESUME_BYTES * 2)], 'huge.pdf')))).status, 413);
  assert.equal(t.calls.upload.length, 0);

  res = await post(t.handler, formOf({ website: 'https://spam.example' }));
  assert.equal(res.status, 200);
  assert.equal(t.calls.check.length + t.calls.upload.length, 0);

  const quiet = console.error; console.error = () => {};
  t = setup({ notify: async () => { throw new Error('email down'); } });
  assert.equal((await post(t.handler, formOf())).status, 200);
  assert.equal(t.calls.remove.length, 0);
  t = setup({ submit: async () => { throw new Error('secret database detail'); } });
  res = await post(t.handler, formOf());
  console.error = quiet;
  assert.equal(res.status, 503);
  assert.equal((await res.text()).includes('secret'), false);
  assert.equal(t.calls.remove.length, 1);
  t = setup({ ipHashSecret: undefined });
  assert.equal((await post(t.handler, formOf())).status, 503);
  assert.equal(t.calls.upload.length, 0);

  const email = renderNotification({ ...valid, fullName: '<img src=x onerror=alert(1)>', location: '<script>x</script>' });
  assert.equal(email.html.includes('<img'), false);
  assert.equal(email.html.includes('<script'), false);
  console.log('job application handler tests passed');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

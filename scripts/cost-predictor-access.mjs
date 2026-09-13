import { randomBytes, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [command, file, value, expiresAt, baseUrl = 'https://www.formme.io'] = process.argv.slice(2);
if (!['issue', 'revoke'].includes(command) || !file || !value) {
  throw new Error('Usage: node scripts/cost-predictor-access.mjs issue /private/tmp/club-grants.env "Club name" 2026-09-15T07:00:00Z [site URL]\nOr: revoke /private/tmp/club-grants.env "Club name"');
}
const prefix = 'COST_PREDICTOR_GRANTS=';
const grants = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8').trim().slice(prefix.length)) : [];
if (command === 'revoke') {
  writeFileSync(file, prefix + JSON.stringify(grants.filter(g => g.label !== value)) + '\n', { mode: 0o600 });
  console.log('Grant removed locally. Apply the secrets file to revoke server access.');
} else {
  if (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) throw new Error('Expiry must be a future ISO timestamp.');
  const token = randomBytes(32).toString('hex');
  grants.push({ label: value, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt });
  writeFileSync(file, prefix + JSON.stringify(grants) + '\n', { mode: 0o600 });
  console.log(`${baseUrl.replace(/\/$/, '')}/cost-predictor#access=${token}`);
}

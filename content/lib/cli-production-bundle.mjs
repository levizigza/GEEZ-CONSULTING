import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadLocaleBundle } from './load.mjs';
import { applyProductionGate, listBlockedClaims } from './production-gate.mjs';
import { CONTENT_ROOT } from './load.mjs';

const locale = process.argv[2] || 'en';
const bundle = await loadLocaleBundle(locale);
const gated = applyProductionGate(bundle);
const blocked = listBlockedClaims(gated);

const outDir = path.join(CONTENT_ROOT, '.generated');
await mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `production-${locale}.json`);
await writeFile(outFile, JSON.stringify(gated, null, 2), 'utf8');

console.log(`Wrote ${outFile}`);
console.log(`Blocked claim fields: ${blocked.length}`);
if (blocked.length) {
  console.log(blocked.slice(0, 20));
}

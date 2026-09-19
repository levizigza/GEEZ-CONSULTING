import { readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

await access(path.join(root, 'jsconfig.json'));
await access(path.join(root, 'content/types/index.d.ts'));

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.generated'].includes(entry.name)) continue;
      await walk(full, acc);
    } else if (/\.(mjs|js)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

const files = [
  ...(await walk(path.join(root, 'content/lib'))),
  ...(await walk(path.join(root, 'design/lib'))),
  ...(await walk(path.join(root, 'design/js'))),
  ...(await walk(path.join(root, 'site'))),
];

let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed += 1;
    console.error(result.stderr || file);
  }
}

if (failed) {
  console.error(`Typecheck failed: ${failed} module(s)`);
  process.exit(1);
}

console.log(
  `Typecheck OK: jsconfig + content/types + node --check on ${files.length} modules (no TS runtime dependency)`,
);

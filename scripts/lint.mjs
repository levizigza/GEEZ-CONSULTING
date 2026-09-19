import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.generated') {
        continue;
      }
      await walk(full, acc);
    } else if (entry.name.endsWith('.mjs') || entry.name.endsWith('.js')) {
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
  ...(await walk(path.join(root, 'tests'))),
];

let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed += 1;
    console.error(result.stderr || `Syntax error in ${file}`);
  }
}

if (failed) {
  console.error(`Lint failed: ${failed} file(s) with syntax errors`);
  process.exit(1);
}

const validate = spawnSync('npm', ['run', 'validate'], {
  cwd: root,
  encoding: 'utf8',
  shell: true,
});
if (validate.status !== 0) {
  console.error(validate.stdout);
  console.error(validate.stderr);
  process.exit(1);
}

console.log(`Lint OK (${files.length} JS modules + content/route validate)`);

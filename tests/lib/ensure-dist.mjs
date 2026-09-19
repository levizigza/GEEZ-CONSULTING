/**
 * Shared dist reader for tests that race with parallel `site/build.mjs` runs
 * (build cleans `dist/` at start). Waits for in-flight builds; rebuilds on ENOENT.
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const lockPath = path.join(root, '.dist-build.lock');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(sab), 0, 0, ms);
}

/** Wait for an in-flight build lock to clear, then run a single build. */
export function runSiteBuild() {
  for (let i = 0; i < 100 && existsSync(lockPath); i += 1) {
    sleepSync(100);
  }
  const built = spawnSync(process.execPath, ['site/build.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

/**
 * @param {string} rel path under dist/
 * @param {{ attempts?: number }} [opts]
 */
export async function readDistFile(rel, { attempts = 4 } = {}) {
  const full = path.join(root, 'dist', rel);
  /** @type {unknown} */
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await readFile(full, 'utf8');
    } catch (err) {
      lastErr = err;
      const code = /** @type {NodeJS.ErrnoException} */ (err).code;
      if (code !== 'ENOENT' && code !== 'EPERM' && code !== 'EBUSY') throw err;
      // Wait for an in-flight build before starting another.
      for (let w = 0; w < 30; w += 1) {
        await sleep(100);
        if (existsSync(lockPath)) continue;
        try {
          return await readFile(full, 'utf8');
        } catch {
          /* keep waiting briefly */
        }
      }
      runSiteBuild();
    }
  }
  throw lastErr;
}

export async function ensureDist() {
  try {
    await access(path.join(root, 'dist', 'index.html'));
  } catch {
    runSiteBuild();
  }
  await readDistFile('index.html');
}

export { root as distRoot };

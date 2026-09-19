/**
 * Measure dist/ against design/perf-budget.json.
 * Exit 1 on budget breach.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepresentativePages } from '../design/lib/perf-audit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const budget = JSON.parse(
  await readFile(path.join(root, 'design/perf-budget.json'), 'utf8'),
);

const report = await auditRepresentativePages(dist, budget);
console.log(JSON.stringify(report.summary, null, 2));
if (report.violations.length) {
  console.error('Performance budget violations:');
  for (const v of report.violations) console.error(`- ${v}`);
  process.exit(1);
}
console.log('Performance budgets OK');

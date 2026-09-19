#!/usr/bin/env node
/**
 * Run WCAG 2.2 AA sample audit against dist/.
 * Usage: npm run build && node scripts/a11y-audit.mjs
 * Exit 1 on critical/serious structural or axe violations.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditSamplePages,
  collectHighIssues,
  A11Y_ROOT,
} from '../design/lib/a11y-audit.mjs';

const root = A11Y_ROOT;
const outDir = path.join(root, 'docs/geez-redesign/a11y-evidence');

const reports = await auditSamplePages();
const high = collectHighIssues(reports);

await mkdir(outDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const jsonPath = path.join(outDir, `axe-structural-${stamp}.json`);
await writeFile(
  jsonPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: 'Zero automated errors is not WCAG conformance. See accessibility-audit.md.',
      highIssueCount: high.length,
      high,
      reports,
    },
    null,
    2,
  ),
  'utf8',
);

console.log(`Audited ${reports.length} sample pages`);
console.log(`High issues: ${high.length}`);
for (const issue of high.slice(0, 40)) {
  console.log(`- [${issue.impact}] ${issue.page} · ${issue.source}/${issue.id}: ${issue.message}`);
}
if (high.length > 40) console.log(`…and ${high.length - 40} more`);
console.log(`Evidence: ${jsonPath}`);

process.exit(high.length ? 1 : 0);

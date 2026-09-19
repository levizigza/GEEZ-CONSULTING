#!/usr/bin/env node
/**
 * Generate translation work queue (JSON + markdown). Never invents translations.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditLocaleCompleteness,
  writeTranslationQueueJson,
} from './locale-completeness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @param {Awaited<ReturnType<typeof auditLocaleCompleteness>>} audit
 */
function toMarkdown(audit) {
  const lines = [
    '# Translation work queue',
    '',
    `Generated: ${audit.generatedAt}`,
    '',
    `Policy: ${audit.policy}`,
    '',
    '## Summary by locale',
    '',
    '| Locale | Incomplete | Blocked on EN |',
    '| --- | ---: | ---: |',
  ];
  for (const [locale, counts] of Object.entries(audit.byLocale)) {
    lines.push(
      `| ${locale} | ${counts.incomplete} | ${counts.blocked} |`,
    );
  }
  lines.push(
    '',
    '## Queue',
    '',
    '| ID | Locale | Surface | Source string | Context | Char limit | Reviewer | Status | Last reviewed |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const row of audit.items) {
    const source = String(row.sourceString || '')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ')
      .slice(0, 120);
    const context = String(row.context || '')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ')
      .slice(0, 160);
    lines.push(
      `| ${row.id} | ${row.locale} | ${row.surface} | ${source} | ${context} | ${
        row.charConstraint ?? '—'
      } | ${row.reviewer} | ${row.status} | ${row.lastReviewed ?? '—'} |`,
    );
  }
  lines.push(
    '',
    '## Notes',
    '',
    '- Do **not** machine-fill production translations.',
    '- Incomplete AM/TI routes stay draft/`noindex` until native approval.',
    '- Founder biography must be native per locale — never paste EN into AM/TI.',
    '- See `docs/geez-redesign/localization-qa.md` for the native-review checklist.',
    '',
  );
  return lines.join('\n');
}

async function main() {
  const audit = await auditLocaleCompleteness();
  const jsonPath = await writeTranslationQueueJson(audit);
  const mdDir = path.join(root, 'docs/geez-redesign');
  await mkdir(mdDir, { recursive: true });
  const mdPath = path.join(mdDir, 'translation-work-queue.md');
  await writeFile(mdPath, toMarkdown(audit), 'utf8');
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log(
    `Items: ${audit.items.length} (am incomplete=${audit.byLocale.am?.incomplete ?? 0}, ti incomplete=${audit.byLocale.ti?.incomplete ?? 0})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

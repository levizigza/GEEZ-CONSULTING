/**
 * Generate AM/TI article stubs: pending translation for new outlines;
 * legacy entries keep translationOf + pending_translation.
 */
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const en = JSON.parse(
  await readFile(path.join(root, 'content/data/locales/en/articles.json'), 'utf8'),
);

const todo = (notes) => ({
  value: null,
  source: 'TODO_VERIFICATION',
  approvalStatus: 'todo_verification',
  lastReviewed: null,
  ledgerId: 'CL-009',
  ...(notes ? { notes } : {}),
});

const person = () => ({ name: todo(), role: todo() });

function stubFromEn(item, locale, slugOverride, legacyUrl) {
  return {
    id: `${item.id}-${locale}`,
    slug: slugOverride || item.slug,
    locale,
    translationOf: item.id,
    legacyWpUrl: legacyUrl || null,
    recordStatus: 'draft',
    localeStatus: 'pending_translation',
    topics: item.topics,
    disclaimerCategory: item.disclaimerCategory,
    relatedServiceId: item.relatedServiceId,
    roadmapAction: item.roadmapAction || 'new',
    roadmapNotes: `Translate after EN outline/article approved. Do not publish English body as ${locale}.`,
    title: todo(`Native ${locale} title required`),
    excerpt: todo(`Native ${locale} excerpt required`),
    author: person(),
    reviewer: person(),
    datePublished: todo(),
    dateModified: todo(),
    cta: { label: 'Book a Fit Call', href: '/book-a-fit-call/' },
    citations: [],
    showToc: true,
    downloads: [],
    sections: [
      {
        id: 'translation-pending',
        heading: 'Translation pending',
        items: [
          {
            text: 'EN outline exists; native translation not started. Keep noindex until approved.',
            sourceNeeded: false,
          },
        ],
      },
    ],
  };
}

const legacySlugAm = {
  'article-how-to-name-your-business': 'how-to-name-your-business-2',
  'article-credit-financial-situation':
    'steps-to-improve-your-credit-and-financial-situation-2',
  'article-partnerships': 'unlocking-the-power-of-partnerships-for-your-small-business-2',
};
const legacySlugTi = {
  'article-how-to-name-your-business': 'how-to-name-your-business-3',
  'article-credit-financial-situation':
    'steps-to-improve-your-credit-and-financial-situation-3',
  'article-partnerships': 'unlocking-the-power-of-partnerships-for-your-small-business-3',
};

const legacyUrlAm = {
  'article-how-to-name-your-business':
    'https://geezconsulting.com/am/how-to-name-your-business-2/',
  'article-credit-financial-situation':
    'https://geezconsulting.com/am/steps-to-improve-your-credit-and-financial-situation-2/',
  'article-partnerships':
    'https://geezconsulting.com/am/unlocking-the-power-of-partnerships-for-your-small-business-2/',
};
const legacyUrlTi = {
  'article-how-to-name-your-business':
    'https://geezconsulting.com/ti/how-to-name-your-business-3/',
  'article-credit-financial-situation':
    'https://geezconsulting.com/ti/steps-to-improve-your-credit-and-financial-situation-3/',
  'article-partnerships':
    'https://geezconsulting.com/ti/unlocking-the-power-of-partnerships-for-your-small-business-3/',
};

for (const locale of ['am', 'ti']) {
  const map = locale === 'am' ? legacySlugAm : legacySlugTi;
  const urls = locale === 'am' ? legacyUrlAm : legacyUrlTi;
  const items = en.items.map((item) =>
    stubFromEn(item, locale, map[item.id] || undefined, urls[item.id]),
  );
  const out = path.join(root, `content/data/locales/${locale}/articles.json`);
  await writeFile(
    out,
    `${JSON.stringify({ schemaVersion: '1.0.0', items }, null, 2)}\n`,
    'utf8',
  );
  console.log('Wrote', items.length, locale, 'stubs');
}

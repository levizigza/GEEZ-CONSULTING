import { loadLocaleBundle, validateBundle, validateSamplesAreNonProduction } from './load.mjs';

const locales = ['en', 'am', 'ti'];

/** @type {string[]} */
const allErrors = [];

for (const locale of locales) {
  const bundle = await loadLocaleBundle(locale);
  const errors = validateBundle(bundle);
  for (const e of errors) allErrors.push(`[${locale}] ${e}`);
}

const sampleErrors = await validateSamplesAreNonProduction();
allErrors.push(...sampleErrors.map((e) => `[samples] ${e}`));

if (allErrors.length) {
  console.error('Content validation failed:\n' + allErrors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}

console.log(`Content validation OK for locales: ${locales.join(', ')}`);

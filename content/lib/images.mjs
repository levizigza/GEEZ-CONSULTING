/**
 * Responsive image helpers: AVIF/WebP candidates, dimensions, lazy/eager.
 * Never invents alt text. Placeholders prevent CLS when media is pending.
 */

import { resolveImageAlt } from './seo.mjs';

/**
 * @typedef {{
 *   src: string,
 *   width: number,
 *   height: number,
 *   alt?: string | null,
 *   sources?: { type: string, srcset: string, sizes?: string }[],
 *   sizes?: string,
 *   srcset?: string,
 *   priority?: boolean,
 *   className?: string,
 * }} ImageCandidate
 */

/**
 * Stable aspect-ratio placeholder (no layout shift).
 * @param {{ width: number, height: number, label: string, className?: string }} opts
 * @param {(s: string) => string} escapeHtml
 */
export function renderMediaPlaceholder(opts, escapeHtml) {
  const e = escapeHtml;
  const ratio = `${opts.width} / ${opts.height}`;
  return `<div class="${e(opts.className || 'geez-media-ph')}" role="img" aria-label="${e(
    opts.label,
  )}" style="aspect-ratio:${e(ratio)};width:100%"></div>`;
}

/**
 * Render a responsive <picture> or <img> with explicit dimensions.
 * @param {ImageCandidate} image
 * @param {(s: string) => string} escapeHtml
 */
export function renderResponsiveImage(image, escapeHtml) {
  const e = escapeHtml;
  const altInfo = resolveImageAlt(image.alt);
  if (altInfo.omitUntilVerified) {
    return renderMediaPlaceholder(
      {
        width: image.width,
        height: image.height,
        label: 'Image pending verification',
        className: image.className || 'geez-media-ph',
      },
      escapeHtml,
    );
  }
  const alt = altInfo.decorative ? '' : altInfo.alt || '';
  const loading = image.priority ? 'eager' : 'lazy';
  const fetchpriority = image.priority ? ' fetchpriority="high"' : '';
  const classAttr = image.className ? ` class="${e(image.className)}"` : '';
  const sizes = image.sizes ? ` sizes="${e(image.sizes)}"` : '';
  const srcset = image.srcset ? ` srcset="${e(image.srcset)}"` : '';

  const img = `<img${classAttr} src="${e(image.src)}" alt="${e(alt)}" width="${image.width}" height="${image.height}" loading="${loading}" decoding="async"${fetchpriority}${srcset}${sizes}>`;

  const sources = Array.isArray(image.sources) ? image.sources : [];
  if (!sources.length) return img;

  const sourceTags = sources
    .map((s) => {
      const sz = s.sizes ? ` sizes="${e(s.sizes)}"` : sizes;
      return `<source type="${e(s.type)}" srcset="${e(s.srcset)}"${sz}>`;
    })
    .join('\n');

  return `<picture>
  ${sourceTags}
  ${img}
</picture>`;
}

/**
 * Build AVIF/WebP/JPEG candidate set from a base path convention:
 * `/media/hero.jpg` → `/media/hero.avif`, `.webp`, `.jpg`
 * @param {{
 *   basePath: string,
 *   width: number,
 *   height: number,
 *   alt?: string | null,
 *   widths?: number[],
 *   priority?: boolean,
 *   className?: string,
 *   sizes?: string,
 * }} opts
 * @returns {ImageCandidate}
 */
export function buildImageCandidates(opts) {
  const widths = opts.widths || [640, 960, 1200];
  const extMatch = opts.basePath.match(/\.(jpe?g|png)$/i);
  const stem = extMatch
    ? opts.basePath.slice(0, -extMatch[0].length)
    : opts.basePath;
  const fallbackExt = extMatch ? extMatch[0] : '.jpg';

  /**
   * @param {string} ext
   */
  function srcsetFor(ext) {
    return widths
      .map((w) => `${stem}-${w}${ext} ${w}w`)
      .join(', ');
  }

  return {
    src: `${stem}-${widths[widths.length - 1]}${fallbackExt}`,
    width: opts.width,
    height: opts.height,
    alt: opts.alt,
    priority: Boolean(opts.priority),
    className: opts.className,
    sizes: opts.sizes || '(max-width: 48rem) 100vw, 720px',
    srcset: srcsetFor(fallbackExt),
    sources: [
      { type: 'image/avif', srcset: srcsetFor('.avif'), sizes: opts.sizes },
      { type: 'image/webp', srcset: srcsetFor('.webp'), sizes: opts.sizes },
    ],
  };
}

/**
 * Site base path for project GitHub Pages (e.g. /GEEZ-CONSULTING).
 * Empty string for root hosting / localhost.
 */
export function getBasePath() {
  const raw = process.env.BASE_PATH || process.env.SITE_BASE_PATH || '';
  if (!raw || raw === '/') return '';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, '');
}

/**
 * Prefix an absolute site path with the configured base path.
 * @param {string} path absolute path starting with / (or /#hash)
 */
export function withBase(path) {
  const base = getBasePath();
  if (!base) return path;
  if (!path.startsWith('/')) {
    throw new Error(`Path must start with /: ${path}`);
  }
  if (path.startsWith('/#')) return `${base}${path}`;
  if (path === '/') return `${base}/`;
  return `${base}${path}`;
}

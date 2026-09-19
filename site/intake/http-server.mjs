/**
 * Local intake HTTP server: static dist + Fit Call API + finder GET re-render.
 * Production WP mapping is documented in docs/geez-redesign/intake-data-flow.md.
 */

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createIntakeHandler, createMemoryProvider } from './submit-handler.mjs';
import {
  renderServiceFinderPage,
  renderFitFormPage,
  renderThankYouPage,
  parseFinderAnswers,
} from './render.mjs';
import { loadLocaleBundle, readDataJson } from '../../content/lib/load.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @param {object} [opts]
 * @param {import('./submit-handler.mjs').IntakeProvider} [opts.provider]
 * @param {string} [opts.distDir]
 * @param {(e: object) => void} [opts.onLog]
 */
export function createIntakeServer(opts = {}) {
  const distDir = opts.distDir || path.join(root, 'dist');
  const provider = opts.provider || createMemoryProvider();
  const logs = [];
  const onLog =
    opts.onLog ||
    ((event) => {
      logs.push(event);
    });
  const intake = createIntakeHandler({ provider, onLog });

  const server = http.createServer(async (req, res) => {
    try {
      await route(req, res, { distDir, intake, provider });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      onLog({ type: 'server_error', error: 'unhandled' });
    }
  });

  return {
    server,
    provider,
    logs,
    intake,
    listen(port = 0) {
      return new Promise((resolve) => {
        server.listen(port, '127.0.0.1', () => {
          const addr = server.address();
          resolve({
            port: typeof addr === 'object' && addr ? addr.port : port,
            baseUrl: `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : port}`,
          });
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {object} ctx
 */
async function route(req, res, ctx) {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const secure =
    req.headers['x-forwarded-proto'] === 'https' ||
    url.protocol === 'https:';

  if (req.method === 'POST' && url.pathname === '/api/fit-call/') {
    const raw = await readBody(req);
    let data;
    const type = String(req.headers['content-type'] || '');
    if (type.includes('application/json')) {
      data = JSON.parse(raw || '{}');
    } else {
      data = Object.fromEntries(new URLSearchParams(raw));
    }
    const clientKey =
      String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local')
        .split(',')[0]
        .trim();
    const result = await ctx.intake.handle(data, {
      clientKey,
      requireHttps: false,
      secureTransport: true,
    });
    res.writeHead(result.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(result.body));
    return;
  }

  if (req.method === 'POST' && /\/book-a-fit-call\/?$/.test(url.pathname)) {
    const raw = await readBody(req);
    const data = Object.fromEntries(new URLSearchParams(raw));
    const locale = localeFromPath(url.pathname);
    data.locale = data.locale || locale;
    const result = await ctx.intake.handle(data, {
      clientKey: 'form-post',
      secureTransport: true,
    });
    if (result.body.ok) {
      res.writeHead(303, {
        Location: result.body.redirectTo,
        'Cache-Control': 'no-store',
      });
      res.end();
      return;
    }
    const navigation = await readDataJson('shared/navigation.json');
    const bundle = await loadLocaleBundle(locale);
    const html = renderFitFormPage(locale, bundle.ui, navigation, {
      values: result.body.values || data,
      errors: result.body.errors || [],
      status: result.body.retry ? 'retry' : undefined,
    });
    res.writeHead(result.status === 429 ? 429 : 400, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && /\/find-your-service\/?$/.test(url.pathname)) {
    const locale = localeFromPath(url.pathname);
    const navigation = await readDataJson('shared/navigation.json');
    const bundle = await loadLocaleBundle(locale);
    const answers = parseFinderAnswers(url.searchParams);
    const hasAny = [...url.searchParams.keys()].length > 0;
    const html = renderServiceFinderPage(locale, bundle.ui, navigation, {
      answers: hasAny ? answers : {},
    });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && /\/book-a-fit-call\/?$/.test(url.pathname)) {
    const locale = localeFromPath(url.pathname);
    const navigation = await readDataJson('shared/navigation.json');
    const bundle = await loadLocaleBundle(locale);
    const html = renderFitFormPage(locale, bundle.ui, navigation);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && /\/thank-you\/?$/.test(url.pathname)) {
    const locale = localeFromPath(url.pathname);
    const navigation = await readDataJson('shared/navigation.json');
    const bundle = await loadLocaleBundle(locale);
    const html = renderThankYouPage(locale, bundle.ui, navigation);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    });
    res.end(html);
    return;
  }

  // Assets: prefer dist, fall back to source trees for e2e without a prior build
  if (url.pathname.startsWith('/assets/')) {
    const name = url.pathname.slice('/assets/'.length);
    const candidates = [
      path.join(ctx.distDir, 'assets', name),
      path.join(root, 'site/intake', name),
      path.join(root, 'design/css', name),
      path.join(root, 'site/services', name),
      path.join(root, 'site/homepage', name),
      path.join(root, 'site/client-results', name),
    ];
    for (const filePath of candidates) {
      try {
        const buf = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType(filePath) });
        res.end(buf);
        return;
      } catch {
        /* try next */
      }
    }
  }

  // Static files from dist
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  if (rel === '') rel = '/index.html';
  const filePath = path.join(ctx.distDir, rel.replace(/^\//, ''));
  if (!filePath.startsWith(ctx.distDir)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const buf = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(buf);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

/**
 * @param {import('node:http').IncomingMessage} req
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * @param {string} pathname
 */
function localeFromPath(pathname) {
  if (pathname.startsWith('/am/')) return 'am';
  if (pathname.startsWith('/ti/')) return 'ti';
  return 'en';
}

/**
 * @param {string} filePath
 */
function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
    return 'text/javascript; charset=utf-8';
  }
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

/** CLI: node site/intake/http-server.mjs */
const isCli =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isCli) {
  const app = createIntakeServer();
  const { baseUrl } = await app.listen(Number(process.env.PORT) || 4173);
  console.log(`Intake server listening at ${baseUrl}`);
}

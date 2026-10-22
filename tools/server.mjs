// Local stand-in for Netlify: serves the site and the admin portal, and runs
// the same API as netlify/functions/api.mjs (routes in tools/api.mjs). No
// dependencies:
//
//   node tools/server.mjs                 → http://localhost:4321 (local git commits)
//   ADMIN_PASSWORD=… node tools/server.mjs        require a password to sign in
//   GITHUB_TOKEN=… GITHUB_REPO=owner/name node tools/server.mjs   commit on GitHub
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi, makeBackend } from './api.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4321;
const env = process.env;
const backend = makeBackend(env, ROOT);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf', '.md': 'text/plain; charset=utf-8' };

const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((ok, fail) => {
  let n = 0; const chunks = [];
  req.on('data', (c) => { n += c.length; if (n > 40 * 1024 * 1024) { fail(new Error('request too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { ok(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { fail(new Error('invalid JSON')); } });
});

async function file(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const abs = path.join(ROOT, p);
  // same files hidden as in netlify.toml
  if (!abs.startsWith(ROOT + path.sep) || /(^|\/)\.(git|env)/.test(p) || /^\/(tools|netlify|design-options)\//.test(p)) { res.writeHead(404); return res.end(); }
  try {
    const data = await fs.readFile(abs);
    res.writeHead(200, { 'content-type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream', 'cache-control': /^\/(content|admin)\//.test(p) ? 'no-cache' : 'max-age=60' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) {
      const body = req.method === 'POST' ? await readBody(req) : {};
      const [status, json] = await handleApi({ method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), body, auth: req.headers.authorization || '' }, { backend, env });
      send(res, status, json);
    } else if (req.method === 'GET' || req.method === 'HEAD') await file(req, res, url);
    else { res.writeHead(405); res.end(); }
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}).listen(PORT, () => console.log(`MUGI site  http://localhost:${PORT}/\nAdmin      http://localhost:${PORT}/admin/   (publishing: ${backend.mode})`));

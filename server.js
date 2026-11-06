// Serves the eye tracker and stores saved recordings. Browsers only allow webcam
// access on secure origins, and WebGazer expects the hostname "localhost".
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const store = require('./db');

const PORT = Number(process.env.PORT) || 4321;
const HOST = 'localhost';
const MAX_BODY_BYTES = 300 * 1024 * 1024;
const CALIBRATION_LOG = path.join(__dirname, 'data/calibration-log.jsonl');

const ROUTES = [
  ['/vendor/webgazer/', path.join(__dirname, 'node_modules/webgazer/dist')],
  ['/', path.join(__dirname, 'public')],
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.wasm': 'application/wasm',
};

function resolveFile(urlPath) {
  const [prefix, root] = ROUTES.find(([route]) => urlPath.startsWith(route));
  const relative = urlPath.slice(prefix.length);
  const file = path.resolve(root, !relative || relative.endsWith('/') ? `${relative}index.html` : relative);
  return file.startsWith(root + path.sep) ? file : null;
}

function serveFile(pathname, res) {
  const file = resolveFile(pathname);
  if (!file) {
    res.writeHead(400).end('Bad request');
    return;
  }

  const stream = fs.createReadStream(file);
  stream.on('open', () => {
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    stream.pipe(res);
  });
  stream.on('error', () => res.writeHead(404).end('Not found'));
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': MIME_TYPES['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new store.ValidationError('The session is too large to save.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new store.ValidationError('The session could not be read.'));
      }
    });
  });
}

async function handleApi(req, res, pathname) {
  // Only this page may reach the API: other sites can't send a matching Host header,
  // and can't send a JSON body or DELETE to localhost without a preflight we never answer.
  if (req.headers.host !== `${HOST}:${PORT}`) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  if (pathname === '/api/sessions' && req.method === 'GET') {
    sendJson(res, 200, store.listSessions());
    return;
  }

  if (pathname === '/api/sessions' && req.method === 'POST') {
    if (!(req.headers['content-type'] || '').startsWith('application/json')) {
      sendJson(res, 415, { error: 'Expected JSON' });
      return;
    }
    sendJson(res, 201, { id: store.saveSession(await readJson(req)) });
    return;
  }

  // One line per calibration, as numbers only, for tuning the tracker on real runs.
  if (pathname === '/api/calibration-log' && req.method === 'POST') {
    if (!(req.headers['content-type'] || '').startsWith('application/json')) {
      sendJson(res, 415, { error: 'Expected JSON' });
      return;
    }
    fs.mkdirSync(path.dirname(CALIBRATION_LOG), { recursive: true });
    fs.appendFileSync(CALIBRATION_LOG, `${JSON.stringify(await readJson(req))}\n`);
    sendJson(res, 201, { ok: true });
    return;
  }

  const sessionMatch = pathname.match(/^\/api\/sessions\/(\d+)$/);
  if (sessionMatch && req.method === 'DELETE') {
    const deleted = store.deleteSession(Number(sessionMatch[1]));
    sendJson(res, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Session not found' });
    return;
  }

  const imageMatch = pathname.match(/^\/api\/images\/(\d+)$/);
  if (imageMatch && req.method === 'GET') {
    const png = store.getImagePng(Number(imageMatch[1]));
    if (!png) {
      sendJson(res, 404, { error: 'Image not found' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'image/png', 'X-Content-Type-Options': 'nosniff' });
    res.end(png);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname).catch((error) => {
      const known = error instanceof store.ValidationError;
      if (!known) console.error(error);
      if (!res.headersSent) sendJson(res, known ? 400 : 500, { error: known ? error.message : 'The server hit an error.' });
    });
    return;
  }
  serveFile(pathname, res);
});

server.on('error', (error) => {
  if (error.code !== 'EADDRINUSE') throw error;
  console.error(`Port ${PORT} is already in use. The eye tracker may already be running: try http://${HOST}:${PORT}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Eye tracker running at http://${HOST}:${PORT}`);
});

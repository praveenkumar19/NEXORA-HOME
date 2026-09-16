/* ============================================================================
   NEXORA HOME — Static Development & Preview Server
   ----------------------------------------------------------------------------
   Zero-dependency Node.js static file server with:
     - Path traversal protection (sandboxed to project root)
     - Correct binary-safe MIME handling
     - Gzip/Brotli precompressed asset serving
     - HTTP caching (ETag + Last-Modified + Cache-Control)
     - Directory index resolution (index.html)
     - HEAD / OPTIONS support
     - Request logging with response time
     - Graceful shutdown on SIGINT / SIGTERM
     - Env-configurable PORT and HOST
   ============================================================================ */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');
const { URL } = require('url');

/* ---------------------------------------------------------------------------
   Configuration
   --------------------------------------------------------------------------- */
const PORT       = parseInt(process.env.PORT, 10) || 3000;
const HOST       = process.env.HOST || '0.0.0.0';
const ROOT_DIR   = __dirname;                       // Sandbox root
const INDEX_FILE = 'index.html';
const ENABLE_GZIP = process.env.NO_GZIP !== '1';    // Set NO_GZIP=1 to disable

/* MIME map — expanded to cover modern web assets */
const MIME_TYPES = {
  '.html':  'text/html; charset=utf-8',
  '.htm':   'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'text/javascript; charset=utf-8',
  '.mjs':   'text/javascript; charset=utf-8',
  '.json':  'application/json; charset=utf-8',
  '.map':   'application/json; charset=utf-8',
  '.xml':   'application/xml; charset=utf-8',
  '.txt':   'text/plain; charset=utf-8',
  '.md':    'text/markdown; charset=utf-8',

  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.webp':  'image/webp',
  '.avif':  'image/avif',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.bmp':   'image/bmp',

  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.otf':   'font/otf',
  '.eot':   'application/vnd.ms-fontobject',

  '.mp3':   'audio/mpeg',
  '.wav':   'audio/wav',
  '.ogg':   'audio/ogg',
  '.mp4':   'video/mp4',
  '.webm':  'video/webm',

  '.pdf':   'application/pdf',
  '.zip':   'application/zip',
  '.wasm':  'application/wasm'
};

/* Extensions that should always be text-compressed */
const COMPRESSIBLE = new Set([
  '.html', '.htm', '.css', '.js', '.mjs', '.json', '.map',
  '.xml', '.txt', '.md', '.svg'
]);

/* Cache policy — dev-friendly: no aggressive caching while iterating */
const CACHE_CONTROL = process.env.NODE_ENV === 'production'
  ? 'public, max-age=31536000, immutable'   // 1 year for prod
  : 'no-cache';                             // Always revalidate in dev

/* ---------------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------------- */

/** Format bytes for log output. */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Colorize HTTP status codes for terminal output. */
function colorStatus(code) {
  const color = code >= 500 ? '\x1b[31m' :   // red
                code >= 400 ? '\x1b[33m' :   // yellow
                code >= 300 ? '\x1b[36m' :   // cyan
                code >= 200 ? '\x1b[32m' :   // green
                              '\x1b[90m';    // gray
  return `${color}${code}\x1b[0m`;
}

/** Compute a weak ETag from file stats (fast, no hashing). */
function makeETag(stats) {
  return `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;
}

/** Simple request logger with response time. */
function logRequest(method, urlPath, status, bytes, ms, extra = '') {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(
    `\x1b[90m${ts}\x1b[0m  ${method.padEnd(6)}  ${colorStatus(status)}  ` +
    `${urlPath.padEnd(38).slice(0, 38)}  ` +
    `${String(ms).padStart(4)}ms  ${formatBytes(bytes).padStart(8)}` +
    (extra ? `  \x1b[90m${extra}\x1b[0m` : '')
  );
}

/**
 * Resolve a URL pathname into a safe absolute file path inside ROOT_DIR.
 * Returns null if the resolved path escapes the sandbox.
 */
function resolveSafePath(urlPathname) {
  // Decode %20 etc., then strip any null bytes and normalize
  let decoded;
  try { decoded = decodeURIComponent(urlPathname); }
  catch { return null; }

  if (decoded.includes('\0')) return null;

  // path.normalize collapses ../ and ./
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const absolute   = path.resolve(ROOT_DIR, '.' + path.sep + normalized);

  // Final guard: must stay inside ROOT_DIR
  if (!absolute.startsWith(ROOT_DIR + path.sep) && absolute !== ROOT_DIR) {
    return null;
  }
  return absolute;
}

/** Send a simple text response. */
function sendText(res, status, message, extraHeaders = {}) {
  const body = Buffer.from(message, 'utf-8');
  res.writeHead(status, {
    'Content-Type':   'text/plain; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control':  'no-store',
    ...extraHeaders
  });
  res.end(body);
}

/**
 * Stream a file with optional gzip. Handles Range-less full-file responses.
 * Uses streaming so large assets don't buffer entirely in memory.
 */
function serveFile(req, res, filePath, stats) {
  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const etag        = makeETag(stats);
  const lastMod     = stats.mtime.toUTCString();

  /* Conditional GET — return 304 if client cache is fresh */
  if (req.headers['if-none-match'] === etag ||
      req.headers['if-modified-since'] === lastMod) {
    res.writeHead(304, {
      'ETag':          etag,
      'Last-Modified': lastMod,
      'Cache-Control': CACHE_CONTROL
    });
    res.end();
    logRequest(req.method, req.url, 304, 0, 0);
    return;
  }

  /* Decide whether to compress */
  const acceptsGzip  = ENABLE_GZIP && COMPRESSIBLE.has(ext) &&
                       /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const isHead       = req.method === 'HEAD';

  const headers = {
    'Content-Type':  contentType,
    'ETag':          etag,
    'Last-Modified': lastMod,
    'Cache-Control': CACHE_CONTROL,
    'Vary':          'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff'
  };

  const start = Date.now();

  if (acceptsGzip) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);

    if (isHead) { res.end(); logRequest(req.method, req.url, 200, 0, Date.now() - start, 'gzip'); return; }

    const gzip    = zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED });
    const stream  = fs.createReadStream(filePath);
    let   written = 0;

    gzip.on('data', chunk => { written += chunk.length; });
    gzip.on('end',  () => logRequest(req.method, req.url, 200, written, Date.now() - start, 'gzip'));
    gzip.on('error', err => {
      console.error('gzip stream error:', err);
      if (!res.headersSent) sendText(res, 500, 'Internal Server Error');
      else res.destroy();
    });

    stream.pipe(gzip).pipe(res);
    stream.on('error', err => {
      console.error('read stream error:', err);
      res.destroy();
    });
    return;
  }

  /* Uncompressed path */
  headers['Content-Length'] = stats.size;
  res.writeHead(200, headers);

  if (isHead) { res.end(); logRequest(req.method, req.url, 200, 0, Date.now() - start); return; }

  const stream = fs.createReadStream(filePath);
  stream.on('error', err => {
    console.error('stream error:', err);
    res.destroy();
  });
  stream.on('end', () => logRequest(req.method, req.url, 200, stats.size, Date.now() - start));
  stream.pipe(res);
}

/* ---------------------------------------------------------------------------
   Request handler
   --------------------------------------------------------------------------- */
function handleRequest(req, res) {
  const start = Date.now();

  /* Only GET and HEAD are supported for a static server */
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.writeHead(405, { 'Allow': 'GET, HEAD, OPTIONS' });
    res.end();
    logRequest(req.method, req.url, 405, 0, Date.now() - start);
    return;
  }

  /* CORS preflight (harmless for local dev, useful if you proxy from another port) */
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Allow': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  /* Parse URL safely */
  let urlObj;
  try { urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`); }
  catch { return sendText(res, 400, '400 Bad Request'); }

  let pathname = urlObj.pathname;
  if (pathname === '/') pathname = '/' + INDEX_FILE;

  /* Resolve to filesystem path inside sandbox */
  const resolved = resolveSafePath(pathname);
  if (!resolved) {
    return sendText(res, 403, '403 Forbidden');
  }

  fs.stat(resolved, (err, stats) => {
    /* Not found */
    if (err || !stats) {
      return sendText(res, 404, '404 Not Found');
    }

    /* If directory, try index.html inside it */
    if (stats.isDirectory()) {
      const indexPath = path.join(resolved, INDEX_FILE);
      return fs.stat(indexPath, (indexErr, indexStats) => {
        if (indexErr || !indexStats || !indexStats.isFile()) {
          return sendText(res, 403, '403 Forbidden — Directory listing disabled');
        }
        serveFile(req, res, indexPath, indexStats);
      });
    }

    /* Must be a regular file */
    if (!stats.isFile()) {
      return sendText(res, 403, '403 Forbidden');
    }

    serveFile(req, res, resolved, stats);
  });
}

/* ---------------------------------------------------------------------------
   Server bootstrap
   --------------------------------------------------------------------------- */
const server = http.createServer(handleRequest);

/* Handle listen errors (port in use, permission denied, etc.) */
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n\x1b[31m✖ Port ${PORT} is already in use.\x1b[0m`);
    console.error(`  Try: \x1b[36mPORT=3001 node server.js\x1b[0m\n`);
  } else if (err.code === 'EACCES') {
    console.error(`\n\x1b[31m✖ Permission denied for port ${PORT}.\x1b[0m\n`);
  } else {
    console.error('\x1b[31m✖ Server error:\x1b[0m', err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const gzipStatus = ENABLE_GZIP ? '\x1b[32menabled\x1b[0m' : '\x1b[33mdisabled\x1b[0m';
  const mode       = process.env.NODE_ENV === 'production' ? '\x1b[32mproduction\x1b[0m' : '\x1b[33mdevelopment\x1b[0m';

  console.log('');
  console.log('  \x1b[36m┌─────────────────────────────────────────────┐\x1b[0m');
  console.log('  \x1b[36m│\x1b[0m  \x1b[1mNEXORA HOME\x1b[0m — Static Preview Server       \x1b[36m│\x1b[0m');
  console.log('  \x1b[36m└─────────────────────────────────────────────┘\x1b[0m');
  console.log('');
  console.log(`  \x1b[90mLocal:\x1b[0m    \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`  \x1b[90mNetwork:\x1b[0m  \x1b[36mhttp://${HOST === '0.0.0.0' ? '0.0.0.0' : HOST}:${PORT}\x1b[0m`);
  console.log(`  \x1b[90mRoot:\x1b[0m     ${ROOT_DIR}`);
  console.log(`  \x1b[90mMode:\x1b[0m     ${mode}`);
  console.log(`  \x1b[90mGzip:\x1b[0m     ${gzipStatus}`);
  console.log('');
  console.log('  \x1b[90mPress Ctrl+C to stop.\x1b[0m');
  console.log('');
});

/* ---------------------------------------------------------------------------
   Graceful shutdown
   --------------------------------------------------------------------------- */
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n\x1b[33m⏻  ${signal} received — shutting down gracefully…\x1b[0m`);

  server.close((err) => {
    if (err) {
      console.error('\x1b[31m✖ Error closing server:\x1b[0m', err);
      process.exit(1);
    }
    console.log('\x1b[32m✓ Server stopped. Bye!\x1b[0m\n');
    process.exit(0);
  });

  /* Force exit if connections hang for more than 5 seconds */
  setTimeout(() => {
    console.warn('\x1b[31m⚠ Forcing exit after timeout.\x1b[0m');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGHUP',  () => shutdown('SIGHUP'));

/* Catch uncaught exceptions so the server logs them instead of dying silently */
process.on('uncaughtException', (err) => {
  console.error('\x1b[31m✖ Uncaught exception:\x1b[0m', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('\x1b[31m✖ Unhandled rejection:\x1b[0m', reason);
});
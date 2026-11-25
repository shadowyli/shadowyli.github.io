/* 本地预览服务器：静态文件 + HTTP Range（视频可拖动进度条）
   用法：node scripts/serve.mjs  （默认 http://127.0.0.1:8000） */
import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT || 8000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const file = normalize(join(ROOT, pathname));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404).end("Not found");
    return;
  }
  if (stat.isDirectory()) {
    res.writeHead(302, { Location: pathname.replace(/\/?$/, "/") }).end();
    return;
  }

  const type = TYPES[extname(file).toLowerCase()] || "application/octet-stream";
  const range = req.headers.range;
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range);

  if (match) {
    const hasStart = match[1] !== "";
    const hasEnd = match[2] !== "";
    let start = hasStart ? Number(match[1]) : stat.size - Number(match[2]);
    let end = hasEnd && hasStart ? Number(match[2]) : stat.size - 1;
    if (!hasStart && hasEnd) end = stat.size - 1;
    start = Math.max(0, start);
    end = Math.min(end, stat.size - 1);
    if (start > end || start >= stat.size) {
      res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
      return;
    }
    res.writeHead(206, {
      "Content-Type": type,
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(file, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache"
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`);
});

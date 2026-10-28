// Minimal static server that mimics GitHub Pages routing for the exported
// site in out/: `/foo` -> `foo.html`, directories -> index.html, 404 -> 404.html.
// Used by the Playwright end-to-end tests; zero dependencies on purpose.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "out");
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function resolvePath(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  const candidates = [
    base,
    join(base, "index.html"),
    `${base.replace(/\/$/, "")}.html`,
  ];
  for (const c of candidates) if (await isFile(c)) return c;
  return null;
}

createServer(async (req, res) => {
  let file = await resolvePath(req.url ?? "/");
  let status = 200;
  if (!file) {
    file = join(root, "404.html");
    status = 404;
  }
  try {
    const body = await readFile(file);
    res.writeHead(status, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});

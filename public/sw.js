// IberAPP service worker: the landing opens without signal once it was visited with signal.
// Hand-written (no dependencies). Bump VERSION to drop every old cache on the next visit.
const VERSION = "v2";
const PAGES = `ibera-pages-${VERSION}`;
const STATIC = `ibera-static-${VERSION}`;
const MEDIA = `ibera-media-${VERSION}`;
const TILES = `ibera-tiles-${VERSION}`;
const MAX_TILES = 400; // map tiles the visitor already saw (~10 MB at most)

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(["/", "/manifest.webmanifest"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = [PAGES, STATIC, MEDIA, TILES];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("ibera-") && !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isTile = (url) =>
  url.hostname === "server.arcgisonline.com" || (url.hostname === "api.maptiler.com" && !url.pathname.endsWith("style.json"));

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

// Pages: network first (always fresh with signal), cached copy without it.
async function page(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put("/", res.clone());
    return res;
  } catch {
    return (await cache.match("/")) ?? Response.error();
  }
}

// Hashed build files never change: cache first.
async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === "opaque") {
    await cache.put(request, res.clone());
    if (max) trim(cacheName, max);
  }
  return res;
}

// Photos, fonts and the manifest: serve the cached copy at once and refresh it in the background.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit ?? Response.error());
  return hit ?? refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // valuations (POST) go through the in-page offline queue
  const url = new URL(request.url);

  if (request.mode === "navigate" && url.origin === self.location.origin) return event.respondWith(page(request));
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/vendor/")) return event.respondWith(cacheFirst(request, STATIC));
    if (url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/img/") || url.pathname.startsWith("/icons/") || url.pathname === "/iso.svg" || url.pathname === "/favicon.ico" || url.pathname === "/apple-icon.png")
      return event.respondWith(staleWhileRevalidate(request, MEDIA));
    return;
  }
  if (isTile(url)) return event.respondWith(cacheFirst(request, TILES, MAX_TILES));
});

// Bump the version whenever the offline app files change.
const CACHE_PREFIX = `exhaustive-argumentation:${self.registration.scope}:`;
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_FILES = [
  "./", "./index.html", "./icon.svg", "./manifest.webmanifest", "./pwa.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
];
const APP_URLS = new Set(APP_FILES.map((path) => new URL(path, self.registration.scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  // Let existing tabs finish with their current version before activating updates.
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  url.search = "";
  if (event.request.method !== "GET" || !APP_URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type === "basic") {
        await cache.put(url.href, response.clone());
        if (event.request.mode === "navigate") {
          await cache.put(new URL("./", self.registration.scope).href, response.clone());
          await cache.put(new URL("./index.html", self.registration.scope).href, response.clone());
        }
      }
      return response;
    } catch (error) {
      const cached = await cache.match(url.href);
      if (cached) return cached;
      throw error;
    }
  })());
});

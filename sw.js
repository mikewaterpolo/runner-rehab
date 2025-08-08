
const CACHE_NAME = "runner-rehab-full-v1-2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.v1-2.webmanifest",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method === "GET" && url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const net = await fetch(e.request);
        if (net && net.status === 200) cache.put(e.request, net.clone());
        return net;
      } catch {
        return cached || new Response("Offline", {status: 200, headers: {"Content-Type":"text/plain"}});
      }
    })());
  }
});

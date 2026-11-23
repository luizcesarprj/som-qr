const CACHE_NAME = "som-qr-pwa-v017-4";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Network-First com fallback instantâneo para o cache offline (garante atualização imediata e funciona 100% em Modo Avião)
  event.respondWith(
    fetch(req).then(netResp => {
      if (netResp && netResp.status === 200 && req.url.startsWith(self.location.origin)) {
        const clone = netResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
      }
      return netResp;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(c => c || caches.match("./index.html")))
  );
});

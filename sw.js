// MujaPrime service worker - performance safe mode
// Build: 20260916-firestore-token-fix-v2
const MUJA_BUILD_VERSION = '20260916-firestore-token-fix-v2';
const STATIC_CACHE = 'muja-static-' + MUJA_BUILD_VERSION;
const PAGE_CACHE = 'muja-pages-' + MUJA_BUILD_VERSION;
const CACHE_PREFIX = 'muja-';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, PAGE_CACHE].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  // Halaman lama masih mungkin mengirim MUJA_CLEAR_CACHE. Jangan hapus cache berulang kali.
  if (event.data && event.data.type === 'MUJA_CLEAR_CACHE' && event.data.force === true) {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k)));
    })());
  }
});

function isApi(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/api/');
}

function isStaticAsset(request, url) {
  if (request.destination && ['style','script','image','font'].includes(request.destination)) return true;
  return /\.(?:css|js|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf)(?:$|\?)/i.test(url.pathname + url.search);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()).catch(()=>{});
    return response;
  }).catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone()).catch(()=>{});
    return response;
  } catch (_) {
    return (await cache.match(request)) || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (isApi(url)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

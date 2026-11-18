// Bootleggers Kitchen service worker: works offline, updates on request.
// Bump CACHE with every release (it follows the app version).
const CACHE = 'blg-0.2.0-2026.11.18-2';
const SHELL = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/app.js', 'js/config.js', 'js/access.js', 'js/crypto.js', 'js/store.js', 'js/starter-stock.js',
  'js/ui.js', 'js/data.js', 'js/perms.js', 'js/recipes.js', 'js/stock.js', 'js/board.js', 'js/prep.js',
  'js/schedule.js', 'js/events.js', 'js/costs.js', 'js/settings.js', 'js/sync.js',
  'assets/bootleggers-logo.png', 'assets/app-icon-192.png', 'assets/app-icon-512.png', 'assets/app-icon-180.png', 'assets/favicon-32.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.mp4')) return; // video needs range requests; let the network handle it
  if (url.pathname.includes('/data/')) {
    // Notices and revocations: always try the network first.
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});

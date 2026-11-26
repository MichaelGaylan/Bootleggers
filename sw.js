// Service worker: works offline, updates on request.
// Bump CACHE with every release (it follows the app version).
// RRA-123: the restaurant's pictures (logo, icons, dish photos) come from
// js/brand.js, so a changeout never keeps another restaurant's files cached.
importScripts('js/brand.js');
const B = self.BRAND;
const CACHE = B.dataPrefix.replace(/\W+$/, '') + '-0.15.0-2026.11.26-29';
const CODE = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/brand.js', 'js/app.js', 'js/config.js', 'js/access.js', 'js/crypto.js', 'js/store.js', 'js/starter-stock.js', 'js/menu.js', 'js/pdf.js', 'js/lounge.js',
  'js/ui.js', 'js/data.js', 'js/perms.js', 'js/recipes.js', 'js/stock.js', 'js/board.js', 'js/prep.js',
  'js/schedule.js', 'js/events.js', 'js/costs.js', 'js/settings.js', 'js/sync.js', 'js/audience.js', 'js/dedupe.js', 'js/reports.js',
  'js/payroll.js', 'js/paycalc.js', 'js/provider.js', 'js/pos.js', 'js/giftcards.js', 'js/music.js', 'js/cleardata.js',
  'js/coupons.js', 'js/coupons-core.js', 'js/drinks.js', 'js/alerts.js', 'js/timeoff.js', 'vendor/zxing/zxing.min.js', // RRA-122
];
const PICTURES = [B.logo, B.icon180, B.icon192, B.icon512, B.iconMaskable, B.favicon]
  .concat(Object.values(B.menuPhotos || {}).map((f) => (B.menuPhotoDir || '') + f))
  .filter(Boolean);
const SHELL = [...new Set(CODE.concat(PICTURES))];

// RRA-146: a new version downloads and then waits. It takes over only when
// the app asks (Update now, or right after the app is opened fresh), so the
// app never reloads in the middle of an order.
self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's own short-term cache, which could
  // otherwise hand back the previous version's files (GitHub Pages lets
  // browsers keep files for 10 minutes).
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// Tapping a notification opens the app where it points: Team access for a
// phone waiting for approval (RRA-043), or the screen an alert is about (RRA-137).
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const url = new URL('./' + (e.notification.data?.url || '#/team'), self.registration.scope).href;
    for (const c of list) { if ('focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.mp4')) return; // video needs range requests; let the network handle it
  if (url.pathname.includes('/data/') || url.pathname.endsWith('/js/config.js')) {
    // Notices and revocations: always try the network first.
    e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});

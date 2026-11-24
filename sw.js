// Bootleggers Kitchen service worker: works offline, updates on request.
// Bump CACHE with every release (it follows the app version).
const CACHE = 'blg-0.8.0-2026.11.24-10';
const SHELL = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/brand.js', 'js/app.js', 'js/config.js', 'js/access.js', 'js/crypto.js', 'js/store.js', 'js/starter-stock.js', 'js/menu.js', 'js/pdf.js', 'js/lounge.js',
  'js/ui.js', 'js/data.js', 'js/perms.js', 'js/recipes.js', 'js/stock.js', 'js/board.js', 'js/prep.js',
  'js/schedule.js', 'js/events.js', 'js/costs.js', 'js/settings.js', 'js/sync.js', 'js/audience.js', 'js/dedupe.js', 'js/reports.js',
  'js/payroll.js', 'js/paycalc.js', 'js/provider.js', 'js/pos.js', 'js/giftcards.js', 'js/music.js', 'js/cleardata.js',
  'assets/bootleggers-logo.png', 'assets/app-icon-192.png', 'assets/app-icon-512.png', 'assets/app-icon-180.png', 'assets/favicon-32.png',
  // Dish pictures (js/brand.js menuPhotos).
  'assets/menu/10-jumbo-wings-bone-in.jpg',
  'assets/menu/15-jumbo-wings-bone-in.jpg',
  'assets/menu/20-jumbo-wings-bone-in.jpg',
  'assets/menu/30-jumbo-wings-bone-in.jpg',
  'assets/menu/5-jumbo-wings-bone-in.jpg',
  'assets/menu/50-jumbo-wings-bone-in.jpg',
  'assets/menu/bacon-ranch-chicken-sandwich-with-fries.jpg',
  'assets/menu/black-blue-with-fries.jpg',
  'assets/menu/blt-with-fries.jpg',
  'assets/menu/buffalo-chicken-sandwich-or-wrap-with-fries.jpg',
  'assets/menu/classic-burger-with-fries.jpg',
  'assets/menu/farmhouse-burger-with-fries.jpg',
  'assets/menu/fried-mushrooms.jpg',
  'assets/menu/fried-pickles.jpg',
  'assets/menu/fries.jpg',
  'assets/menu/grilled-cheese-with-fries.jpg',
  'assets/menu/hot-dog-basket-with-side.jpg',
  'assets/menu/mile-high-club-with-fries.jpg',
  'assets/menu/mozzarella-sticks.jpg',
  'assets/menu/nachos-full.jpg',
  'assets/menu/nachos-half.jpg',
  'assets/menu/philly-melt-with-fries.jpg',
  'assets/menu/quesadilla-burger-with-fries.jpg',
  'assets/menu/quesadilla.jpg',
  'assets/menu/single-taco-no-side.jpg',
  'assets/menu/some-like-it-hot-with-fries.jpg',
  'assets/menu/the-grilled-cheese-incident-with-fries.jpg',
  'assets/menu/tortilla-chips-salsa.jpg',
  'assets/menu/tots.jpg',
  'assets/menu/veggie-burger-with-fries.jpg',
  'assets/menu/wing-basket.jpg',
  'assets/menu/pineapple-juice.jpg',
  'assets/menu/hot-buffalo-sauce-cup.jpg',
  'assets/menu/italian-dressing-cup.jpg',
  'assets/menu/ketchup-cup.jpg',
  'assets/menu/mayo-cup.jpg',
  'assets/menu/mustard-cup.jpg',
  'assets/menu/sour-cream-cup.jpg',
  'assets/menu/bottle-water.jpg',
  'assets/menu/coca-cola.jpg',
  'assets/menu/cranberry-juice.jpg',
  'assets/menu/diet-coke.jpg',
  'assets/menu/ginger-ale.jpg',
  'assets/menu/orange-juice.jpg',
  'assets/menu/red-bull.jpg',
  'assets/menu/red-bull-sugar-free.jpg',
  'assets/menu/sprite.jpg',
  'assets/menu/sweet-tea.jpg',
  'assets/menu/unsweet-tea.jpg',
  'assets/menu/honey-mustard-sauce-cup.jpg',
  'assets/menu/honey-sriracha-sauce-cup.jpg',
  'assets/menu/buffalo-sauce-cup.jpg',
  'assets/menu/ranch-sauce-cup.jpg',
  'assets/menu/blue-cheese-sauce-cup.jpg',
  'assets/menu/bbq-sauce-cup.jpg',
  'assets/menu/side-salad.jpg',
  'assets/menu/tex-mex-salad.jpg',
  'assets/menu/house-salad.jpg',
  'assets/menu/chef-salad.jpg',
  'assets/menu/buffalo-salad.jpg',
  'assets/menu/the-bootlegger-with-fries.jpg',
  'assets/menu/taco-basket-with-side.jpg',
  'assets/menu/chicken-finger-basket-with-fries.jpg',
];

// A new version takes over as soon as it has downloaded; the page reloads
// itself when that happens. (Waiting for every window to close never
// happens reliably for home-screen apps on iPhone.)
self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's own short-term cache, which could
  // otherwise hand back the previous version's files (GitHub Pages lets
  // browsers keep files for 10 minutes).
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// A request waiting for approval (RRA-043): open the app on Team access.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const url = new URL('./#/team', self.registration.scope).href;
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

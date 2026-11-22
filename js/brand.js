// Brand settings (BPAY-017 / RSW-001): every restaurant-specific name, picture,
// color and data name lives here, so one copy of the app can serve many
// restaurants. The setup wizard writes this file for each restaurant.
//
// Loaded as a plain script in <head> (before the page draws), so it also sets
// the page title, home-screen name and icons. The rest of the app reads it
// through BRAND in js/config.js.
//
// Keep index.html and manifest.webmanifest in step with these values: iPhone
// reads the home-screen name and icon from the page itself.

self.BRAND = {
  // Names
  appName: 'Bootleggers Kitchen',          // page title, About, startup screen, messages
  shortName: 'Bootleggers',                // name under the home-screen icon
  restaurant: 'Bootleggers Bar & Grill',   // printed footers, notices
  location: 'Augusta',
  tagline: 'Recipes and kitchen notes for Bootleggers Bar & Grill, Augusta.',
  credit: '',                              // © line in About, e.g. '© 2026 Your Brand'. Empty = hidden.

  // Pictures and video (paths inside the app folder)
  logo: 'assets/bootleggers-logo.png',     // pinned header logo
  icon180: 'assets/app-icon-180.png',      // iPhone home-screen icon
  icon192: 'assets/app-icon-192.png',
  icon512: 'assets/app-icon-512.png',
  favicon: 'assets/favicon-32.png',
  introVideo: 'assets/intro.mp4',          // startup clip; '' = skip straight to the card

  // Look. null keeps the Apple / Android system colors from css/app.css.
  accent: null,                            // e.g. '#c8102e'

  // Data space. Every restaurant needs its own, never shared or reused.
  // Changing these on a live app makes phones start empty.
  dataPrefix: 'blg.',                      // saved settings on the phone
  dbName: 'bootleggers',                   // encrypted on-phone database
  teamId: 'bootleggers',                   // shared data folder: teams/<teamId> in Firebase
  reportPrefix: 'Bootleggers —',           // subject start for Report a problem emails
};

// Apply what the page head needs before first paint.
(function (B) {
  if (typeof document === 'undefined') return;
  var d = document;
  d.title = B.appName;
  var set = function (sel, attr, v) { var el = d.querySelector(sel); if (el && v) el.setAttribute(attr, v); };
  set('meta[name="apple-mobile-web-app-title"]', 'content', B.shortName);
  set('link[rel="apple-touch-icon"]', 'href', B.icon180);
  set('link[rel="icon"]', 'href', B.favicon);
  if (B.accent) {
    // Pick white or black text on the accent, whichever reads better.
    var h = B.accent.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16), lum = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
    var s = d.createElement('style');
    s.textContent = ':root,:root[data-theme],.android,.android[data-theme]{--accent:' + B.accent + ' !important;--on-accent:' + (lum > 0.6 ? '#000' : '#fff') + ' !important}';
    d.head.appendChild(s);
  }
})(self.BRAND);

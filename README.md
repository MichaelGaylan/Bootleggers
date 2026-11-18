# Bootleggers Kitchen

A light web app (PWA) for iPhone and Android with house recipes and kitchen notes for Bootleggers Bar & Grill, Augusta. It opens only on phones a manager has approved.

No build step: it is plain HTML, CSS and JavaScript modules, served as static files (for example with GitHub Pages).

## Layout
- `index.html`, `css/app.css`: the app and its iOS/Android look (light and dark)
- `js/config.js`: version, build, Owner keys, expiry days, Report a problem key
- `js/access.js`: invite, approval and activation codes; inactivity expiry
- `js/crypto.js`, `js/store.js`: device keys and encrypted on-phone storage
- `js/starter-stock.js`: the preinstalled starter stock list (draft)
- `data/notifications.json`: notices sent to everyone
- `data/access.json`: revoked invite ids
- `sw.js`, `manifest.webmanifest`: offline support and home-screen install
- `TODO.md`: the build lists

## Releasing
Bump `VERSION` and `BUILD` in `js/config.js`, add a line to `WHATS_NEW`, and bump `CACHE` in `sw.js`. Phones then show "An update is ready" and replay the startup screen with what's new.

## Run locally
`python3 -m http.server` in this folder, then open http://localhost:8000.

# Bootleggers Kitchen

A light web app (PWA) for iPhone and Android with house recipes and kitchen notes for Bootleggers Bar & Grill, Augusta. It opens only on phones a manager has approved.

No build step: it is plain HTML, CSS and JavaScript modules, served as static files (for example with GitHub Pages).

## Layout
- `index.html`, `css/app.css`: the app and its iOS/Android look (light and dark)
- `js/brand.js`: the restaurant's names, logo, icons, intro video, accent color, © credit line and data names (one file per restaurant; keep `index.html` and `manifest.webmanifest` in step)
- `js/config.js`: version, build, Admin keys, expiry days, Report a problem key
- `js/access.js`: invite, approval and activation codes; inactivity expiry
- `js/crypto.js`, `js/store.js`: device keys and encrypted on-phone storage
- `js/starter-stock.js`: the preinstalled starter stock list (draft)
- `js/ui.js`, `js/data.js`, `js/perms.js`: shared helpers, team data collections (sync hook), roles and permissions
- `js/recipes.js`, `js/prep.js`, `js/stock.js`, `js/board.js`, `js/schedule.js`, `js/events.js`, `js/costs.js`, `js/settings.js`: the screens
- `js/payroll.js`, `js/paycalc.js`, `js/provider.js`: Payroll (RRA-095): pay runs, My pay & tips, tip rules, payroll settings; pay math; payroll service and POS list (merged from the stand-alone Bootleggers Payroll app)
- `data/notifications.json`: notices sent to everyone
- `data/access.json`: revoked invite ids
- `sw.js`, `manifest.webmanifest`: offline support and home-screen install
- `TODO.md`: the build lists

## Releasing
Bump `VERSION` and `BUILD` in `js/config.js`, add a line to `WHATS_NEW`, and bump `CACHE` in `sw.js` (add any new file to its list). Phones then show "An update is ready" and replay the startup screen with what's new.

## Run locally
`python3 -m http.server` in this folder, then open http://localhost:8000.

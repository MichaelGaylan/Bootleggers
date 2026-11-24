#!/usr/bin/env node
// Clean changeout (RRA-123): turn this app into another restaurant's app with
// nothing of the old restaurant left behind.
//
// Everything restaurant-specific lives in js/brand.js and the files it points
// to in assets/. A changeout is:
//
//   1. node tools/changeout.mjs start         saves old-brand.js and a fingerprint
//                                             of every old picture (old-pictures.json)
//   2. write the new js/brand.js              (the setup wizard does this)
//      - new names, pictures, menu, starter stock, vendors, gift cards, radio
//      - a NEW data space: dataPrefix, dbName, teamId (and its own firebase
//        project or null, and its own reportKey)
//   3. put the new pictures in assets/ and delete the old ones
//   4. node tools/changeout.mjs sync          rewrites index.html, manifest.webmanifest
//                                             and firestore.rules from brand.js
//   5. node tools/changeout.mjs check --old-brand old-brand.js
//      refuses (exit 1) and lists every leftover until there are none.
//      A word the new restaurant really uses too (e.g. Coca-Cola) can be
//      allowed: --allow "Coca-Cola,Diet Coke"
//   6. delete old-brand.js and old-pictures.json, bump VERSION/BUILD in js/config.js and CACHE in sw.js
//
// `check` with no --old-brand just confirms the app is in step with its own
// brand.js (no missing or stray pictures, generated files up to date).

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// Files that are about the project, not part of the app staff see.
const SKIP_DIRS = new Set(['.git', 'node_modules', 'previews', 'tools']);
const SKIP_FILES = new Set(['TODO.md', 'README.md', 'old-brand.js', 'old-pictures.json']);
const TEXT = /\.(js|mjs|json|html|css|webmanifest|rules|txt|md|svg)$/i;
// Shared by every restaurant (not brand pictures).
const SHARED_ASSETS = new Set(['assets/whoosh.mp3']);

function loadBrand(file) {
  const ctx = { self: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  if (!ctx.self.BRAND) throw new Error(`${file} does not set self.BRAND`);
  return ctx.self.BRAND;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(full, out); }
    else if (!SKIP_FILES.has(e.name) || dir !== ROOT) out.push(rel(full));
  }
  return out;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Pictures and video brand.js points to.
function brandFiles(B) {
  const list = [B.logo, B.icon180, B.icon192, B.icon512, B.iconMaskable, B.favicon, B.introVideo, B.iconSource]
    .concat(Object.values(B.menuPhotos || {}).map((f) => (B.menuPhotoDir || '') + f));
  return [...new Set(list.filter(Boolean))];
}

// ---------------------------------------------------------------- generated files

function genIndex(B, html) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(B.appName)}</title>`)
    .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*(")/, `$1${esc(B.shortName)}$2`)
    .replace(/(<link rel="icon" href=")[^"]*(")/, `$1${esc(B.favicon)}$2`)
    .replace(/(<link rel="apple-touch-icon" href=")[^"]*(")/, `$1${esc(B.icon180)}$2`)
    .replace(/(<img id="brand-logo" src=")[^"]*(")/, `$1${esc(B.logo)}$2`);
}

function genManifest(B, text) {
  const m = JSON.parse(text);
  m.name = B.appName;
  m.short_name = B.shortName;
  m.description = B.tagline;
  m.icons = [
    { src: B.icon192, sizes: '192x192', type: 'image/png' },
    { src: B.icon512, sizes: '512x512', type: 'image/png' },
  ].concat(B.iconMaskable ? [{ src: B.iconMaskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' }] : []);
  return JSON.stringify(m, null, 2).replace(/\{\n\s+"src": ([^\n]+)\n\s+"sizes": ([^\n]+)\n\s+"type": ([^\n]+?)(,?)\n(\s+"purpose": ([^\n]+)\n)?\s+\}/g,
    (_, src, sizes, type, comma, p, purpose) => `{ "src": ${src} "sizes": ${sizes} "type": ${type}${purpose ? `, "purpose": ${purpose}` : ''} }`) + '\n';
}

function genRules(B) {
  return `rules_version = '2';
// ${B.appName} (RRA-031). Written by tools/changeout.mjs sync from js/brand.js (teamId).
// Paste into Firebase console → Firestore → Rules → Publish.
// Phones sign in anonymously. Every record is encrypted on the phone with the
// team key before it is written, so these rules only keep out the public and
// cap the size of each record.
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/${B.teamId}/docs/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.data.keys().hasOnly(['c', 'i', 'u', 'd', 'iv', 'ct'])
        && request.resource.data.ct.size() < 900000;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;
}

const hash = (f) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');

const GENERATED = {
  'index.html': (B) => genIndex(B, read('index.html')),
  'manifest.webmanifest': (B) => genManifest(B, read('manifest.webmanifest')),
  'firestore.rules': (B) => genRules(B),
};

// ---------------------------------------------------------------- old names

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

function oldWords(O, B, allow = []) {
  const w = new Set();
  const add = (s) => { s = String(s || '').trim(); if (s.length >= 4) w.add(s); };
  [O.coupon?.title, O.coupon?.tagline, O.appName, O.shortName, O.restaurant, O.location, O.teamId, O.dbName, O.dishExample, O.radioSearchArea,
    host(O.websiteUrl), host(O.giftCards?.url), O.firebase?.projectId, O.reportKey,
    String(O.reportPrefix || '').replace(/[\s—–-]+$/, '')].forEach(add);
  // "Bootleggers" also catches "The Bootlegger".
  if (/s$/i.test(O.shortName || '') && O.shortName.length > 5) add(O.shortName.slice(0, -1));
  // Old dishes the new menu doesn't have (names of 8+ letters, to skip "Fries").
  const now = new Set((B.menu || []).flatMap((s) => s.items.map((i) => i[0])));
  (O.menu || []).flatMap((s) => s.items.map((i) => i[0])).forEach((n) => { if (n.length >= 8 && !now.has(n)) add(n); });
  // Words the new restaurant still uses on purpose are not leftovers.
  const keep = [B.appName, B.shortName, B.restaurant, B.location, B.teamId, B.dbName].map((s) => String(s || '').toLowerCase());
  const ok = new Set(allow.map((a) => a.toLowerCase()));
  return [...w].filter((x) => !ok.has(x.toLowerCase()) && !keep.some((k) => k && k.includes(x.toLowerCase())));
}

// ---------------------------------------------------------------- commands

function start() {
  if (fs.existsSync(path.join(ROOT, 'old-brand.js'))) {
    console.log('old-brand.js already exists: a changeout is under way. Delete it first to start over.');
    process.exit(1);
  }
  fs.copyFileSync(path.join(ROOT, 'js/brand.js'), path.join(ROOT, 'old-brand.js'));
  const prints = {};
  for (const f of walk(ROOT).filter((x) => x.startsWith('assets/') && !SHARED_ASSETS.has(x))) prints[hash(f)] = f;
  fs.writeFileSync(path.join(ROOT, 'old-pictures.json'), JSON.stringify(prints, null, 1) + '\n');
  console.log(`Saved old-brand.js and fingerprints of ${Object.keys(prints).length} old pictures. Now write the new js/brand.js and pictures.`);
}

function sync() {
  const B = loadBrand(path.join(ROOT, 'js/brand.js'));
  for (const [file, gen] of Object.entries(GENERATED)) {
    const next = gen(B);
    if (next !== read(file)) { fs.writeFileSync(path.join(ROOT, file), next); console.log(`wrote ${file}`); }
    else console.log(`${file} already up to date`);
  }
}

function check(oldBrandPath, allow = []) {
  const B = loadBrand(path.join(ROOT, 'js/brand.js'));
  const problems = [];
  const files = walk(ROOT);

  // 1. Files generated from brand.js are in step with it.
  for (const [file, gen] of Object.entries(GENERATED)) {
    if (gen(B) !== read(file)) problems.push(`${file} doesn't match js/brand.js: run node tools/changeout.mjs sync`);
  }

  // 2. Every picture brand.js names exists.
  const wanted = new Set(brandFiles(B));
  for (const f of wanted) if (!fs.existsSync(path.join(ROOT, f))) problems.push(`missing picture: ${f} (named in js/brand.js)`);

  // 3. No stray pictures or video: anything in assets/ brand.js doesn't use
  //    could be the old restaurant's and could still show or be cached.
  for (const f of files.filter((x) => x.startsWith('assets/'))) {
    if (!wanted.has(f) && !SHARED_ASSETS.has(f)) problems.push(`stray file: ${f} (not used by js/brand.js; delete it or add it to brand.js)`);
  }

  // 4. During a changeout: nothing of the old restaurant is left.
  if (oldBrandPath) {
    const O = loadBrand(path.resolve(oldBrandPath));
    for (const k of ['dataPrefix', 'dbName', 'teamId']) {
      if (O[k] === B[k]) problems.push(`brand.js ${k} is still "${B[k]}": the new restaurant needs its own data space, or it would see the old one's schedules, staff, pay and checks`);
    }
    if (B.firebase && O.firebase && B.firebase.projectId === O.firebase.projectId) {
      problems.push(`brand.js firebase is still the old project (${B.firebase.projectId}); fine only if teamId is new, but its own project is safer`);
    }
    if (B.coupon?.tag && B.coupon.tag === O.coupon?.tag) problems.push(`brand.js coupon.tag is still "${B.coupon.tag}": the old restaurant's coupons would scan here`);
    if (B.reportKey && B.reportKey === O.reportKey) problems.push('brand.js reportKey is the old one: problem reports would go to the old restaurant\'s inbox');
    const revoked = JSON.parse(read('data/access.json')).revoked || [];
    if (revoked.length) problems.push(`data/access.json lists ${revoked.length} revoked invite(s) from the old restaurant: empty the list`);

    // Old pictures still in the app, even under a new name or the same name.
    const printsFile = path.join(path.dirname(path.resolve(oldBrandPath)), 'old-pictures.json');
    if (fs.existsSync(printsFile)) {
      const prints = JSON.parse(fs.readFileSync(printsFile, 'utf8'));
      for (const f of files.filter((x) => x.startsWith('assets/') && !SHARED_ASSETS.has(x))) {
        if (prints[hash(f)]) problems.push(`old picture still here: ${f} (same picture as the old ${prints[hash(f)]}); replace it with the new restaurant's`);
      }
    } else problems.push('old-pictures.json not found: run node tools/changeout.mjs start before replacing brand.js, so old pictures can be caught');

    const words = oldWords(O, B, allow);
    for (const f of files.filter((x) => TEXT.test(x))) {
      const lines = read(f).split('\n');
      lines.forEach((line, i) => {
        for (const wd of words) {
          if (line.toLowerCase().includes(wd.toLowerCase())) problems.push(`${f}:${i + 1}: "${wd}" → ${line.trim().slice(0, 100)}`);
        }
      });
    }
  }

  if (problems.length) {
    console.log(`Changeout check FAILED: ${problems.length} leftover(s)\n`);
    problems.forEach((p) => console.log(' - ' + p));
    process.exit(1);
  }
  console.log(oldBrandPath ? 'Changeout check passed: nothing of the old restaurant is left.' : 'Check passed: the app is in step with js/brand.js.');
}

const [cmd, ...args] = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
if (cmd === 'start') start();
else if (cmd === 'sync') sync();
else if (cmd === 'check') check(opt('--old-brand'), (opt('--allow') || '').split(',').map((x) => x.trim()).filter(Boolean));
else {
  console.log('Usage:\n  node tools/changeout.mjs start\n  node tools/changeout.mjs sync\n  node tools/changeout.mjs check [--old-brand old-brand.js] [--allow "word,word"]');
  process.exit(cmd ? 1 : 0);
}

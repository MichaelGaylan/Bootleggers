// Languages (RRA-157): English and Spanish.
//
// Every screen word lives in a language file next to js/brand.js:
// js/lang-en.js and js/lang-es.js. Both are plain scripts loaded in <head>,
// like brand.js, so the multi-restaurant copy can ship the same files.
// English is the source text: a Spanish entry is keyed by the English words it
// replaces, and {0}, {1}… stand for the parts that change (a name, a number).
//
// Who sees which language (Gaylan, 2026-11-27):
//  1. the language this person picked (Settings → Language, saved on their phone);
//  2. otherwise the restaurant's language, set by the Admin;
//  3. otherwise English.
//
// How it works: once the language is Spanish, every word the app puts on the
// screen (screens, buttons, pop-ups, toasts, kitchen tickets, printouts) is
// swapped for its Spanish entry as it appears. Text people type (recipes,
// notes, messages) is never translated. Dishes and toppings show their own
// Spanish name when the Admin has filled one in (Edit dish → Spanish name),
// and their English name when it is blank. Dates and times follow the language.

const P = (globalThis.BRAND?.dataPrefix) || 'blg.';
const read = (k) => { try { return JSON.parse(localStorage.getItem(P + k)); } catch { return null; } };
const write = (k, v) => { try { if (v == null) localStorage.removeItem(P + k); else localStorage.setItem(P + k, JSON.stringify(v)); } catch { /* private mode */ } };

export const LANGS = globalThis.LANGS || { en: { name: 'English', locale: 'en-US', strings: {} } };
export const LANG_NAMES = Object.fromEntries(Object.entries(LANGS).map(([k, v]) => [k, v.name]));
const ok = (c) => (c && LANGS[c] ? c : null);

// This person's own choice ('en', 'es' or null = the restaurant's language).
export const myLang = () => ok(read('lang'));
// The restaurant's language, set by the Admin (kept in the shared settings;
// a copy is kept on the phone so the app opens in it straight away).
export const restaurantLang = () => ok(read('langDefault')) || 'en';
export const lang = () => myLang() || restaurantLang();
export const locale = () => LANGS[lang()]?.locale || 'en-US';
export const isEs = () => lang() === 'es';

const CURRENT = lang();
document.documentElement.lang = CURRENT;
const changed = () => lang() !== CURRENT;
// Switching language redraws the whole app in it.
export function setMyLang(code) { write('lang', ok(code)); if (changed()) location.reload(); }
// From the shared settings (s.lang). Returns true when the app had to switch.
export function setRestaurantLang(code) {
  const c = ok(code) || 'en';
  if (read('langDefault') === c) return false;
  write('langDefault', c);
  if (changed()) { location.reload(); return true; }
  return false;
}

// ------------------------------------------------------------ words

const STR = LANGS[CURRENT]?.strings || {};
// {name}, {restaurant} and {app} stand for the restaurant's names (js/brand.js).
const B = globalThis.BRAND || {};
const brand = (s) => String(s).replace(/\{name\}/g, B.shortName || '').replace(/\{restaurant\}/g, B.restaurant || '').replace(/\{app\}/g, B.appName || '');
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const SMALL = new Set(['to', 'and', 'or', 'of', 'for', 'with', 'by', 'from', 'at', 'in', 'on', 'is', 'was', 'a', 'an', 'the', 'as']);
const EXACT = new Map();
const PATTERNS = [];
for (const [en, raw] of Object.entries(STR)) {
  if (!raw) continue;
  const k = norm(brand(en)), es = brand(raw);
  if (!/\{\d+\}/.test(k)) { EXACT.set(k, es); continue; }
  const lits = k.split(/\{\d+\}/);
  const order = [...k.matchAll(/\{(\d+)\}/g)].map((m) => +m[1]);
  const rx = new RegExp('^' + lits.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.*?)') + '$');
  const longest = lits.reduce((a, b) => (b.length > a.length ? b : a), '');
  // A pattern open at both ends ("{0} to {1}") needs enough words of its own,
  // or it would catch text people typed.
  const letters = lits.join('').replace(/[^A-Za-z]/g, '').length;
  const open = /^\{\d+\}/.test(k) && /\{\d+\}$/.test(k);
  const small = lits.join(' ').toLowerCase().split(/[^a-z]+/).filter(Boolean).every((w) => SMALL.has(w));
  if (letters < 2 || (open && small)) continue;
  PATTERNS.push({ rx, order, es, longest, size: lits.join('').length });
}
PATTERNS.sort((a, b) => b.size - a.size);

// Dish and topping names: English name → Spanish name, from Recipes and the
// toppings list. Filled by app.js once the data has loaded.
const NAMES = new Map();
export function setNames(pairs) {
  NAMES.clear();
  if (CURRENT === 'en') return;
  for (const [en, es] of pairs) if (en && es && norm(es)) NAMES.set(norm(en), norm(es));
  if (observer) retranslate();
}
// The name to show for a dish or topping.
export const nm = (en) => (CURRENT === 'en' ? en : NAMES.get(norm(en)) || en);

const one = (s) => EXACT.get(s) ?? NAMES.get(s);
// Translate a whole piece of text. Unknown text comes back unchanged.
export function tr(text, depth = 0) {
  if (CURRENT === 'en' || text == null) return text;
  const s = String(text), k = norm(s);
  if (!k || !/[A-Za-z]/.test(k)) return s;
  const hit = one(k);
  if (hit !== undefined) return keepSpace(s, hit);
  // A picture in front ("🎟 Add a coupon"): translate the words after it.
  const lead = k.match(/^([^\p{L}\p{N}¿¡$#(+\-"“'‹]+)(\p{L}.*)$/u);
  const leadHit = lead && one(lead[2]);
  if (leadHit !== undefined && leadHit !== null) return keepSpace(s, lead[1] + leadHit);
  // A short pattern ("{0} seated{1}") can't swallow whole sentences: when a
  // part it would fill holds a sentence break, its own words must make up at
  // least half the text.
  for (const p of PATTERNS) {
    if (p.longest && !k.includes(p.longest)) continue;
    const m = p.rx.exec(k);
    if (!m) continue;
    if (p.size * 2 < k.length && m.slice(1).some((x) => /[.!?] \S/.test(x || ''))) continue;
    const parts = p.order.map((n, i) => [n, m[i + 1]]);
    const val = p.es.replace(/\{(\d+)\}/g, (_, n) => { const v = (parts.find(([x]) => x === +n) || [])[1] ?? ''; return depth < 3 ? tr(v, depth + 1) : one(norm(v)) ?? v; });
    return keepSpace(s, val);
  }
  if (lead && depth < 3) { const rest = tr(lead[2], depth + 1); if (rest !== lead[2]) return keepSpace(s, lead[1] + rest); }
  // Several sentences joined in one piece of text: translate the known ones.
  if (depth < 3 && /[.!?] \S/.test(k)) {
    const bits = k.split(/(?<=[.!?]) (?=\S)/);
    const each = bits.map((b) => tr(b, depth + 1));
    if (each.some((o, i) => o !== bits[i])) return keepSpace(s, each.join(' '));
  }
  return s;
}
const keepSpace = (s, v) => (s.match(/^\s*/)[0]) + v + (s.match(/\s*$/)[0]);
// A word that reads differently in one place: tk('topping.no', 'No') uses the
// language file's 'topping.no' entry, or the English word when there is none.
export const tk = (key, en) => (CURRENT === 'en' ? en : STR[key] || tr(en));
// Same, with {0}… filled in: t('Seat {0}', 2).
export const t = (en, ...args) => (CURRENT === 'en' ? en : tr(en)).replace(/\{(\d+)\}/g, (_, n) => args[+n] ?? '');

// ------------------------------------------------------------ dates and times

// Every date and time the app shows uses the person's language, whatever
// locale the screen asked for ([], undefined or 'en-US').
if (CURRENT !== 'en') {
  const L = locale();
  const wrap = (proto, name) => {
    const orig = proto[name];
    proto[name] = function (loc, opts) { return orig.call(this, (loc == null || (Array.isArray(loc) && !loc.length) || loc === 'en-US') ? L : loc, opts); };
  };
  ['toLocaleDateString', 'toLocaleTimeString', 'toLocaleString'].forEach((n) => wrap(Date.prototype, n));
}

// ------------------------------------------------------------ the screen

// Never translate what people type, or the app's own codes.
const SKIP = 'TEXTAREA, SCRIPT, STYLE, CODE, PRE, [contenteditable], [data-notr], .notr';
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
const done = new WeakMap(); // text node → the text we put there
function textNode(n) {
  const v = n.data;
  if (done.get(n) === v) return;
  const p = n.parentElement;
  if (!p || p.closest(SKIP)) return;
  const out = tr(v);
  done.set(n, out);
  if (out === v) return;
  // A choice in a list keeps its English value, so what's saved stays the same.
  if (p.tagName === 'OPTION' && !p.hasAttribute('value')) p.setAttribute('value', p.textContent);
  n.data = out;
}
function element(el) {
  if (el.nodeType !== 1 || el.closest(SKIP)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v && /[A-Za-z]/.test(v)) { const o = tr(v); if (o !== v) el.setAttribute(a, o); }
  }
  if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit') && el.value) el.value = tr(el.value);
}
function walk(root) {
  if (root.nodeType === 3) { textNode(root); return; }
  if (root.nodeType !== 1) return;
  if (root.closest?.(SKIP)) return;
  element(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === 1 && n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) textNode(n); else element(n); }
}
let observer = null;
function retranslate() { walk(document.body); if (document.title) document.title = tr(document.title); }
if (CURRENT !== 'en') {
  observer = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') textNode(m.target);
      else if (m.type === 'attributes') element(m.target);
      else m.addedNodes.forEach(walk);
    }
  });
  const start = () => { retranslate(); observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
}

// Plain text that leaves the screen (PDFs, copied time sheets): translate each line.
export const trLines = (lines) => (CURRENT === 'en' ? lines : lines.map((l) => {
  const s = String(l);
  return s.startsWith('# ') ? '# ' + tr(s.slice(2)) : tr(s);
}));

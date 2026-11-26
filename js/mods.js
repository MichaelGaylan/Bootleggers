// Dish changes at the point of sale (RRA-149): NO, ADD and EXTRA on
// condiments and toppings (Gaylan, 2026-11-26: "burger with no mushrooms, add
// tomatoes, onions, extra cheese or no cheese; Nachos with no jalapeños").
//
// Only condiments and toppings from the list below change; menu items, sides
// and drinks are never swapped here. Every topping has its own price (the
// Admin sets them in Settings → Point of sale → Toppings; the starter list
// lives in js/brand.js posToppings). Gaylan, 2026-11-26: ADD and EXTRA charge
// the topping's price, NO takes the topping's price off, and the dish's line on
// the check shows the net difference, e.g. NO cheese (−$1.00) + EXTRA onions
// (+$0.50) = −$0.50. A dish never goes below $0.
//
// A change is { k: 'no' | 'add' | 'extra', n: 'Cheese', p: 1 } on the line's
// changes list. The line keeps its menu price in base, and price = base + charge.

import { esc, $$ } from './ui.js';
import { BRAND } from './config.js';

const r2 = (n) => Math.round(n * 100) / 100;
export const WORD = { no: 'NO', add: 'ADD', extra: 'EXTRA' };

// The topping list: the Admin's (Settings → Point of sale) or js/brand.js.
export function toppingList(P) {
  const own = Array.isArray(P?.toppings) ? P.toppings : null;
  const list = own || (BRAND.posToppings || []).map(([n, p]) => ({ n, p }));
  return list.filter((t) => t && String(t.n || '').trim()).map((t) => ({ n: String(t.n).trim(), p: Math.max(0, +t.p || 0) }));
}

// Is this topping already on the dish? (Gaylan, 2026-11-26: NO is only offered
// for toppings that come on the dish; a hot dog basket can't get NO pickles.)
// Comes from, in order: js/brand.js posToppingsOn for the dish's name; if the
// dish isn't listed there, posToppingsBySection for its menu section; plus any
// topping named in the dish's ingredients in Recipes. A dish with none of these
// offers only ADD.
const stem = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/(es|s)$/, '').trim();
export function onList(recipe) {
  const by = BRAND.posToppingsOn || {}, sec = BRAND.posToppingsBySection || {};
  return by[recipe?.name] || sec[recipe?.section] || [];
}
export function onDish(top, recipe) {
  if (onList(recipe).some((n) => stem(n) === stem(top))) return true;
  const words = (recipe?.ingredients || []).map((i) => i.item).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return !!stem(top) && words.includes(stem(top));
}

// Drinks and bar items don't get toppings.
export const canChangeLine = (x) => !!x && !x.kind && x.station !== 'Bar';

// What the changes do to the price: + every ADD and EXTRA, − every NO.
export function charge(changes) {
  const list = changes || [];
  const add = r2(list.filter((c) => c.k !== 'no').reduce((t, c) => t + (+c.p || 0), 0));
  const off = r2(list.filter((c) => c.k === 'no').reduce((t, c) => t + (+c.p || 0), 0));
  return { amount: r2(add - off), add, off };
}

// A line with new changes: price = base + adds − NOs, never below $0.
export function withChanges(x, changes) {
  const base = x.base ?? x.price;
  return { ...x, base, changes, price: Math.max(0, r2(base + charge(changes).amount)) };
}

// Words for the check and the ticket, NO first: "NO Mushrooms", "ADD Tomato".
const ORDER = { no: 0, add: 1, extra: 2 };
export const sorted = (changes) => [...(changes || [])].sort((a, b) => ORDER[a.k] - ORDER[b.k]);
export const changeWords = (changes) => sorted(changes).map((c) => `${WORD[c.k]} ${c.n}`);
// HTML with NO in red and ADD / EXTRA in bold (class pos-chg).
export const changesHtml = (changes) => sorted(changes).map((c) => `<span class="pos-chg chg-${c.k}"><b>${WORD[c.k]}</b> ${esc(c.n)}</span>`).join(' ');
// Same order on a check? Compare choices, note and changes.
export const modKey = (x) => JSON.stringify([x.mods || [], x.note || '', sorted(x.changes).map((c) => c.k + c.n)]);

// The picker: one row per topping. Toppings on the dish come first with No and
// Extra; the rest offer Add. state is a Map name → 'no' | 'add' | 'extra'.
export function toppingsHtml(list, recipe, state) {
  const money = (p) => (p > 0 ? `+$${p.toFixed(2)}` : 'free');
  const rows = list.map((t) => ({ ...t, on: onDish(t.n, recipe) })).sort((a, b) => b.on - a.on);
  return `<div class="tp-list">${rows.map((t) => `<div class="tp-row" data-tp="${esc(t.n)}"><span class="tp-n">${esc(t.n)}${t.on ? ' <small class="tp-on">on the dish</small>' : ''}<small class="tp-p">${money(t.p)}</small></span>
    <span class="tp-btns">${(t.on ? ['no', 'extra'] : ['add']).concat(state.get(t.n) && !(t.on ? ['no', 'extra'] : ['add']).includes(state.get(t.n)) ? [state.get(t.n)] : []).map((k) => `<button type="button" data-k="${k}" class="${state.get(t.n) === k ? 'on k-' + k : ''}">${k === 'no' ? 'No' : k === 'add' ? 'Add' : 'Extra'}</button>`).join('')}</span></div>`).join('')}</div>
    <p class="tp-sum muted small" id="tp-sum"></p>`;
}
// Wire the picker inside el. onChange(changes) runs after every tap.
export function wireToppings(el, list, state, onChange) {
  const price = Object.fromEntries(list.map((t) => [t.n, t.p]));
  const changes = () => [...state].map(([n, k]) => ({ k, n, p: price[n] || 0 }));
  const sum = () => {
    const box = el.querySelector('#tp-sum'); if (!box) return;
    const ch = changes(), c = charge(ch);
    box.textContent = ch.length ? `${changeWords(ch).join(' · ')} · ${c.amount < 0 ? '−' : '+'}$${Math.abs(c.amount).toFixed(2)} on the dish` : 'No and Extra are for what comes on the dish; Add is for anything else. Add and Extra cost the price shown; No takes it off.';
  };
  $$('.tp-row', el).forEach((row) => $$('button', row).forEach((b) => b.onclick = () => {
    const n = row.dataset.tp, k = b.dataset.k;
    if (state.get(n) === k) state.delete(n); else state.set(n, k);
    $$('button', row).forEach((y) => y.className = state.get(n) === y.dataset.k ? 'on k-' + y.dataset.k : '');
    sum(); onChange?.(changes());
  }));
  sum();
  return changes;
}

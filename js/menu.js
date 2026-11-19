// The Bootleggers menu, as sent by the Host on 2026-11-19.
// applyMenu() adds each item to the Recipe archive once, under its menu
// section with its menu price, and brings the stock list in line with it.

import * as data from './data.js';
import * as store from './store.js';
import { STARTER_STOCK, REPLACED_STOCK } from './starter-stock.js';

export const MENU_VERSION = '2026-11-19';

export const MENU = [
  { section: 'Appetizers', items: [
    ['Fried Mushrooms', '7.99'], ['Fried Pickles', '7.99'], ['Mozzarella Sticks', '7.99'], ['Tots', '6.49'], ['Fries', '5.50'],
    ['Nachos (Half)', '6.99'], ['Nachos (Full)', '10.99'], ['Quesadilla', '11.99'], ['Single Taco (No Side)', '5.99'],
    ['Tortilla Chips & Salsa', '4.49'],
  ] },
  { section: 'Baskets', items: [
    ['Chicken Finger Basket with Fries', '14.49'], ['Hot Dog Basket with Side', '6.99'], ['Taco Basket with Side', '11.99'], ['Wing Basket', '14.99'],
  ] },
  { section: 'Jumbo Wings', items: [
    ['5 Jumbo Wings (Bone-In)', '9.99'], ['10 Jumbo Wings (Bone-In)', '17.99'], ['15 Jumbo Wings (Bone-In)', '25.99'],
    ['20 Jumbo Wings (Bone-In)', '33.99'], ['30 Jumbo Wings (Bone-In)', '48.99'], ['50 Jumbo Wings (Bone-In)', '80.99'],
  ] },
  { section: 'Burgers', items: [
    ['Black & Blue with Fries', '14.99'], ['Classic Burger with Fries', '11.99'], ['Farmhouse Burger with Fries', '15.99'],
    ['Quesadilla Burger with Fries', '15.99'], ['Some Like it Hot with Fries', '14.99'], ['The Bootlegger with Fries', '17.49'],
    ['Veggie Burger with Fries', '13.99'],
  ] },
  { section: 'Sandwiches', items: [
    ['Bacon Ranch Chicken Sandwich with Fries', '14.99'], ['BLT with Fries', '10.99'], ['Buffalo Chicken Sandwich (or Wrap) with Fries', '15.99'],
    ['Chicken Sandwich with Fries', '14.99'], ['Grilled Cheese with Fries', '9.99'], ['Grilled Cheese Club with Fries', '13.99'],
    ['Mile High Club with Fries', '15.49'], ['Philly Melt with Fries', '13.99'], ['The Grilled Cheese Incident with Fries', '14.49'],
  ] },
  { section: 'Salads', items: [
    ['Buffalo Salad', '15.59'], ['Caesar Salad', '9.99'], ['Chef Salad', '15.99'], ['House Salad', '10.99'], ['Side Salad', '6.99'], ['Tex Mex Salad', '15.99'],
  ] },
  { section: 'Extra Sauce', items: [
    ['Ranch Small', '0.50'], ['Ranch Large', '1.00'], ['Blue Cheese Small', '0.50'], ['Blue Cheese Large', '1.00'],
    ['BBQ Sauce Small', '0.50'], ['BBQ Sauce Large', '1.00'], ['Honey Mustard Small', '0.50'], ['Honey Mustard Large', '1.00'],
    ['Honey Sriracha Small', '0.50'], ['Honey Sriracha Large', '1.00'], ['Mild Buffalo Small', '0.50'], ['Mild Buffalo Large', '1.00'],
    ['Med Buffalo Small', '0.50'], ['Med Buffalo Large', '1.00'], ['Hot Buffalo Small', '0.50'], ['Hot Buffalo Large', '1.00'],
    ['Italian Dressing Small', '0.50'], ['Italian Dressing Large', '1.00'], ['Ketchup Small', '0.50'], ['Ketchup Large', '1.00'],
    ['Mayo Small', '0.50'], ['Mayo Large', '1.00'], ['Mustard Small', '0.50'], ['Sour Cream Small', '0.50'], ['Sour Cream Large', '1.00'],
  ] },
  { section: 'N/A Beverages', items: [
    ['Bottle Water', '2.00'], ['Coca-Cola', '2.75'], ['Cranberry Juice', '2.75'], ['Diet Coke', '2.75'], ['Ginger Ale', '2.75'],
    ['Orange Juice', '2.75'], ['Pineapple Juice', '2.75'], ['Red Bull', '4.25'], ['Red Bull Sugar Free', '4.25'], ['Sprite', '2.75'],
    ['Sweet Tea', '2.75'], ['Unsweet Tea', '2.75'],
  ] },
];

export const MENU_SECTIONS = MENU.map((m) => m.section);
const OLD_DEFAULT_SECTIONS = ['Wings', 'Burgers', 'Sandwiches', 'Baskets', 'Salads', 'Appetizers', 'Sides', 'Desserts'];
const key = (s) => String(s || '').trim().toLowerCase();

// Runs once per menu version, on the Host phone (or on a phone-only setup).
export async function applyMenu({ shared = false, host = false } = {}) {
  if (shared && !host) return;
  if ((await store.get('menu'))?.version === MENU_VERSION) return;

  // Menu sections: the menu's own, plus any custom section still in use.
  const recipes = await data.list('recipe');
  const settings = await data.settings();
  const used = new Set(recipes.filter((r) => r.kind === 'dish').map((r) => r.section));
  const keep = (settings.sections || []).filter((s) => !MENU_SECTIONS.includes(s) && (used.has(s) || !OLD_DEFAULT_SECTIONS.includes(s)));
  await data.saveSettings({ ...settings, sections: [...MENU_SECTIONS, ...keep] });

  // Dishes: add what's missing, update the price and section of what's there.
  const byName = new Map(recipes.filter((r) => r.kind === 'dish').map((r) => [key(r.name), r]));
  let order = 0;
  for (const m of MENU) {
    for (const [name, price] of m.items) {
      order += 1;
      const r = byName.get(key(name));
      if (!r) {
        await data.put('recipe', { kind: 'dish', name, section: m.section, price, menuOrder: order, ingredients: [], steps: [], uses: [], comments: [] });
      } else if (r.price !== price || r.section !== m.section || r.menuOrder !== order) {
        await data.put('recipe', { ...r, price, section: m.section, menuOrder: order });
      }
    }
  }

  // Stock: add items the menu needs, and drop starter items it replaced
  // (only while they are still untouched: no count, par, vendor or price).
  const stock = await data.list('stock');
  const have = new Set(stock.map((s) => key(s.name)));
  for (const g of STARTER_STOCK) {
    for (const [name, unit] of g.items) {
      if (!have.has(key(name))) await data.put('stock', { name, unit: unit || 'each', group: g.group, par: 0, onHand: 0, vendor: '', price: '' });
    }
  }
  for (const s of stock) {
    if (REPLACED_STOCK.includes(s.name) && !s.par && !s.onHand && !s.vendor && !s.price) await data.remove('stock', s.id);
  }
  await store.put('menu', { version: MENU_VERSION, at: Date.now() });
}

// Preset vendors (RRA-044): common food-service suppliers for what Bootleggers
// stocks. Added once on the Host phone; edit or take out any you don't use.
export const PRESET_VENDORS = [
  ['Sysco', 'Broadline: proteins, frozen, dairy, produce, dry goods, paper'],
  ['US Foods', 'Broadline: proteins, frozen, dairy, produce, dry goods, paper'],
  ['Performance Foodservice (PFG)', 'Broadline: wings, burgers, fryer items, paper'],
  ['Gordon Food Service', 'Broadline and Gordon stores: frozen, dairy, dry goods'],
  ["Restaurant Depot", 'Cash and carry: anything short between deliveries'],
  ["Sam's Club", 'Cash and carry: drinks, snacks, paper, cleaning'],
  ['Coca-Cola bottler', 'Coca-Cola, Diet Coke, Sprite, Ginger Ale, juices'],
  ['Red Bull distributor', 'Red Bull, Red Bull Sugar Free'],
  ['Ecolab', 'Dish machine chemicals, sanitizer, cleaning'],
  ['Cintas', 'Linens, towels, aprons, mats, first aid'],
];
const VENDOR_PRESET_VERSION = 1;

export async function applyVendors({ shared = false, host = false } = {}) {
  if (shared && !host) return;
  if (((await store.get('vendor-presets'))?.version || 0) >= VENDOR_PRESET_VERSION) return;
  const have = new Set((await data.list('vendor')).map((v) => key(v.name)));
  for (const [name, carries] of PRESET_VENDORS) {
    if (!have.has(key(name))) await data.put('vendor', { name, carries, deadline: '', contact: '', preset: true });
  }
  await store.put('vendor-presets', { version: VENDOR_PRESET_VERSION, at: Date.now() });
}

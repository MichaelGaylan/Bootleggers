// Starter stock list (RRA-024). The items themselves are restaurant-specific,
// so they live in js/brand.js (starterStock, RRA-123); this file keeps the
// tab layout and helpers every restaurant shares.

const BRAND = globalThis.BRAND;

export const STOCK_STATUS = BRAND.stockStatus || '';

export const STARTER_STOCK = BRAND.starterStock || [];

// Tabs at the top of Stock (RRA-058). Food covers every group not listed here.
export const NON_FOOD = ['Cleaning and chemicals', 'Paper and to-go', 'Smallwares', 'Linens and uniforms'];
// RRA-115: no All tab; the count opens on the first group.
export const STOCK_TABS = [['food', 'Food and bar'], ['Cleaning and chemicals', 'Cleaning'], ['Paper and to-go', 'Paper and to-go'], ['Smallwares', 'Smallwares'], ['Linens and uniforms', 'Linens and uniforms']];
export const isFood = (group) => !NON_FOOD.includes(group);

// Starter items the 2026-11-19 menu update split or renamed. applyMenu()
// removes them from a phone's list only while they are still untouched.
export const REPLACED_STOCK = BRAND.replacedStock || [];

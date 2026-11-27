// Roles and permissions (RRA-002).
// The Admin is the app's administrator: full control, above every role, and
// nobody can lower it. Everyone else starts from their role's defaults, and
// the Admin (or anyone allowed to change Settings) can switch each area to
// none / see / change for that person in Settings → Roles and permissions.

import { session } from './ui.js';

export const AREAS = {
  recipes: 'Recipes',
  prep: 'Prep lists',
  stock: 'Stock counts',
  orders: 'Order guides and vendors',
  schedule: 'Schedule',
  board: 'Message board',
  events: 'Events (BEOs)',
  costs: 'Costs and waste',
  settings: 'Settings',
  pos: 'Point of sale (orders, kitchen screen)', // RRA-101
  coupons: 'Coupons (make and send)', // RRA-122. Putting one on a check only needs the POS.
};

// Pay and hours (RRA-055): for managers only, and only the Admin sets them.
export const PAY_AREAS = {
  timesheets: "Time sheets (everyone's hours)",
  payrates: 'Pay rates and pay totals',
  payrun: 'Submit payroll (RRA-095)',
  advances: 'Approve early pay (RRA-095)',
};

const ALL = (v) => Object.fromEntries(Object.keys(AREAS).map((k) => [k, v]));
const PAY_NONE = { timesheets: 'none', payrates: 'none', payrun: 'none', advances: 'none' };

export const ROLE_DEFAULTS = {
  // Managers review payroll by default; the Admin submits unless they allow it (RRA-095).
  manager: { ...ALL('change'), settings: 'change', timesheets: 'change', payrates: 'change', payrun: 'see', advances: 'change' },
  chef: { ...ALL('change'), schedule: 'see', settings: 'see', coupons: 'none', ...PAY_NONE },
  staff: { ...ALL('see'), prep: 'change', stock: 'change', board: 'change', costs: 'none', settings: 'none', pos: 'change', coupons: 'none', ...PAY_NONE },
};

export const isHost = () => session.profile?.role === 'owner';
// Time sheets with everyone's hours (RRA-055): managers and the Admin only,
// by access role. Staff and chefs see only their own time sheet.
// The Admin sets each manager's access to hours and pay in Roles and permissions.
export const canTime = () => isHost() || (session.profile?.role === 'manager' && level('timesheets') !== 'none');

// ---------------------------------------------------------------- view as (RRA-158)
// The Admin can look at the app as any job. Only what the screens show
// changes: app.js gives the screens a copy of the Admin's profile with the
// job's role, and myStaff() answers with a made-up staff record for that job.
let REAL = null; // the phone's real profile
let VIEW = null; // { title, role, staff }
export const setReal = (p) => { REAL = p; if (p?.role !== 'owner') VIEW = null; };
export const realAdmin = () => REAL?.role === 'owner';
export const viewAs = () => VIEW;
export function roleForTitle(title = '') {
  const t = String(title).toLowerCase();
  if (/manager|^gm$/.test(t)) return 'manager';
  if (/chef/.test(t)) return 'chef';
  return 'staff';
}
export function setViewAs(title) {
  if (!title || !realAdmin()) { VIEW = null; return; }
  const role = roleForTitle(title);
  VIEW = { title, role, staff: { id: '', name: REAL?.name || '', position: title, role, preview: true } };
}
// The profile the screens use: the real one, or the job being viewed.
export const shownProfile = (p) => (VIEW && p?.role === 'owner' ? { ...p, role: VIEW.role, viewAs: VIEW.title } : p);

// The staff record that belongs to this phone's person, if any.
export function myStaff() {
  if (VIEW) return VIEW.staff;
  const p = session.profile;
  if (!p) return null;
  return (session.staff || []).find((s) => s.iid && s.iid === p.iid) || (session.staff || []).find((s) => s.name === p.name) || null;
}

export function level(area, who = null) {
  const role = who ? who.role : session.profile?.role;
  if (role === 'owner') return 'change';
  if (area in PAY_AREAS && role !== 'manager') return 'none'; // never for staff or chefs
  const perms = who ? who.perms : myStaff()?.perms;
  const lv = perms?.[area] || ROLE_DEFAULTS[role]?.[area] || ROLE_DEFAULTS.staff[area] || 'none';
  // Job views (RRA-132): staff see only the parts of the app their job uses.
  if (role === 'staff' && lv !== 'none') {
    const j = jobAreas(who || myStaff());
    const need = AREA_JOB[area];
    if (j && need && !need.some((k) => j.includes(k))) return 'none';
  }
  return lv;
}

// ---------------------------------------------------------------- job views (RRA-132)
// Each job title has its own set of screens. Only people with the Staff role
// are limited this way; chefs, managers and the Admin see what their role
// allows, as before. The Admin edits a job's screens in Job titles.
export const JOB_AREAS = {
  seating: 'Seating: seat guests',
  orders: 'Take orders and payments',
  tables: 'Clear tables',
  kitchen: 'Kitchen tickets',
  bar: 'Bar tickets',
  recipes: 'Recipes',
  prep: 'Prep lists',
  stock: 'Stock counts and order guides',
  schedule: 'Schedule',
  board: 'Bulletin board',
  events: 'Events (BEOs)',
  music: 'Music',
};
// Which job screens open each permission area (perms AREAS)
const AREA_JOB = { recipes: ['recipes'], prep: ['prep'], stock: ['stock'], orders: ['stock'], schedule: ['schedule'], board: ['board'], events: ['events'], pos: ['seating', 'orders', 'tables', 'kitchen', 'bar'] };
export function defaultJobAreas(title = '') {
  const t = String(title).toLowerCase();
  if (/manager|lead/.test(t)) return Object.keys(JOB_AREAS); // RRA-160
  if (/bus|porter/.test(t)) return ['tables', 'board', 'schedule'];
  if (/event/.test(t)) return ['events', 'recipes', 'board', 'schedule'];
  if (/driver/.test(t)) return ['kitchen', 'orders', 'board', 'schedule'];
  if (/barback/.test(t)) return ['bar', 'tables', 'stock', 'board', 'schedule'];
  if (/bar/.test(t)) return ['seating', 'orders', 'tables', 'bar', 'board', 'schedule', 'music'];
  if (/host/.test(t)) return ['seating', 'tables', 'board', 'schedule', 'music'];
  if (/server|wait|front|cashier/.test(t)) return ['seating', 'orders', 'tables', 'board', 'schedule'];
  if (/runner|expo/.test(t)) return ['kitchen', 'tables', 'board', 'schedule'];
  if (/dish/.test(t)) return ['kitchen', 'prep', 'board', 'schedule'];
  return ['kitchen', 'recipes', 'prep', 'stock', 'board', 'schedule']; // cooks and anything else
}
let JOB_VIEWS = {};
export const setJobViews = (v) => { JOB_VIEWS = v && typeof v === 'object' ? v : {}; };
// The job screens for a staff person, or null when they aren't limited.
export function jobAreas(st = myStaff()) {
  const role = st === myStaff() ? session.profile?.role : st?.role;
  if (role !== 'staff') return null;
  const title = st?.position || '';
  return Array.isArray(JOB_VIEWS[title]) ? JOB_VIEWS[title] : defaultJobAreas(title);
}
export const jobAllows = (k, st) => { const j = jobAreas(st); return !j || j.includes(k); };

export const canSee = (area) => level(area) !== 'none';
export const canChange = (area) => level(area) === 'change';

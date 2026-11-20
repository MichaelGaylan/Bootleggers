// Roles and permissions (RRA-002).
// The Host is the app's administrator: full control, above every role, and
// nobody can lower it. Everyone else starts from their role's defaults, and
// the Host (or anyone allowed to change Settings) can switch each area to
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
};

const ALL = (v) => Object.fromEntries(Object.keys(AREAS).map((k) => [k, v]));

export const ROLE_DEFAULTS = {
  manager: { ...ALL('change'), settings: 'change' },
  chef: { ...ALL('change'), schedule: 'see', settings: 'see' },
  staff: { ...ALL('see'), prep: 'change', stock: 'change', board: 'change', costs: 'none', settings: 'none' },
};

export const isHost = () => session.profile?.role === 'owner';
// Time sheets with everyone's hours (RRA-055): managers and the Host only,
// by access role. Staff and chefs see only their own time sheet.
export const canTime = () => isHost() || session.profile?.role === 'manager';

// The staff record that belongs to this phone's person, if any.
export function myStaff() {
  const p = session.profile;
  if (!p) return null;
  return (session.staff || []).find((s) => s.iid && s.iid === p.iid) || (session.staff || []).find((s) => s.name === p.name) || null;
}

export function level(area, who = null) {
  const role = who ? who.role : session.profile?.role;
  if (role === 'owner') return 'change';
  const perms = who ? who.perms : myStaff()?.perms;
  return perms?.[area] || ROLE_DEFAULTS[role]?.[area] || ROLE_DEFAULTS.staff[area] || 'none';
}

export const canSee = (area) => level(area) !== 'none';
export const canChange = (area) => level(area) === 'change';

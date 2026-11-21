// Settings (RRA-029) and roles and permissions (RRA-002).

import * as data from './data.js';
import { $, $$, esc, view, sheet, toast, setTitle, setChrome, session, THEMES, getTheme, setTheme } from './ui.js';
import { AREAS, PAY_AREAS, ROLE_DEFAULTS, level, canChange, canSee, isHost } from './perms.js';
import { ROLES, can as canAccess, canChangeRole, makeRoleChange, rotatePayKey } from './access.js';
import { staffList } from './schedule.js';
import { INACTIVITY_DAYS } from './config.js';
import * as sync from './sync.js';

export async function settingsView() {
  setChrome({ tab: 'more', back: true });
  setTitle('Settings');
  const s = await data.settings();
  const counts = {
    staff: (await data.list('staff')).length,
    vendors: (await data.list('vendor')).length,
    stock: (await data.list('stock')).length,
  };
  const edit = canChange('settings');
  const full = canSee('settings') || isHost();
  const theme = getTheme();
  view.innerHTML = `
    <div class="section-label">Appearance · this device</div>
    <div class="segmented" id="theme" role="radiogroup" aria-label="Appearance">${Object.entries(THEMES).map(([k, v]) => `<button type="button" role="radio" aria-checked="${k === theme}" data-theme-opt="${k}" class="${k === theme ? 'on' : ''}">${v}</button>`).join('')}</div>
    <p class="muted small">Match device follows your phone's or iPad's own light and dark setting. The moon button at the top switches between light and dark in one tap. This choice is saved on this device only.</p>
    ${full ? `<div class="section-label">People</div>
    <div class="group">
      <a class="row" href="#/staff"><span class="grow">Staff</span><span class="meta">${counts.staff}</span></a>
      <a class="row" href="#/roles"><span class="grow">Roles and permissions</span></a>
      ${canAccess(session.profile, 'invite') ? '<a class="row" href="#/team"><span class="grow">Invite and approve phones</span></a>' : ''}
    </div>
    <div class="section-label">Kitchen</div>
    <div class="group">
      <a class="row" href="#/vendors"><span class="grow">Vendors</span><span class="meta">${counts.vendors}</span></a>
      <a class="row" href="#/stock-items"><span class="grow">Stock items</span><span class="meta">${counts.stock}</span></a>
      <a class="row" href="#/list/stations"><span class="grow">Prep stations</span><span class="meta">${esc((s.stations || []).slice(0, 3).join(', '))}</span></a>
      <a class="row" href="#/list/sections"><span class="grow">Menu sections</span><span class="meta">${(s.sections || []).length}</span></a>
    </div>
    <div class="section-label">App</div>
    <div class="group">
      <div class="row"><span class="grow">Popups for new notices</span><button class="toggle ${s.popups !== false ? 'on' : ''}" id="popups" type="button" ${edit ? '' : 'disabled'} aria-label="Popups for new notices"></button></div>
      <div class="row"><span class="grow">Food cost target</span><span class="meta">${s.foodCostTarget || 30}%</span>${edit ? '<button class="btn plain small" id="target" type="button">Change</button>' : ''}</div>
      <div class="row"><span class="grow">Shared team data</span><span class="meta">${esc(syncLabel())}</span></div>
      <div class="row"><span class="grow">Lock after no use</span><span class="meta">${INACTIVITY_DAYS} days</span></div>
      <a class="row" href="#/about"><span class="grow">About</span></a>
      <a class="row" href="#/report"><span class="grow">Report a problem</span></a>
    </div>
    <p class="muted small center">${edit ? 'You can change Settings.' : 'Only the Admin, and people the Admin allows, can change Settings.'}</p>` : ''}`;
  $$('[data-theme-opt]', view).forEach((b) => { b.onclick = () => { setTheme(b.dataset.themeOpt); settingsView(); }; });
  $('#popups')?.addEventListener('click', async () => { if (!edit) return; s.popups = s.popups === false; await data.saveSettings(s); settingsView(); });
  $('#target')?.addEventListener('click', async () => {
    const v = await sheet({
      title: 'Food cost target', right: 'Save',
      body: `<label class="field"><span>Percent of menu price</span><input type="text" inputmode="numeric" id="t" value="${s.foodCostTarget || 30}"></label>`,
      onMount: (api) => { api.onRight = () => api.close(+$('#t', api.el).value || 30); },
    });
    if (v) { s.foodCostTarget = v; await data.saveSettings(s); settingsView(); }
  });
}

function syncLabel() {
  const st = sync.status();
  return { off: 'Not set up (this phone only)', starting: 'Connecting…', on: 'Connected, encrypted', nokey: 'Needs a new invite', error: 'Problem: ' + st.detail }[st.state] || st.state;
}

// Editable list of names: prep stations, menu sections.
const LISTS = { stations: 'Prep stations', sections: 'Menu sections' };
export async function listView(key) {
  if (!LISTS[key]) { location.hash = '#/settings'; return; }
  setChrome({ tab: 'more', back: true });
  setTitle(LISTS[key]);
  const s = await data.settings();
  const arr = s[key] || [];
  const edit = canChange('settings');
  view.innerHTML = `
    <div class="group">${arr.map((n, i) => `<div class="row">${edit ? `<button class="rm" type="button" data-rm="${i}" aria-label="Remove ${esc(n)}">−</button>` : ''}<span class="grow">${esc(n)}</span></div>`).join('') || '<div class="row muted">None yet.</div>'}</div>
    ${edit ? `<label class="field"><span>Add</span><input type="text" id="n"></label><button class="btn tonal block" id="add" type="button">+ Add</button>` : ''}`;
  $('#add')?.addEventListener('click', async () => { const n = $('#n').value.trim(); if (!n || arr.includes(n)) return; s[key] = [...arr, n]; await data.saveSettings(s); listView(key); });
  $$('[data-rm]', view).forEach((b) => { b.onclick = async () => { s[key] = arr.filter((_, i) => i !== +b.dataset.rm); await data.saveSettings(s); listView(key); }; });
}

// After a manager is moved down (RRA-066): a new pay key for the Admin
// devices and the remaining managers, then every hour and rate sealed again.
async function newPayKeyAfterDemotion(exceptId) {
  const set = await data.settings();
  const { pk, payBox } = await rotatePayKey(set);
  await data.saveSettings({ ...set, payPub: pk.pub, payBox });
  for (const m of (await staffList()).filter((x) => x.role === 'manager' && x.id !== exceptId && x.dev)) {
    await data.put('staff', { ...m, grant: await makeRoleChange(session.profile, m, 'manager'), grantRole: 'manager' });
  }
  for (const c of ['punch', 'payrate']) for (const d of await data.list(c)) await data.put(c, d);
  localStorage.removeItem('blg.backupAt'); // the old Admin backup has the old pay key
  toast('New pay key made. Make a new Admin backup.');
}

// ------------------------------------------------------------ roles (RRA-002)

export async function rolesView() {
  setChrome({ tab: 'more', back: true });
  setTitle('Roles and permissions');
  const staff = await staffList();
  const set = await data.settings();
  view.innerHTML = `
    <div class="group">
      <a class="row" href="#/person/host"><span class="grow"><span class="title">Admin</span><span class="sub">App administrator · full control</span></span></a>
      ${staff.map((s) => `<a class="row" href="#/person/${s.id}"><span class="grow"><span class="title">${esc(s.name)}</span><span class="sub">${esc(ROLES[s.role] || 'Staff')}${s.perms ? ' · custom' : ''}</span></span></a>`).join('')}
    </div>
    <p class="muted small">The Admin is above every other role, and nobody can lower or remove it. Everyone else starts from their role. Tap a person to change their role or what they can see or change.</p>
    ${isHost() ? `<div class="group"><div class="row"><span class="grow">Managers can move people between Staff and Chef</span><button class="toggle ${set.mgrRoles !== false ? 'on' : ''}" id="mgr-roles" type="button" aria-label="Managers can move people between Staff and Chef"></button></div></div>
    <p class="muted small">Only you can make someone a Manager or move a Manager down.</p>` : ''}`;
  $('#mgr-roles')?.addEventListener('click', async () => { set.mgrRoles = set.mgrRoles === false; await data.saveSettings(set); rolesView(); });
}

export async function personView(id) {
  setChrome({ tab: 'more', back: true });
  if (id === 'host') {
    setTitle('Admin');
    view.innerHTML = `
      <p><span class="chip">Admin · full control</span></p>
      <div class="card small">The Admin can see and change everything, set everyone's permissions, hand out invites and change Settings. This can't be lowered. The Admin is the phone whose key is built into the app.</div>
      <div class="group">${[...Object.values(AREAS), ...Object.values(PAY_AREAS)].map((a) => `<div class="row"><span class="grow">${a}</span><span class="meta">Change</span></div>`).join('')}</div>`;
    return;
  }
  const s = await data.get('staff', id);
  if (!s) { location.hash = '#/roles'; return; }
  const edit = canChange('settings') && (isHost() || s.role !== 'manager' || session.profile.role === 'manager');
  setTitle(s.name);
  const opts = ['none', 'see', 'change'];
  const names = { none: 'No', see: 'See', change: 'Change' };
  const set = await data.settings();
  const mgrMay = set.mgrRoles !== false;
  const roleOpts = ['staff', 'chef', 'manager'].filter((r) => r !== s.role && canChangeRole(session.profile, s, r, mgrMay));
  const pending = s.grant && s.grantRole && s.grantRole === s.role && !s.grantSeen;
  view.innerHTML = `
    <p><span class="chip">${esc(ROLES[s.role] || 'Staff')}</span> ${s.perms ? '<span class="chip warn">Custom</span>' : ''}</p>
    ${roleOpts.length ? '<button class="btn tonal block" id="role" type="button">Change role</button>' : ''}
    ${!s.dev && (isHost() || session.profile.role === 'manager') ? '<p class="muted small">Change role works once this person has opened the app on their phone.</p>' : ''}
    ${pending ? `<p class="muted small">Sent: ${esc(s.name)}'s phone switches to ${esc(ROLES[s.role])} the next time it opens the app.</p>` : ''}
    <div class="group">${Object.entries(AREAS).map(([k, a]) => {
      const cur = level(k, s);
      return `<div class="row"><span class="grow">${a}</span>
        <div class="segmented" style="margin:0;width:170px;flex:none">${opts.map((o) => `<button type="button" data-k="${k}" data-v="${o}" class="${cur === o ? 'on' : ''}" ${edit ? '' : 'disabled'}>${names[o]}</button>`).join('')}</div></div>`;
    }).join('')}</div>
    <div class="section-label">Pay and hours · set by the Admin</div>
    <div class="group">${Object.entries(PAY_AREAS).map(([k, a]) => {
      const cur = level(k, s);
      return s.role === 'manager' ? `<div class="row"><span class="grow">${a}</span>
        <div class="segmented" style="margin:0;width:170px;flex:none">${opts.map((o) => `<button type="button" data-k="${k}" data-v="${o}" class="${cur === o ? 'on' : ''}" ${isHost() ? '' : 'disabled'}>${names[o]}</button>`).join('')}</div></div>`
        : `<div class="row"><span class="grow">${a}</span><span class="meta">Managers only</span></div>`;
    }).join('')}</div>
    <p class="muted small">${s.role === 'manager' ? (isHost() ? 'Only you, the Admin, can change these. See lets a manager look; Change lets them fix punches or set rates.' : 'Only the Admin can change these.') : 'Staff and chefs only ever see their own hours, never anyone else\'s or any pay rates.'}</p>
    ${edit && s.perms ? '<button class="btn plain block" id="reset" type="button">Reset to role defaults</button>' : ''}
    <p class="muted small">Starting point for ${esc(ROLES[s.role] || 'Staff')}: ${Object.entries(ROLE_DEFAULTS[s.role] || ROLE_DEFAULTS.staff).filter(([, v]) => v === 'change').map(([k]) => AREAS[k]).join(', ') || 'see only'} can be changed.</p>`;
  $('#role')?.addEventListener('click', async () => {
    const to = await sheet({
      title: `Change ${s.name}'s role`, right: 'Change',
      body: `<p class="small">Now: <b>${esc(ROLES[s.role] || 'Staff')}</b></p>
        <div class="group">${roleOpts.map((r, i) => `<label class="row"><input type="radio" name="to" value="${r}" ${i === 0 ? 'checked' : ''}> <span class="grow">${ROLES[r]}</span></label>`).join('')}</div>
        <p class="muted small">${s.role === 'manager' ? 'Moving a manager down takes away hours, pay rates and inviting. The app also makes a new pay key and gives it only to the remaining managers.' : 'Their phone gets the new role and its permissions the next time it opens the app. Custom permissions you set for this person are cleared.'}${roleOpts.includes('manager') ? ' A new manager also gets the pay key for hours and pay rates, with the access you set below.' : ''}</p>`,
      onMount: (api) => { api.onRight = () => api.close($('input[name=to]:checked', api.el)?.value); },
    });
    if (!to) return;
    const from = s.role;
    try {
      const grant = await makeRoleChange(session.profile, s, to, mgrMay);
      const next = { ...s, role: to, grant, grantRole: to };
      delete next.grantSeen; delete next.perms;
      if (to === 'manager') next.position = 'Manager';
      else if (from === 'manager' && next.position === 'Manager') next.position = to === 'chef' ? 'Chef' : 'Line cook';
      await data.put('staff', next);
      if (from === 'manager' && isHost()) await newPayKeyAfterDemotion(next.id);
      toast(`${s.name} is now ${ROLES[to]}`);
    } catch (e) { toast(e.message); }
    personView(id);
  });
  $$('[data-k]', view).forEach((b) => {
    b.onclick = async () => {
      if (b.dataset.k in PAY_AREAS && !isHost()) return;
      s.perms = { ...(s.perms || {}), [b.dataset.k]: b.dataset.v };
      await data.put('staff', s);
      personView(id);
    };
  });
  $('#reset')?.addEventListener('click', async () => {
    // Pay and hours settings stay unless the Admin resets them.
    const keep = !isHost() && s.perms ? Object.fromEntries(Object.entries(s.perms).filter(([k]) => k in PAY_AREAS)) : null;
    if (keep && Object.keys(keep).length) { s.perms = keep; await data.put('staff', s); toast('Back to role defaults'); personView(id); return; }
    delete s.perms; await data.put('staff', s); toast('Back to role defaults'); personView(id); });
}

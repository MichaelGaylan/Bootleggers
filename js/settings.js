// Settings (RRA-029) and roles and permissions (RRA-002).

import * as data from './data.js';
import { $, $$, esc, view, sheet, toast, setTitle, setChrome, session } from './ui.js';
import { AREAS, ROLE_DEFAULTS, level, canChange, isHost } from './perms.js';
import { ROLES, can as canAccess } from './access.js';
import { staffList } from './schedule.js';
import { INACTIVITY_DAYS } from './config.js';

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
  view.innerHTML = `
    <div class="section-label">People</div>
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
      <div class="row"><span class="grow">Lock after no use</span><span class="meta">${INACTIVITY_DAYS} days</span></div>
      <a class="row" href="#/about"><span class="grow">About</span></a>
      <a class="row" href="#/report"><span class="grow">Report a problem</span></a>
    </div>
    <p class="muted small center">${edit ? 'You can change Settings.' : 'Only the Host, and people the Host allows, can change Settings.'}</p>`;
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

// ------------------------------------------------------------ roles (RRA-002)

export async function rolesView() {
  setChrome({ tab: 'more', back: true });
  setTitle('Roles and permissions');
  const staff = await staffList();
  view.innerHTML = `
    <div class="group">
      <a class="row" href="#/person/host"><span class="grow"><span class="title">Host</span><span class="sub">App administrator · full control</span></span></a>
      ${staff.map((s) => `<a class="row" href="#/person/${s.id}"><span class="grow"><span class="title">${esc(s.name)}</span><span class="sub">${esc(ROLES[s.role] || 'Staff')}${s.perms ? ' · custom' : ''}</span></span></a>`).join('')}
    </div>
    <p class="muted small">The Host is above every other role, and nobody can lower or remove it. Everyone else starts from their role. Tap a person to change what they can see or change.</p>`;
}

export async function personView(id) {
  setChrome({ tab: 'more', back: true });
  if (id === 'host') {
    setTitle('Host');
    view.innerHTML = `
      <p><span class="chip">Host · full control</span></p>
      <div class="card small">The Host can see and change everything, set everyone's permissions, hand out invites and change Settings. This can't be lowered. The Host is the phone whose key is built into the app.</div>
      <div class="group">${Object.values(AREAS).map((a) => `<div class="row"><span class="grow">${a}</span><span class="meta">Change</span></div>`).join('')}</div>`;
    return;
  }
  const s = await data.get('staff', id);
  if (!s) { location.hash = '#/roles'; return; }
  const edit = canChange('settings') && (isHost() || s.role !== 'manager' || session.profile.role === 'manager');
  setTitle(s.name);
  const opts = ['none', 'see', 'change'];
  const names = { none: 'No', see: 'See', change: 'Change' };
  view.innerHTML = `
    <p><span class="chip">${esc(ROLES[s.role] || 'Staff')}</span> ${s.perms ? '<span class="chip warn">Custom</span>' : ''}</p>
    <div class="group">${Object.entries(AREAS).map(([k, a]) => {
      const cur = level(k, s);
      return `<div class="row"><span class="grow">${a}</span>
        <div class="segmented" style="margin:0;width:170px;flex:none">${opts.map((o) => `<button type="button" data-k="${k}" data-v="${o}" class="${cur === o ? 'on' : ''}" ${edit ? '' : 'disabled'}>${names[o]}</button>`).join('')}</div></div>`;
    }).join('')}</div>
    ${edit && s.perms ? '<button class="btn plain block" id="reset" type="button">Reset to role defaults</button>' : ''}
    <p class="muted small">Starting point for ${esc(ROLES[s.role] || 'Staff')}: ${Object.entries(ROLE_DEFAULTS[s.role] || ROLE_DEFAULTS.staff).filter(([, v]) => v === 'change').map(([k]) => AREAS[k]).join(', ') || 'see only'} can be changed.</p>`;
  $$('[data-k]', view).forEach((b) => {
    b.onclick = async () => {
      s.perms = { ...(s.perms || {}), [b.dataset.k]: b.dataset.v };
      await data.put('staff', s);
      personView(id);
    };
  });
  $('#reset')?.addEventListener('click', async () => { delete s.perms; await data.put('staff', s); toast('Back to role defaults'); personView(id); });
}

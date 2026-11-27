// View as (RRA-158): the Admin can see the app the way any job sees it
// (Gaylan, 2026-11-27): Manager, Chef, Bartender, Busser, Host stand, Server,
// Prep cook, Line cook or any job title the team made. Only the screens change:
// the Admin's own phone, key, role and permissions stay exactly as they are,
// and a bar at the top always says who you are viewing as, with Back to Admin.
// The time clock is off while viewing, so no hours are made for the preview.

import { $, esc, sheet, LS } from './ui.js';
import { realAdmin, setViewAs, viewAs, roleForTitle } from './perms.js';
import { positionList } from './schedule.js';

const ROLE_WORD = { manager: 'Manager role', chef: 'Chef role', staff: 'Staff role' };

// Pick a job to view as. Returns true when the view changed.
export async function viewAsSheet() {
  if (!realAdmin()) return false;
  const titles = await positionList();
  const cur = viewAs()?.title || '';
  const rows = [['', 'Admin (you)', 'Full control']].concat(titles.map((x) => [x, x, ROLE_WORD[roleForTitle(x)]]));
  const pick = await sheet({
    title: 'View as', right: null, left: 'Close',
    body: `<p class="muted small" style="margin-top:0">See the app the way each job sees it: the same tabs, buttons and permissions. Your own Admin role doesn't change, and a bar at the top always takes you back.</p>
      <div class="group">${rows.map(([k, label, sub]) => `<button class="row" type="button" data-va="${esc(k)}"><span class="grow"><span class="title">${esc(label)}</span><span class="sub">${esc(sub)}</span></span>${k === cur ? '<b style="color:var(--accent)">✓</b>' : ''}</button>`).join('')}</div>`,
    onMount(api) { api.el.querySelectorAll('[data-va]').forEach((b) => { b.onclick = () => api.close({ title: b.dataset.va }); }); },
  });
  if (!pick) return false;
  startViewAs(pick.title || null);
  return true;
}

export function startViewAs(title) {
  setViewAs(title);
  LS.set('viewAs', title || null);
  location.hash = title ? '#/lounge' : '#/more';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

// The bar at the top while viewing as a job.
export function viewAsBar() {
  let bar = document.getElementById('va-bar');
  const v = viewAs();
  if (!v) { bar?.remove(); document.body.classList.remove('has-va'); return; }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'va-bar'; bar.className = 'va-bar'; bar.setAttribute('role', 'status');
    document.body.appendChild(bar);
  }
  bar.innerHTML = `<span class="grow"><b>👁 <span>Viewing as</span> <span>${esc(v.title)}</span></b><small>Preview. What you change here is saved for real.</small></span>
    <button class="btn small tonal" type="button" id="va-switch">Switch</button><button class="btn small" type="button" id="va-back">Back to Admin</button>`;
  $('#va-back', bar).onclick = () => startViewAs(null);
  $('#va-switch', bar).onclick = () => viewAsSheet();
  document.body.classList.add('has-va');
}

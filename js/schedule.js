// Staff scheduling (RRA-009) and the staff list (Settings → Staff).

import * as data from './data.js';
import { $, $$, esc, view, sheet, toast, setTitle, setChrome, session } from './ui.js';
import { canChange, myStaff, isHost } from './perms.js';
import { ROLES } from './access.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const POSITIONS = ['Chef', 'Line cook', 'Prep cook', 'Dishwasher', 'Server', 'Bartender', 'Host stand', 'Manager'];
export const staffList = async () => (await data.list('staff')).sort(data.byName);

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return data.isoDate(new Date(y, m - 1, d + n));
}
const label = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' }); };

export async function scheduleView() {
  setChrome({ tab: 'more', back: true });
  const change = canChange('schedule');
  const wk = scheduleView.week || data.weekStart();
  const staff = await staffList();
  const week = (await data.get('week', wk)) || { id: wk, shifts: {}, published: false };
  const me = myStaff();
  const swaps = (await data.list('swap')).filter((s) => s.status === 'asked').sort((a, b) => a.at - b.at);
  setTitle('Schedule', change ? `<button class="btn plain small" id="pub" type="button">${week.published ? 'Unpublish' : 'Publish'}</button>` : '');
  const visible = change || week.published;
  view.innerHTML = `
    <div class="segmented"><button type="button" data-w="-7">‹ Last</button><button type="button" class="on">${label(wk)}–${label(addDays(wk, 6))}</button><button type="button" data-w="7">Next ›</button></div>
    ${change && !week.published ? '<div class="hint small">Draft: staff can\'t see this week until you tap Publish.</div>' : ''}
    ${visible ? `<div style="overflow-x:auto"><table class="sched"><tr><th></th>${DAYS.map((d, i) => `<th>${d}<br><span class="muted">${addDays(wk, i).slice(8)}</span></th>`).join('')}</tr>
      ${staff.map((s) => `<tr${me && me.id === s.id ? ' class="me"' : ''}><td>${esc(s.name.split(' ')[0])}</td>${DAYS.map((_, i) => {
        const v = week.shifts?.[s.id]?.[i] || '';
        return `<td${change ? ` data-s="${s.id}" data-d="${i}" style="cursor:pointer"` : ''}>${v ? `<span class="shift">${esc(v)}</span>` : change ? '<span class="muted">+</span>' : ''}</td>`;
      }).join('')}</tr>`).join('')}</table></div>` : '<div class="empty">This week isn\'t published yet.</div>'}
    ${!staff.length ? `<div class="empty">No staff yet.${change ? ' Add people below.' : ''}</div>` : ''}
    ${swaps.length ? `<div class="section-label">Swap requests</div><div class="group">${swaps.map((r) => `
      <div class="row" data-swap="${r.id}"><span class="grow"><span class="title">${esc(r.fromName)} asks ${esc(r.toName || 'anyone')} to cover</span><span class="sub">${esc(r.day)}${r.note ? ' · ' + esc(r.note) : ''}</span></span>
      ${change ? '<button class="btn small" data-ok type="button">OK</button><button class="btn danger small" data-no type="button">No</button>' : '<span class="chip warn">Waiting</span>'}</div>`).join('')}</div>` : ''}
    <div class="group" style="margin-top:14px">
      ${me && week.published ? '<button class="row nav" id="ask" type="button"><span class="grow">Ask for a shift swap</span></button>' : ''}
      ${change ? `<a class="row" href="#/staff"><span class="grow">Add or remove staff</span><span class="meta">${staff.length}</span></a>` : ''}
      ${staff.length ? '<button class="row nav" id="print-weeks" type="button"><span class="grow">Print schedule</span></button>' : ''}
    </div>
    <p class="muted small center">${change ? 'Tap a day to set a shift, like 10-6 or 4-cl (close).' : 'Ask a manager about changes.'}</p>`;
  $$('[data-w]', view).forEach((b) => { b.onclick = () => { scheduleView.week = addDays(wk, +b.dataset.w); scheduleView(); }; });
  $('#print-weeks')?.addEventListener('click', async () => {
    const n = await sheet({
      title: 'Print schedule', right: 'Next',
      body: `<p class="small">Starts with the week of ${label(wk)}.</p>
        <label class="field"><span>How many weeks?</span><select id="pw-n">${[1, 2, 3, 4, 6, 8].map((x) => `<option value="${x}"${x === 2 ? ' selected' : ''}>${x} week${x > 1 ? 's' : ''}</option>`).join('')}</select></label>`,
      onMount: (api) => { api.onRight = () => api.close(+$('#pw-n', api.el).value); },
    });
    if (n) location.hash = `#/schedule-print/${wk}~${n}`;
  });
  $('#pub')?.addEventListener('click', async () => { week.published = !week.published; await data.put('week', week); toast(week.published ? 'Published' : 'Back to draft'); scheduleView(); });
  $$('[data-s]', view).forEach((td) => {
    td.onclick = async () => {
      const s = staff.find((x) => x.id === td.dataset.s); const d = +td.dataset.d;
      const cur = week.shifts?.[s.id]?.[d] || '';
      const v = await sheet({
        title: `${s.name} · ${DAYS[d]} ${label(addDays(wk, d))}`, right: 'Save',
        body: `<label class="field"><span>Shift</span><input type="text" id="sh" value="${esc(cur)}" placeholder="e.g. 10-6, 4-cl, off"></label>
          <div class="btn-row">${['8-2', '10-6', '11-7', '4-cl'].map((x) => `<button class="btn tonal small" type="button" data-q="${x}">${x}</button>`).join('')}</div>
          <button class="btn plain block" type="button" data-q="">Clear</button>`,
        onMount: (api) => {
          $$('[data-q]', api.el).forEach((b) => { b.onclick = () => api.close({ v: b.dataset.q }); });
          api.onRight = () => api.close({ v: $('#sh', api.el).value.trim() });
        },
      });
      if (!v) return;
      week.shifts ||= {}; week.shifts[s.id] ||= Array(7).fill('');
      week.shifts[s.id][d] = v.v;
      await data.put('week', week);
      scheduleView();
    };
  });
  $('#ask')?.addEventListener('click', async () => {
    const mine = DAYS.map((d, i) => ({ d, i, v: week.shifts?.[me.id]?.[i] })).filter((x) => x.v);
    const r = await sheet({
      title: 'Ask for a swap', right: 'Send',
      body: `<label class="field"><span>Which shift?</span><select id="sw-d">${mine.map((x) => `<option value="${x.i}">${x.d} ${label(addDays(wk, x.i))} · ${esc(x.v)}</option>`).join('') || '<option>No shifts this week</option>'}</select></label>
        <label class="field"><span>Who could cover?</span><select id="sw-to"><option value="">Anyone</option>${staff.filter((s) => s.id !== me.id).map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Note</span><input type="text" id="sw-n"></label>`,
      onMount: (api) => { api.onRight = () => { const i = +$('#sw-d', api.el).value; if (!mine.length) return; const to = $('#sw-to', api.el).value; api.close({ i, to, note: $('#sw-n', api.el).value.trim() }); }; },
    });
    if (!r) return;
    const x = mine.find((m) => m.i === r.i);
    await data.put('swap', { week: wk, dayIndex: r.i, day: `${x.d} ${label(addDays(wk, r.i))} · ${x.v}`, from: me.id, fromName: me.name, to: r.to, toName: staff.find((s) => s.id === r.to)?.name || '', note: r.note, status: 'asked', at: Date.now() });
    toast('Swap request sent');
    scheduleView();
  });
  $$('[data-swap]', view).forEach((row) => {
    const r = swaps.find((x) => x.id === row.dataset.swap);
    $('[data-ok]', row)?.addEventListener('click', async () => {
      const w = (await data.get('week', r.week)) || { id: r.week, shifts: {} };
      if (r.to) {
        w.shifts[r.to] ||= Array(7).fill('');
        w.shifts[r.to][r.dayIndex] = w.shifts[r.from]?.[r.dayIndex] || '';
        if (w.shifts[r.from]) w.shifts[r.from][r.dayIndex] = '';
        await data.put('week', w);
      }
      r.status = 'approved'; await data.put('swap', r);
      toast(r.to ? 'Swap approved and the schedule updated' : 'Approved. Assign the cover on the schedule.');
      scheduleView();
    });
    $('[data-no]', row)?.addEventListener('click', async () => { r.status = 'declined'; await data.put('swap', r); scheduleView(); });
  });
}

// ------------------------------------------------------------ staff (Settings)

export async function staffView() {
  setChrome({ tab: 'more', back: true });
  setTitle('Staff');
  const staff = await staffList();
  const change = canChange('schedule') || canChange('settings');
  view.innerHTML = `
    <div class="group">${staff.map((s) => `<div class="row">${change ? `<button class="rm" type="button" data-rm="${s.id}" aria-label="Remove ${esc(s.name)}">−</button>` : ''}
      <span class="grow"${change ? ` data-edit="${s.id}" style="cursor:pointer"` : ''}><span class="title">${esc(s.name)}</span><span class="sub">${esc(s.position || '')} · ${esc(ROLES[s.role] || 'Staff')}</span></span></div>`).join('') || '<div class="row muted">No staff yet.</div>'}</div>
    ${change ? '<button class="btn tonal block" id="add" type="button">+ Add staff</button>' : ''}
    <p class="muted small">Staff appear on the schedule. To give someone the app on their phone, send an invite from Settings → Invite and approve phones. Removing someone takes them off the schedule${isHost() ? '; to end their app access now, also withdraw their invite' : ''}.</p>`;
  $('#add')?.addEventListener('click', () => staffDialog());
  $$('[data-edit]', view).forEach((el) => { el.onclick = () => staffDialog(staff.find((s) => s.id === el.dataset.edit)); });
  $$('[data-rm]', view).forEach((b) => {
    b.onclick = async () => {
      const s = staff.find((x) => x.id === b.dataset.rm);
      const ok = await sheet({ title: 'Remove staff?', right: 'Remove', body: `<p>Remove <b>${esc(s.name)}</b> from the staff list and the schedule?</p>` });
      if (ok) { await data.remove('staff', s.id); toast('Removed'); staffView(); }
    };
  });
}

async function staffDialog(existing) {
  const s = existing ? { ...existing } : { name: '', position: 'Line cook', role: 'staff' };
  const ok = await sheet({
    title: existing ? 'Staff member' : 'Add staff', right: 'Save',
    body: `<label class="field"><span>Name</span><input type="text" id="st-n" value="${esc(s.name)}" placeholder="Name as it appears on their invite"></label>
      <label class="field"><span>Position</span><select id="st-p">${POSITIONS.map((p) => `<option ${p === s.position ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
      <label class="field"><span>App role</span><select id="st-r">${['staff', 'chef', 'manager'].map((r) => `<option value="${r}" ${r === s.role ? 'selected' : ''}>${ROLES[r]}</option>`).join('')}</select></label>`,
    onMount: (api) => { api.onRight = () => { const n = $('#st-n', api.el).value.trim(); if (!n) return; Object.assign(s, { name: n, position: $('#st-p', api.el).value, role: $('#st-r', api.el).value }); api.close(true); }; },
  });
  if (!ok) return;
  await data.put('staff', s);
  staffView();
}

export async function ensureStaffFor(profile) {
  // The person using this phone is on the staff list once they have access.
  if (!profile || profile.role === 'owner') return;
  const staff = await staffList();
  if (staff.some((s) => (s.iid && s.iid === profile.iid) || s.name === profile.name)) return;
  await data.put('staff', { name: profile.name, position: profile.role === 'manager' ? 'Manager' : profile.role === 'chef' ? 'Chef' : 'Line cook', role: profile.role, iid: profile.iid });
}

// ------------------------------------------------- print several weeks (RRA-042)

export async function schedulePrintView(arg = '') {
  setChrome({ tab: 'more', back: true });
  setTitle('Print schedule');
  const [start = data.weekStart(), n = '2'] = arg.split('~');
  const count = Math.min(8, Math.max(1, +n || 1));
  const change = canChange('schedule');
  const staff = await staffList();
  const weeks = [];
  for (let i = 0; i < count; i++) {
    const id = addDays(start, i * 7);
    weeks.push((await data.get('week', id)) || { id, shifts: {}, published: false });
  }
  view.innerHTML = `
    <div class="paper">
      <h3>Bootleggers schedule</h3>
      <div class="paper-meta">${label(start)} to ${label(addDays(start, count * 7 - 1))} · printed ${new Date().toLocaleDateString()}</div>
      ${weeks.map((w) => `<div class="week">
        <p style="margin:12px 0 0"><b>Week of ${label(w.id)}</b>${w.published ? '' : ' <i>(draft, not published)</i>'}</p>
        ${w.published || change ? `<table class="sched-print"><tr><th></th>${DAYS.map((d, i) => `<th>${d} ${addDays(w.id, i).slice(8)}</th>`).join('')}</tr>
          ${staff.map((s) => `<tr><td>${esc(s.name)}</td>${DAYS.map((_, i) => `<td>${esc(w.shifts?.[s.id]?.[i] || '')}</td>`).join('')}</tr>`).join('')}</table>`
          : '<p class="small">Not published yet.</p>'}
      </div>`).join('')}
      <div class="paper-foot">Bootleggers Bar &amp; Grill</div>
    </div>
    <button class="btn block no-print" id="print" type="button" style="margin-top:14px">Print</button>
    <p class="muted small center no-print">On a phone, choose a printer from the share sheet, or save as PDF.</p>`;
  $('#print').onclick = () => window.print();
}

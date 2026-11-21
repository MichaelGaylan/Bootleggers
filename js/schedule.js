// Staff scheduling (RRA-009) and the staff list (Settings → Staff).

import * as data from './data.js';
import { $, $$, esc, view, sheet, toast, setTitle, setChrome, session, isWide, LS } from './ui.js';
import { canChange, myStaff, isHost, canTime, level } from './perms.js';
import { ROLES, myEcdhPublic, myPublicKey } from './access.js';
import { printButtons, wirePrint } from './pdf.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const POSITIONS = ['Chef', 'Line cook', 'Prep cook', 'Dishwasher', 'Server', 'Bartender', 'Host stand', 'Manager'];
export const staffList = async () => (await data.list('staff')).sort(data.byName);

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return data.isoDate(new Date(y, m - 1, d + n));
}
// Role groups and colors for the schedule (RRA-052), from each person's position.
export const ROLE_GROUPS = [
  { k: 'Kitchen', l: 'K', c: 'teal', pos: ['Chef', 'Line cook', 'Prep cook', 'Dishwasher'] },
  { k: 'Bartender', l: 'B', c: 'orange', pos: ['Bartender'] },
  { k: 'Host', l: 'H', c: 'green', pos: ['Host stand'] },
  { k: 'Manager', l: 'M', c: 'purple', pos: ['Manager'] },
  { k: 'Server', l: 'S', c: 'blue', pos: ['Server'] },
  { k: 'Team', l: 'T', c: 'gray', pos: [] },
];
export const roleOf = (st) => ROLE_GROUPS.find((g) => g.pos.includes(st?.position)) || ROLE_GROUPS[ROLE_GROUPS.length - 1];
const roleByKey = (k) => ROLE_GROUPS.find((g) => g.k === k) || ROLE_GROUPS[ROLE_GROUPS.length - 1];
const isOff = (v) => /^(off|time ?off|pto|vac)/i.test(String(v || '').trim());
// A shift pill: role letter badge and times, or TIME OFF.
export const pill = (v, g) => (isOff(v) ? '<span class="spill off">TIME OFF</span>'
  : `<span class="spill c-${g.c}"><i>${g.l}</i><span>${esc(v)}</span></span>`);
const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// Hours in a shift like 10-6, 8-2, 4-cl or 10:30-4. Close (cl) counts as 11 PM;
// a start before 7 is in the afternoon (4-cl is 4 PM to close).
export function shiftHours(v) {
  if (!v || isOff(v)) return 0;
  const m = String(v).toLowerCase().match(/(\d{1,2})(?::(\d\d))?\s*(?:am?|pm?)?\s*[-–to ]+\s*(cl\w*|\d{1,2})(?::(\d\d))?/);
  if (!m) return 0;
  let a = +m[1] + (+m[2] || 0) / 60;
  if (a < 7) a += 12;
  let b = m[3].startsWith('cl') ? 23 : +m[3] + (+m[4] || 0) / 60;
  while (b <= a) b += 12;
  const h = b - a;
  return h > 0 && h <= 16 ? h : 0;
}

// RRA-078: why a swap can't simply go through. The person covering already
// works that day, has time off, or would go over 40 hours that week.
export function swapConflicts(r, week) {
  if (!r?.to || !week) return [];
  const out = [];
  const theirs = week.shifts?.[r.to] || [];
  const v = theirs[r.dayIndex];
  if (isOff(v)) out.push(`${r.toName || 'They'} has time off that day`);
  else if (v) out.push(`${r.toName || 'They'} already works that day (${v})`);
  const shift = week.shifts?.[r.from]?.[r.dayIndex] || '';
  const total = theirs.reduce((t, x, i) => t + (i === r.dayIndex ? 0 : shiftHours(x)), 0) + shiftHours(shift);
  if (total > 40) out.push(`${r.toName || 'They'} would work ${Math.round(total * 10) / 10} hours that week (over 40)`);
  return out;
}

async function approveSwap(r) {
  const w = (await data.get('week', r.week)) || { id: r.week, shifts: {} };
  w.shifts ||= {};
  if (r.to) {
    w.shifts[r.to] ||= Array(7).fill('');
    w.shifts[r.to][r.dayIndex] = w.shifts[r.from]?.[r.dayIndex] || '';
    if (w.shifts[r.from]) w.shifts[r.from][r.dayIndex] = '';
    await data.put('week', w);
  }
  r.status = 'approved'; r.decidedBy = session.profile?.name; await data.put('swap', r);
  toast(r.to ? 'Swap approved and the schedule updated' : 'Approved. Assign the cover on the schedule.');
}
async function declineSwap(r) { r.status = 'declined'; r.decidedBy = session.profile?.name; await data.put('swap', r); toast('Swap declined'); }

// Ask the requester a private question about their swap (uses RRA-075).
async function askAboutSwap(r) {
  const q = await sheet({
    title: `Ask ${r.fromName}`, right: 'Send',
    body: `<p class="muted small" style="margin-top:0">Only ${esc(r.fromName)} and you see this. It goes to their message board as a private message.</p>
      <textarea id="sq" style="min-height:80px" placeholder="e.g. Can you cover Thursday instead?"></textarea>`,
    onMount: (api) => { api.onRight = () => { const t = $('#sq', api.el).value.trim(); if (t) api.close(t); }; },
  });
  if (!q) return false;
  const { sendPost } = await import('./board.js');
  await sendPost({ text: `About your swap request (${r.day}): ${q}`, to: { kind: 'person', person: r.from }, about: { swap: r.id } });
  r.question = { at: Date.now(), by: session.profile?.name }; await data.put('swap', r);
  toast(`Question sent to ${r.fromName}`);
  return true;
}

// The pop-up a manager sees when they open the app and a swap request
// conflicts: Approve, Deny or Ask a question.
export async function swapConflictPopup(r, conflicts) {
  const act = await sheet({
    title: 'Swap request conflict', left: 'Later', right: null,
    body: `<p style="margin-top:0"><b>${esc(r.fromName)}</b> asks <b>${esc(r.toName)}</b> to cover <b>${esc(r.day)}</b>.${r.note ? `<br><span class="muted">"${esc(r.note)}"</span>` : ''}</p>
      <div class="hint small" style="color:var(--danger)">${conflicts.map((c) => esc(c)).join('<br>')}</div>
      ${r.question ? `<p class="muted small">You asked a question ${esc(new Date(r.question.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }))}.</p>` : ''}
      <div class="btn-row" style="margin-top:12px;flex-wrap:wrap">
        <button class="btn" type="button" data-a="ok">Approve</button>
        <button class="btn danger" type="button" data-a="no">Deny</button>
        <button class="btn tonal" type="button" data-a="ask">Ask a question</button>
      </div>`,
    onMount: (api) => { $$('[data-a]', api.el).forEach((b) => { b.onclick = () => api.close(b.dataset.a); }); },
  });
  if (act === 'ok') await approveSwap(r);
  else if (act === 'no') await declineSwap(r);
  else if (act === 'ask') await askAboutSwap(r);
  return act;
}

// On opening the app: managers get the conflicting swap requests they
// haven't dealt with; the requester gets a manager's question about theirs.
const laterThisVisit = new Set();
export async function swapPopups() {
  const seen = new Set(LS.get('swapSeen', []));
  const mark = (k) => { seen.add(k); LS.set('swapSeen', [...seen].slice(-200)); };
  if (canChange('schedule')) {
    for (const r of (await data.list('swap')).filter((s) => s.status === 'asked' && s.to).sort((a, b) => a.at - b.at)) {
      // Later: ask again next time the app opens. Asked a question: wait for the answer on the board.
      const key = `c:${r.id}`;
      if (seen.has(key) || laterThisVisit.has(r.id)) continue;
      const c = swapConflicts(r, await data.get('week', r.week));
      if (!c.length) continue;
      laterThisVisit.add(r.id);
      if (await swapConflictPopup(r, c) === 'ask') mark(key);
      return true;
    }
  }
  const { canSeePost, sentByMe, myId } = await import('./audience.js');
  const me = myId();
  for (const p of (await data.list('post')).filter((x) => x.about?.swap && x.to?.person === me && !sentByMe(x) && canSeePost(x))) {
    const key = `q:${p.id}`;
    if (seen.has(key)) continue;
    mark(key);
    const reply = await sheet({
      title: 'Question about your swap', left: 'Later', right: 'Reply',
      body: `<p style="margin-top:0"><b>${esc(p.by)}</b> asks:</p><div class="msg private" style="margin:0">${esc(p.text)}</div>
        <textarea id="sr" style="min-height:70px;margin-top:10px" placeholder="Your answer (only you and ${esc(p.by)} see it)"></textarea>`,
      onMount: (api) => { api.onRight = () => { const t = $('#sr', api.el).value.trim(); if (t) api.close(t); }; },
    });
    if (reply) {
      p.replies = [...(p.replies || []), { by: session.profile.name, byId: me, at: Date.now(), text: reply }];
      await data.put('post', p);
      toast('Reply sent');
    }
    return true;
  }
  return false;
}

const label = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric' }); };

export async function scheduleView() {
  setChrome({ tab: 'lounge', back: true });
  const change = canChange('schedule');
  const wk = scheduleView.week || data.weekStart();
  const staff = await staffList();
  const week = (await data.get('week', wk)) || { id: wk, shifts: {}, published: false };
  const me = myStaff();
  const swaps = (await data.list('swap')).filter((s) => s.status === 'asked').sort((a, b) => a.at - b.at);
  const conflictsOf = {};
  for (const r of swaps) conflictsOf[r.id] = swapConflicts(r, r.week === wk ? week : await data.get('week', r.week));
  setTitle('Schedule', change ? `<button class="btn plain small" id="pub" type="button">${week.published ? 'Unpublish' : 'Publish'}</button>` : '');
  const visible = change || week.published;
  week.open ||= Array.from({ length: 7 }, () => []);
  const today = DAYS.findIndex((_, i) => addDays(wk, i) === data.isoDate(new Date()));
  if (scheduleView.day === undefined || scheduleView.dayWeek !== wk) { scheduleView.day = Math.max(0, today); scheduleView.dayWeek = wk; }
  const day = scheduleView.day;
  // Staff grouped under their role band, in the order of ROLE_GROUPS.
  const bands = ROLE_GROUPS.map((g) => ({ g, people: staff.filter((st) => roleOf(st) === g) })).filter((b) => b.people.length);
  const cell = (st, i) => {
    const v = week.shifts?.[st.id]?.[i] || '';
    return v ? pill(v, roleOf(st)) : change ? '<span class="add">+</span>' : '';
  };
  const openCell = (i) => `${(week.open[i] || []).map((o, j) => `<button type="button" class="spill-btn" data-open="${i}:${j}">${pill(o.t, roleByKey(o.role))}</button>`).join('')}${change ? `<button type="button" class="add" data-addopen="${i}">+</button>` : ''}`;
  const who = (st) => `<span class="who"><span class="av c-${roleOf(st).c}">${esc(initials(st.name))}</span><span><b>${esc(st.name)}</b><small>${esc(st.position || 'No position set')}</small></span></span>`;
  // Tablet and computer: the week across the top (RRA-052).
  const weekGrid = () => `<div class="wtable-wrap"><table class="wsched">
    <thead><tr><th class="who-h">${staff.length} staff</th>${DAYS.map((d, i) => `<th${i === today ? ' class="today"' : ''}><b>${d}</b><span>${label(addDays(wk, i))}</span></th>`).join('')}</tr></thead>
    <tbody><tr class="open-row"><td><b>Open shifts</b></td>${DAYS.map((_, i) => `<td>${openCell(i)}</td>`).join('')}</tr></tbody>
    ${bands.map(({ g, people }) => `<tbody><tr class="band c-${g.c}"><td colspan="8">${g.k}</td></tr>
      ${people.map((st) => `<tr${me && me.id === st.id ? ' class="me"' : ''}><td>${who(st)}</td>${DAYS.map((_, i) => `<td${change ? ` data-s="${st.id}" data-d="${i}"` : ''}>${cell(st, i)}</td>`).join('')}</tr>`).join('')}</tbody>`).join('')}
  </table></div>`;
  // Phone: one day at a time with a day picker, same colors and badges.
  const dayList = () => `<div class="daypick">${DAYS.map((d, i) => `<button type="button" data-day="${i}" class="${i === day ? 'on' : ''}${i === today ? ' today' : ''}"><b>${d}</b><span>${addDays(wk, i).slice(8).replace(/^0/, '')}</span></button>`).join('')}</div>
    <div class="section-label">Open shifts</div>
    <div class="group"><div class="row open-day">${(week.open[day] || []).length || change ? openCell(day) : '<span class="muted small">None</span>'}</div></div>
    ${bands.map(({ g, people }) => `<div class="band-label c-${g.c}">${g.k}</div>
      <div class="group">${people.map((st) => `<div class="row${me && me.id === st.id ? ' me' : ''}"${change ? ` data-s="${st.id}" data-d="${day}"` : ''}>${who(st)}<span class="grow"></span>${cell(st, day) || '<span class="muted small">Off</span>'}</div>`).join('')}</div>`).join('')}`;
  view.innerHTML = `
    <div class="segmented"><button type="button" data-w="-7">‹ Last</button><button type="button" class="on">${label(wk)}–${label(addDays(wk, 6))}</button><button type="button" data-w="7">Next ›</button></div>
    ${change && !week.published ? '<div class="hint small">Draft: staff can\'t see this week until you tap Publish.</div>' : ''}
    ${visible && staff.length ? (isWide() ? weekGrid() : dayList()) : visible ? '' : '<div class="empty">This week isn\'t published yet.</div>'}
    ${!staff.length ? `<div class="empty">No staff yet.${change ? ' Add people below.' : ''}</div>` : ''}
    ${swaps.length ? `<div class="section-label">Swap requests</div><div class="group">${swaps.map((r) => `
      <div class="row" data-swap="${r.id}"><span class="grow"><span class="title">${esc(r.fromName)} asks ${esc(r.toName || 'anyone')} to cover${conflictsOf[r.id].length ? ' <span class="chip warn">Conflict</span>' : ''}</span><span class="sub">${esc(r.day)}${r.note ? ' · ' + esc(r.note) : ''}${conflictsOf[r.id].map((c) => `<br><span style="color:var(--danger)">${esc(c)}</span>`).join('')}</span></span>
      ${change ? `${conflictsOf[r.id].length ? '<button class="btn tonal small" data-q type="button">Ask</button>' : ''}<button class="btn small" data-ok type="button">OK</button><button class="btn danger small" data-no type="button">No</button>` : '<span class="chip warn">Waiting</span>'}</div>`).join('')}</div>` : ''}
    <div class="group" style="margin-top:14px">
      ${me && week.published ? '<button class="row nav" id="ask" type="button"><span class="grow">Ask for a shift swap</span></button>' : ''}
      ${change ? `<a class="row" href="#/staff"><span class="grow">Add or remove staff</span><span class="meta">${staff.length}</span></a>` : ''}
      ${staff.length ? '<button class="row nav" id="print-weeks" type="button"><span class="grow">Print schedule</span></button>' : ''}
    </div>
    <p class="muted small center">${change ? 'Tap a day to set a shift, like 10-6 or 4-cl (close), or time off. Colors follow each person\'s position in Staff.' : 'Ask a manager about changes.'}</p>`;
  $$('[data-day]', view).forEach((b) => { b.onclick = () => { scheduleView.day = +b.dataset.day; scheduleView(); }; });
  const saveWeek = async () => { await data.put('week', week); scheduleView(); };
  $$('[data-addopen]', view).forEach((b) => {
    b.onclick = async (e) => {
      e.stopPropagation();
      const d = +b.dataset.addopen;
      const r = await sheet({
        title: `Open shift · ${DAYS[d]} ${label(addDays(wk, d))}`, right: 'Add',
        body: `<label class="field"><span>Shift</span><input type="text" id="os-t" placeholder="e.g. 4-cl"></label>
          <label class="field"><span>Role</span><select id="os-r">${ROLE_GROUPS.map((g) => `<option value="${g.k}">${g.k}</option>`).join('')}</select></label>`,
        onMount: (api) => { api.onRight = () => { const t = $('#os-t', api.el).value.trim(); if (t) api.close({ t, role: $('#os-r', api.el).value }); }; },
      });
      if (!r) return;
      (week.open[d] ||= []).push(r);
      saveWeek();
    };
  });
  $$('[data-open]', view).forEach((b) => {
    b.onclick = async (e) => {
      e.stopPropagation();
      if (!change) { toast('Ask a manager to take this shift'); return; }
      const [d, j] = b.dataset.open.split(':').map(Number);
      const o = week.open[d][j];
      const fit = staff.filter((st) => roleOf(st).k === o.role);
      const r = await sheet({
        title: `Open shift · ${DAYS[d]} ${o.t}`, right: 'Assign',
        body: `<label class="field"><span>Give it to</span><select id="os-who">${[...fit, ...staff.filter((st) => !fit.includes(st))].map((st) => `<option value="${st.id}">${esc(st.name)} (${roleOf(st).k})</option>`).join('')}</select></label>
          <button class="btn plain block" type="button" id="os-del" style="color:var(--danger)">Remove open shift</button>`,
        onMount: (api) => {
          $('#os-del', api.el).onclick = () => api.close({ del: true });
          api.onRight = () => api.close({ id: $('#os-who', api.el).value });
        },
      });
      if (!r) return;
      week.open[d].splice(j, 1);
      if (r.id) { week.shifts ||= {}; week.shifts[r.id] ||= Array(7).fill(''); week.shifts[r.id][d] = o.t; }
      saveWeek();
    };
  });
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
          <div class="btn-row">${['8-2', '10-6', '11-7', '4-cl', 'Time off'].map((x) => `<button class="btn tonal small" type="button" data-q="${x}">${x}</button>`).join('')}</div>
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
    $('[data-ok]', row)?.addEventListener('click', async () => { await approveSwap(r); scheduleView(); });
    $('[data-no]', row)?.addEventListener('click', async () => { await declineSwap(r); scheduleView(); });
    $('[data-q]', row)?.addEventListener('click', async () => { await askAboutSwap(r); scheduleView(); });
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
  // Pay rates (RRA-055): managers and the Admin only, kept apart from the staff list.
  const seeRate = canTime() && level('payrates') !== 'none';
  const pay = seeRate && existing ? await data.get('payrate', existing.id) : null;
  let rate = pay?.rate ?? '';
  const ok = await sheet({
    title: existing ? 'Staff member' : 'Add staff', right: 'Save',
    body: `<label class="field"><span>Name</span><input type="text" id="st-n" value="${esc(s.name)}" placeholder="Name as it appears on their invite"></label>
      <label class="field"><span>Position</span><select id="st-p">${POSITIONS.map((p) => `<option ${p === s.position ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
      ${s.dev ? `<div class="field"><span>App role</span><div style="padding:10px 0"><b>${esc(ROLES[s.role] || 'Staff')}</b> <a href="#/person/${s.id}" class="small">Change role ›</a></div></div>`
        : `<label class="field"><span>App role</span><select id="st-r">${['staff', 'chef', 'manager'].map((r) => `<option value="${r}" ${r === s.role ? 'selected' : ''}>${ROLES[r]}</option>`).join('')}</select></label>`}
      ${seeRate ? `<label class="field"><span>Hourly rate (only managers the Admin allows see this)</span><input type="text" inputmode="decimal" id="st-rate" value="${esc(rate)}" placeholder="$ per hour"${canChange('payrates') ? '' : ' readonly'}></label>` : ''}`,
    onMount: (api) => { api.onRight = () => { const n = $('#st-n', api.el).value.trim(); if (!n) return; Object.assign(s, { name: n, position: $('#st-p', api.el).value, role: $('#st-r', api.el)?.value || s.role }); if ($('#st-rate', api.el)) rate = $('#st-rate', api.el).value.trim().replace('$', ''); api.close(true); }; },
  });
  if (!ok) return;
  await data.put('staff', s);
  if (seeRate && canChange('payrates') && String(rate) !== String(pay?.rate ?? '')) await data.put('payrate', { id: s.id, staffId: s.id, rate: rate === '' ? '' : +rate || 0 });
  staffView();
}

export async function ensureStaffFor(profile) {
  // The person using this phone is on the staff list once they have access.
  if (!profile || profile.role === 'owner') return;
  const staff = await staffList();
  const ek = await myEcdhPublic(); // so a manager's fix to my hours reaches this phone
  const dev = await myPublicKey(); // so the Admin can change my role (RRA-066)
  const mine = staff.find((s) => (s.iid && s.iid === profile.iid)) || staff.find((s) => s.name === profile.name);
  if (mine) { if (mine.ek !== ek || mine.dev !== dev || mine.iid !== profile.iid) await data.put('staff', { ...mine, ek, dev, iid: profile.iid }); return; }
  await data.put('staff', { name: profile.name, position: profile.role === 'manager' ? 'Manager' : profile.role === 'chef' ? 'Chef' : 'Line cook', role: profile.role, iid: profile.iid, ek, dev });
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
    ${printButtons()}`;
  const pad = (v, n) => String(v || '').slice(0, n).padEnd(n);
  wirePrint({
    $, mono: true, title: `Bootleggers schedule ${label(start)} to ${label(addDays(start, count * 7 - 1))}`,
    getLines: () => weeks.flatMap((w) => [
      `# Week of ${label(w.id)}${w.published ? '' : ' (draft)'}`,
      ...(w.published || change ? [
        pad('', 14) + DAYS.map((d, i) => pad(`${d} ${addDays(w.id, i).slice(8)}`, 9)).join(''),
        ...staff.map((s) => pad(s.name, 14) + DAYS.map((_, i) => pad(w.shifts?.[s.id]?.[i], 9)).join('')),
      ] : ['Not published yet.']),
      '',
    ]),
  });
}

// Employee lounge (RRA-053): the staff's home for the board, the schedule,
// today's tasks and the time clock. One tap from the landing page (RRA-054).
// Time clock and time sheets (RRA-055): staff clock in and out here; managers
// and the Host see everyone's hours compiled by week, can fix a missed punch,
// and print or send the time sheet for payroll.

import * as data from './data.js';
import { $, $$, esc, view, LS, sheet, toast, setTitle, setChrome, session, copy, isWide, chip } from './ui.js';
import { canChange, canSee, myStaff, isHost } from './perms.js';
import { unreadPosts } from './board.js';
import { staffList, roleOf, pill } from './schedule.js';
import { printButtons, wirePrint } from './pdf.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const H = 3600000;
const DAY = 24 * H;
const t = (ms) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const d = (ms) => new Date(ms).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
const hrs = (n) => `${(Math.round(n * 100) / 100).toFixed(2)} h`;
const dur = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; };
const weekMs = (iso) => { const [y, m, dd] = iso.split('-').map(Number); return new Date(y, m - 1, dd).getTime(); };
const addDays = (iso, n) => { const [y, m, dd] = iso.split('-').map(Number); return data.isoDate(new Date(y, m - 1, dd + n)); };
const label = (iso) => { const [y, m, dd] = iso.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString([], { month: 'short', day: 'numeric' }); };
const punchHours = (p) => ((p.out || Date.now()) - p.in) / H;
// Managers and the Host see everyone's time sheets.
export const canTime = () => isHost() || canChange('schedule') || canChange('settings');

const punches = async () => (await data.list('punch')).sort((a, b) => a.in - b.in);
const openPunch = (all, staffId) => all.find((p) => p.staffId === staffId && !p.out);
const inWeek = (p, wk) => p.in >= weekMs(wk) && p.in < weekMs(addDays(wk, 7));

async function clock(me, all) {
  const open = openPunch(all, me.id);
  if (open) {
    open.out = Date.now();
    await data.put('punch', open);
    toast(`Clocked out · ${dur(open.out - open.in)}`);
  } else {
    await data.put('punch', { staffId: me.id, name: me.name, in: Date.now(), out: null });
    toast(`Clocked in at ${t(Date.now())}`);
  }
}

// The landing-page button (RRA-054).
export async function loungeButton() {
  const me = myStaff();
  const open = me ? openPunch(await punches(), me.id) : null;
  const unread = await unreadPosts();
  return `<a class="lounge-btn" href="#/lounge">
    <span class="lounge-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 10h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <span class="grow"><b>Employee lounge</b><small>${open ? `On the clock since ${t(open.in)}` : 'Clock in · board · schedule · time sheet'}</small></span>
    ${unread ? `<i class="sbadge">${unread}</i>` : ''}<span class="chev">›</span></a>`;
}

// ------------------------------------------------------------ lounge

export async function loungeView() {
  setChrome({ tab: 'lounge' });
  setTitle('Employee lounge');
  const me = myStaff();
  const all = await punches();
  const wk = data.weekStart();
  const open = me ? openPunch(all, me.id) : null;
  const mine = me ? all.filter((p) => p.staffId === me.id && inWeek(p, wk)) : [];
  const week = (await data.get('week', wk)) || { shifts: {} };
  const todayIdx = (new Date().getDay() + 6) % 7;
  const myShifts = me && (week.published || canChange('schedule')) ? week.shifts?.[me.id] || [] : [];
  const unread = await unreadPosts();
  const posts = canSee('board') ? (await data.list('post')).filter((p) => p.channel !== 'managers').sort((a, b) => b.at - a.at).slice(0, 3) : [];
  const notices = (session.notices || []).slice(0, 1);
  const items = await data.list('prepitem');
  const done = (await data.get('prepday', data.today()))?.done || {};
  const nDone = items.filter((i) => done[i.id]).length;
  const swaps = canChange('schedule') ? (await data.list('swap')).filter((s) => s.status === 'asked').length : 0;
  const onClock = canTime() ? all.filter((p) => !p.out) : [];
  view.innerHTML = `<div class="lounge">
    <div class="card clock-card${open ? ' on' : ''}">
      ${me ? `<div class="clock-top"><div><div class="clock-state">${open ? 'On the clock' : 'Off the clock'}</div>
        <div class="muted small">${open ? `Since ${t(open.in)} · <span id="clock-run">${dur(Date.now() - open.in)}</span>` : `This week ${hrs(mine.reduce((s, p) => s + punchHours(p), 0))}`}</div></div>
        <button class="btn clock-btn${open ? ' out' : ''}" id="clock" type="button">${open ? 'Clock out' : 'Clock in'}</button></div>
        <a class="row nav" href="#/timesheet"><span class="grow">My time sheet</span><span class="meta">${hrs(mine.reduce((s, p) => s + punchHours(p), 0))} this week</span></a>`
    : `<p class="muted small" style="margin:0">${isHost() ? 'To use the time clock yourself, add your name in Settings → Staff (the same name as this phone).' : 'To use the time clock, ask a manager to add you in Settings → Staff with the same name as this phone.'}</p>`}
    </div>

    ${canSee('schedule') ? `<div class="card l-card"><div class="l-head"><b>My week</b><a href="#/schedule">Full schedule ›</a></div>
      ${me ? `<div class="myweek">${DAYS.map((dn, i) => `<div class="${i === todayIdx ? 'today' : ''}"><span>${dn}</span>${myShifts[i] ? pill(myShifts[i], roleOf(me)) : '<em>Off</em>'}</div>`).join('')}</div>`
      : '<p class="muted small">Your shifts show here once you are on the staff list.</p>'}
      ${me && !week.published && !canChange('schedule') ? '<p class="muted small">This week isn\'t published yet.</p>' : ''}
      ${swaps ? `<a class="row nav" href="#/schedule"><span class="grow">Swap requests</span>${chip(`${swaps} waiting`, 'orange')}</a>` : ''}</div>` : ''}

    ${canSee('prep') ? `<a class="card l-card l-link" href="#/prep"><div class="l-head"><b>Today's tasks</b><span class="chev">›</span></div>
      <div class="bar"><i style="width:${items.length ? Math.round((nDone / items.length) * 100) : 0}%"></i></div>
      <span class="muted small">${items.length ? `${nDone} of ${items.length} prep tasks done` : 'No prep tasks yet'}</span></a>` : ''}

    ${canSee('board') ? `<div class="card l-card"><div class="l-head"><b>Bulletin board</b><a href="#/board">${unread ? `${chip(`${unread} new`, 'orange')} ` : ''}Open ›</a></div>
      ${notices.map((n) => `<div class="l-post notice"><span class="who">${esc(n.from || 'Management')} · notice</span><b>${esc(n.title)}</b></div>`).join('')}
      ${posts.map((p) => `<a class="l-post" href="#/board"><span class="who">${esc(p.by)} · ${new Date(p.at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>${esc(p.text.slice(0, 140))}</a>`).join('') || (notices.length ? '' : '<p class="muted small">No posts yet.</p>')}
      ${canChange('board') ? `<div class="l-quick"><input type="text" id="l-post" placeholder="Write to everyone"><button class="btn small" id="l-send" type="button">Post</button></div>` : ''}</div>` : ''}

    ${canTime() ? `<div class="card l-card"><div class="l-head"><b>Time sheets</b><a href="#/timesheets">Everyone's hours ›</a></div>
      <span class="muted small">${onClock.length ? `On the clock now: ${onClock.map((p) => esc(p.name)).join(', ')}` : 'Nobody is on the clock right now.'}</span></div>` : ''}
  </div>`;
  $('#clock')?.addEventListener('click', async () => { await clock(me, all); loungeView(); });
  if (open) { clearInterval(loungeView.tick); loungeView.tick = setInterval(() => { const el = $('#clock-run'); if (el) el.textContent = dur(Date.now() - open.in); else clearInterval(loungeView.tick); }, 30000); }
  $('#l-send')?.addEventListener('click', async () => {
    const text = $('#l-post').value.trim();
    if (!text) return;
    await data.put('post', { text, by: session.profile.name, at: Date.now(), channel: 'all', replies: [] });
    toast('Posted to everyone');
    loungeView();
  });
}

// ------------------------------------------------------------ time sheets

function personBlock(st, ps, wk, edit) {
  const total = ps.reduce((s, p) => s + punchHours(p), 0);
  return { total, html: `<div class="group acc-body ts-body">${ps.map((p) => `<div class="row"${edit ? ` data-punch="${p.id}"` : ''}>
      <span class="grow"><span class="title">${d(p.in)}</span><span class="sub">${t(p.in)} – ${p.out ? t(p.out) : 'on the clock'}${p.editedBy ? ` · fixed by ${esc(p.editedBy)}` : ''}</span></span>
      <span class="meta">${p.out ? hrs(punchHours(p)) : chip('Open', 'green')}</span></div>`).join('') || '<div class="row muted">No punches this week.</div>'}
      ${edit ? `<button class="row nav" type="button" data-addpunch="${st.id}"><span class="grow" style="color:var(--accent)">+ Add a missed shift</span></button>` : ''}</div>` };
}

function lines(people, wk) {
  const out = [`Week of ${label(wk)} - ${label(addDays(wk, 6))}`, ''];
  let grand = 0;
  for (const { st, ps } of people) {
    const total = ps.reduce((s, p) => s + punchHours(p), 0);
    grand += total;
    out.push(`# ${st.name}${st.position ? ` (${st.position})` : ''}: ${hrs(total)}`);
    for (const p of ps) out.push(`   ${d(p.in).padEnd(16)} ${t(p.in).padStart(8)} - ${(p.out ? t(p.out) : 'open').padStart(8)}   ${hrs(punchHours(p))}`);
    out.push('');
  }
  out.push(`Total, all staff: ${hrs(grand)}`);
  return out;
}

// One person's own hours.
export async function timesheetView() {
  setChrome({ tab: 'lounge', back: true });
  setTitle('My time sheet');
  const me = myStaff();
  if (!me) { view.innerHTML = '<div class="empty">Ask a manager to add you to the staff list to use the time clock.</div>'; return; }
  const wk = timesheetView.week || data.weekStart();
  const ps = (await punches()).filter((p) => p.staffId === me.id && inWeek(p, wk));
  const { total, html } = personBlock(me, ps, wk, false);
  view.innerHTML = `${weekNav(wk)}
    <div class="ts-total card"><span class="muted small">Total this week</span><b>${hrs(total)}</b></div>
    ${html.replace('acc-body ', '')}
    <p class="muted small center">If a time is wrong, ask a manager to fix it.</p>`;
  wireWeek(wk, (w) => { timesheetView.week = w; timesheetView(); });
}

const weekNav = (wk) => `<div class="segmented"><button type="button" data-w="-7">‹ Last</button><button type="button" class="on">${label(wk)}–${label(addDays(wk, 6))}</button><button type="button" data-w="7">Next ›</button></div>`;
const wireWeek = (wk, go) => $$('[data-w]', view).forEach((b) => { b.onclick = () => go(addDays(wk, +b.dataset.w)); });

// Everyone's hours, compiled for managers and the Host.
export async function timesheetsView() {
  setChrome({ tab: 'lounge', back: true });
  setTitle('Time sheets');
  if (!canTime()) { location.hash = '#/lounge'; return; }
  const wk = timesheetsView.week || data.weekStart();
  const staff = await staffList();
  const all = (await punches()).filter((p) => inWeek(p, wk));
  const people = staff.map((st) => ({ st, ps: all.filter((p) => p.staffId === st.id) }));
  // Punches from someone no longer on the staff list still count.
  for (const p of all) if (!staff.some((s) => s.id === p.staffId)) {
    let g = people.find((x) => x.st.id === p.staffId);
    if (!g) { g = { st: { id: p.staffId, name: `${p.name} (removed)` }, ps: [] }; people.push(g); }
    g.ps.push(p);
  }
  const withHours = people.filter((x) => x.ps.length);
  const grand = all.reduce((s, p) => s + punchHours(p), 0);
  const dayHours = (ps, i) => ps.filter((p) => p.in >= weekMs(addDays(wk, i)) && p.in < weekMs(addDays(wk, i)) + DAY).reduce((s, p) => s + punchHours(p), 0);
  const open = LS.get('tsOpen', null);
  view.innerHTML = `${weekNav(wk)}
    <div class="ts-total card"><span class="muted small">All staff this week</span><b>${hrs(grand)}</b><span class="muted small">${withHours.length} of ${staff.length} people clocked in</span></div>
    ${isWide() ? `<div class="wtable-wrap"><table class="wtable"><thead><tr><th>Employee</th>${DAYS.map((dn, i) => `<th class="num">${dn} ${addDays(wk, i).slice(8)}</th>`).join('')}<th class="num">Total</th></tr></thead>
      <tbody>${people.map(({ st, ps }) => `<tr><td>${esc(st.name)}</td>${DAYS.map((_, i) => { const h = dayHours(ps, i); return `<td class="num">${h ? h.toFixed(2) : '<span class="muted">—</span>'}</td>`; }).join('')}<td class="num"><b>${hrs(ps.reduce((s, p) => s + punchHours(p), 0))}</b></td></tr>`).join('')}</tbody></table></div>
      <div class="section-label">Punches</div>` : ''}
    ${people.map(({ st, ps }) => { const b = personBlock(st, ps, wk, true); return `
      <button class="acc-head${open === st.id ? ' open' : ''}" type="button" data-g="${st.id}"><span class="grow">${esc(st.name)}</span><span class="meta">${hrs(b.total)}</span></button>
      ${b.html.replace('<div class="group acc-body ts-body">', `<div class="group acc-body ts-body"${open === st.id ? '' : ' hidden'}>`)}`; }).join('') || '<div class="empty">No staff yet.</div>'}
    ${printButtons()}
    <button class="btn plain block no-print" id="copy" type="button">Copy to send</button>
    <p class="muted small center">Tap a punch to fix a time. Totals count open punches up to now.</p>`;
  wireWeek(wk, (w) => { timesheetsView.week = w; timesheetsView(); });
  $$('.acc-head', view).forEach((h) => {
    h.onclick = () => {
      const opening = !h.classList.contains('open');
      $$('.acc-head', view).forEach((x) => { x.classList.remove('open'); x.nextElementSibling.hidden = true; });
      if (opening) { h.classList.add('open'); h.nextElementSibling.hidden = false; }
      LS.set('tsOpen', opening ? h.dataset.g : null);
    };
  });
  const title = `Time sheets - week of ${label(wk)}`;
  wirePrint({ $, title, mono: true, getLines: () => lines(withHours, wk) });
  $('#copy').onclick = () => copy(lines(withHours, wk).join('\n'), 'Time sheet copied');
  $$('[data-punch]', view).forEach((row) => { row.onclick = () => punchDialog(all.find((p) => p.id === row.dataset.punch)); });
  $$('[data-addpunch]', view).forEach((b) => {
    b.onclick = () => { const st = people.find((x) => x.st.id === b.dataset.addpunch).st; punchDialog(null, st, wk); };
  });
}

const timeVal = (ms) => { const x = new Date(ms); return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`; };
const at = (iso, hm) => { const [y, m, dd] = iso.split('-').map(Number); const [hh, mm] = hm.split(':').map(Number); return new Date(y, m - 1, dd, hh, mm).getTime(); };

async function punchDialog(p, st, wk) {
  const day = p ? data.isoDate(new Date(p.in)) : (data.today() >= wk && data.today() <= addDays(wk, 6) ? data.today() : wk);
  const r = await sheet({
    title: p ? `${p.name} · fix time` : `${st.name} · add shift`, right: 'Save',
    body: `<label class="field"><span>Day</span><input type="date" id="pu-d" value="${day}"></label>
      <div class="facts" style="background:none">
        <label class="field" style="margin:0"><span>Clock in</span><input type="time" id="pu-in" value="${p ? timeVal(p.in) : '10:00'}"></label>
        <label class="field" style="margin:0"><span>Clock out</span><input type="time" id="pu-out" value="${p?.out ? timeVal(p.out) : p ? '' : '18:00'}"></label>
      </div>
      <p class="muted small">Leave Clock out empty if they are still on the clock. A clock-out earlier than the clock-in counts as after midnight.</p>
      ${p ? '<button class="btn plain block" type="button" id="pu-del" style="color:var(--danger)">Delete this punch</button>' : ''}
      <p id="pu-err" class="small" style="color:var(--danger)"></p>`,
    onMount: (api) => {
      $('#pu-del', api.el)?.addEventListener('click', () => api.close({ del: true }));
      api.onRight = () => {
        const dd = $('#pu-d', api.el).value; const i = $('#pu-in', api.el).value; const o = $('#pu-out', api.el).value;
        if (!dd || !i) { $('#pu-err', api.el).textContent = 'Pick a day and a clock-in time.'; return; }
        const tin = at(dd, i);
        let tout = o ? at(dd, o) : null;
        if (tout !== null && tout <= tin) tout += DAY;
        api.close({ tin, tout });
      };
    },
  });
  if (!r) return;
  if (r.del) { await data.remove('punch', p.id); toast('Punch deleted'); return timesheetsView(); }
  const doc = p ? { ...p } : { staffId: st.id, name: st.name };
  Object.assign(doc, { in: r.tin, out: r.tout, editedBy: session.profile.name });
  await data.put('punch', doc);
  toast('Saved');
  timesheetsView();
}

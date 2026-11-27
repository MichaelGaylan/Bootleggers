// Store coupons (RRA-162): coupons a manager hands to one guest, kept in a
// register like Stock. Each has a number that is never reused (FS-0001,
// FS-0002…), the guest's name, a dollar amount, when and by whom it was
// issued, and a status: Outstanding, Redeemed or Void.
//
// The register is a list of promises, not money: an outstanding coupon is
// not on the books. Only when a coupon is redeemed on a closed check does its
// discount count, and then it goes to its own sales account, "Sales Discounts
// – Promotional Coupons" (js/brand.js storeCoupon.account), which takes gross
// sales down to net sales. It is not an operating expense and not food cost.
//
// Redeeming: on the POS check, Store coupon (or Add a coupon) takes the number
// typed or scanned from the coupon's barcode. The coupon is held for that
// check while it is open, so no other check can take it; taking it off the
// check lets it go again. When the check is paid and closed it is marked
// Redeemed with the date and time, check number, the purchase before
// discounts, the discount it gave and who put it on (authorized it). A
// redeemed or void coupon can never be used again, and no record is ever
// deleted (Clear test data leaves the register alone).
//
// Names and the data name come from js/brand.js (storeCoupon).

import * as data from './data.js';
import { $, $$, esc, view, LS, sheet, toast, setTitle, setChrome, copy, isWide, chip, searchBox, session } from './ui.js';
import { canSee, canChange, inMgmtJob, myStaff, isHost } from './perms.js';
import { SC, storeNo } from './coupons-core.js';
import { t, tr } from './i18n.js';
import { printButtons, wirePrint } from './pdf.js';
import { drawCoupon, sendPictures, toFile, startScanner } from './coupons.js';

const r2 = (n) => Math.round(n * 100) / 100;
const money = (n) => '$' + (+n || 0).toFixed(2);
const coll = () => SC().coll;
export const accountName = () => tr(SC().account); // shown in the reader's language
const when = (ms) => (ms ? new Date(ms).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');
const meId = () => myStaff()?.id || (isHost() ? 'admin' : session.profile?.iid || 'me');
const meName = () => session.profile?.name || 'Me';

// The register: management jobs and the Admin (like Invite and approve),
// within what Roles and permissions allows them.
export const canRegister = () => inMgmtJob() && canSee('storecoupons');
export const canIssue = () => inMgmtJob() && canChange('storecoupons');

export const allCoupons = () => data.list(coll());
const byNo = (list, no) => list.find((r) => r.no === no);

// Where a coupon stands right now.
//   out      outstanding: can be redeemed
//   held     on an open check (counts as outstanding in the register)
//   redeemed used on a closed check
//   void     cancelled by a manager
export function stateOf(r, checks = []) {
  if (r.status === 'redeemed' || r.status === 'void') return r.status;
  const k = r.hold && checks.find((c) => c.id === r.hold.checkId);
  if (k && (k.store || []).some((x) => x.id === r.id)) return k.closed ? 'redeemed' : 'held';
  return 'out';
}
const LABEL = { out: 'Outstanding', held: 'Outstanding', redeemed: 'Redeemed', void: 'Void' };
const COLOR = { out: 'green', held: 'orange', redeemed: 'blue', void: 'gray' };
const stChip = (s) => chip(LABEL[s], COLOR[s]);

// Next number: one more than the highest ever issued (records are never
// deleted, and the count is kept in the settings too), so numbers never repeat.
async function nextSeq(list) {
  const s = await data.settings();
  return Math.max(0, +s.storeCouponSeq || 0, ...list.map((r) => +r.seq || 0)) + 1;
}
const fmtNo = (n) => SC().prefix + String(n).padStart(SC().digits, '0');

// A check closed with a coupon on it, but the coupon wasn't marked yet (closed
// on another phone that went offline, say): mark it now from the check.
async function settle(list, checks) {
  for (const r of list) {
    if (r.status === 'redeemed' || r.status === 'void' || !r.hold) continue;
    const k = checks.find((c) => c.id === r.hold.checkId);
    if (k?.closed && (k.store || []).some((x) => x.id === r.id)) await markRedeemed(r, k);
  }
}

// ------------------------------------------------------------ POS

// The check is paid and closed: every store coupon on it is redeemed.
export async function redeemFromCheck(check) {
  for (const line of check.store || []) {
    const r = await data.get(coll(), line.id);
    if (r && r.status !== 'redeemed' && r.status !== 'void') await markRedeemed(r, check);
  }
}
async function markRedeemed(r, check) {
  const line = (check.store || []).find((x) => x.id === r.id) || {};
  await data.put(coll(), {
    ...r, status: 'redeemed', hold: null,
    redeemed: {
      at: check.closed || Date.now(), date: check.closedDate || data.today(),
      checkId: check.id, checkNo: check.no ?? '', checkName: check.name || '',
      purchase: r2(+check.storeSub || 0), discount: r2(+line.amount || 0),
      authBy: line.by || '', authByName: line.byName || '',
    },
  });
}

// Take a coupon off an open check; it can be used again.
export async function releaseStore(checkId, id) {
  const c = await data.get('check', checkId);
  if (c) await data.put('check', { ...c, store: (c.store || []).filter((x) => x.id !== id) });
  const r = await data.get(coll(), id);
  if (r && r.status !== 'redeemed' && r.hold?.checkId === checkId) await data.put(coll(), { ...r, hold: null });
}
// A check that is thrown away (Seated by mistake): let its coupons go.
export async function releaseAll(c) {
  for (const x of c.store || []) await releaseStore(c.id, x.id);
}

// Can this number go on this check? → { r } or { error }.
async function check(no, checkId) {
  const [list, checks] = await Promise.all([allCoupons(), data.list('check')]);
  const r = byNo(list, no);
  if (!r) return { error: t('No store coupon with the number {0}.', no) };
  const s = stateOf(r, checks);
  if (s === 'void') return { error: t('{0} was voided. It can\'t be used.', no) };
  if (s === 'redeemed') {
    const d = r.redeemed || {};
    return { error: d.at ? t('{0} was already redeemed on {1}, check #{2}. A coupon can only be used once.', no, when(d.at), d.checkNo) : t('{0} was already redeemed. A coupon can only be used once.', no) };
  }
  if (s === 'held') return r.hold.checkId === checkId ? { error: t('{0} is already on this check.', no) } : { error: t('{0} is already on check #{1}.', no, r.hold.checkNo) };
  const here = checks.find((c) => c.id === checkId);
  if ((here?.store || []).length) return { error: t('This check already has store coupon {0}. One per check.', here.store[0].no) };
  return { r };
}

async function apply(checkId, r) {
  const c = await data.get('check', checkId);
  const at = Date.now();
  const line = { id: r.id, no: r.no, value: r2(+r.amount || 0), customer: r.customer || '', by: meId(), byName: meName(), at };
  await data.put('check', { ...c, store: [...(c.store || []).filter((x) => x.id !== r.id), line] });
  await data.put(coll(), { ...r, hold: { checkId, checkNo: c.no ?? '', at, by: line.by, byName: line.byName } });
  toast(t('🏷 Store coupon {0} added', r.no));
  return true;
}

// Confirm it's the right guest before it goes on.
function confirmSheet(r) {
  return sheet({
    title: t('Store coupon {0}', r.no), left: 'Cancel', right: 'Redeem',
    body: `<div class="card center"><div class="pr-big">${money(r.amount)}</div><div class="pr-lab">${esc(t('Issued to {0}', ''))}<b class="notr">${esc(r.customer)}</b></div></div>
      <p class="muted small">${esc(t('Issued {0} by {1}', when(r.issuedAt), ''))}<span class="notr">${esc(r.issuedByName || '')}</span>${r.note ? ` · <span class="notr">${esc(r.note)}</span>` : ''}</p>
      <p class="muted small">It comes off before tax and is marked Redeemed when the check is paid. If the check comes to less than the coupon, the rest is not kept and no cash is given back. Your name is saved as the person who authorized it.</p>`,
  });
}

// The Store coupon button on a check: scan the barcode or type the number.
// preset: a number already read from the Add a coupon box.
export async function storeCouponSheet(checkId, preset = '') {
  let no = preset;
  if (!no) {
    let stop = () => {};
    no = await sheet({
      title: 'Redeem a store coupon', left: 'Cancel',
      body: `<div class="cpn-cam"><video id="sv" playsinline muted autoplay></video><div class="cpn-aim" aria-hidden="true"></div><p id="smsg" class="cpn-msg">Starting the camera…</p></div>
        <label class="field" style="margin-top:12px"><span>Or type the coupon number</span><input type="text" id="styped" placeholder="${esc(t('e.g. {0}', fmtNo(1)))}" autocapitalize="characters" autocomplete="off"></label>
        <button class="btn block" id="sapply" type="button">Look up</button>
        <p id="serr" class="cpn-err" role="alert"></p>`,
      onMount(api) {
        const el = api.el, msg = (x) => { const m = $('#smsg', el); if (m) m.textContent = x; };
        let busy = false;
        const look = async (text, scanned) => {
          if (busy) return; busy = true;
          const n = storeNo(text);
          const r = n ? await check(n, checkId) : { error: t('That isn\'t a store coupon number (e.g. {0}).', fmtNo(1)) };
          if (r.error) { $('#serr', el).textContent = r.error; if (navigator.vibrate) navigator.vibrate(120); setTimeout(() => { busy = false; }, scanned ? 1800 : 0); return; }
          api.close(n);
        };
        $('#sapply', el).onclick = () => { const v = $('#styped', el).value.trim(); if (v) look(v, false); else $('#styped', el).focus(); };
        $('#styped', el).onkeydown = (e) => { if (e.key === 'Enter') $('#sapply', el).click(); };
        startScanner($('#sv', el), (text) => look(text, true), msg).then((s) => { stop = s; });
      },
    });
    stop();
    if (!no) return false;
  }
  const r = await check(no, checkId);
  if (r.error) { toast(r.error); return false; }
  if (!(await confirmSheet(r.r))) return false;
  const again = await check(no, checkId); // someone else may have used it meanwhile
  if (again.error) { toast(again.error); return false; }
  return apply(checkId, again.r);
}

// For Today's sales and the receipt: the store coupons on closed checks.
export function storeSales(closed) {
  const list = closed.flatMap((c) => (c.store || []).map((x) => ({ ...x, checkNo: c.no, checkName: c.name, at: c.closed })));
  return { list, total: r2(list.reduce((a, x) => a + (+x.amount || 0), 0)) };
}
export async function outstanding() {
  const [list, checks] = await Promise.all([allCoupons(), data.list('check')]);
  const out = list.filter((r) => ['out', 'held'].includes(stateOf(r, checks)));
  return { n: out.length, amount: r2(out.reduce((a, r) => a + (+r.amount || 0), 0)) };
}

// ------------------------------------------------------------ the register

const lock = (m) => `<div class="empty">🔒 ${esc(m)}<br><span class="small">The Admin sets this in Settings → Roles and permissions.</span></div>`;
const TABS = [['out', 'Outstanding'], ['redeemed', 'Redeemed'], ['void', 'Void'], ['all', 'All']];

export async function storeCouponsView() {
  setChrome({ tab: 'more', back: true });
  setTitle('Store coupons', canIssue() ? '<button class="btn plain small" id="sc-new" type="button">+ Issue</button>' : '');
  if (!canRegister()) { view.innerHTML = lock('Store coupons are for management jobs and the Admin.'); return; }
  let [list, checks] = await Promise.all([allCoupons(), data.list('check')]);
  if (list.some((r) => r.hold && r.status !== 'redeemed' && r.status !== 'void')) { await settle(list, checks); list = await allCoupons(); }
  list.sort((a, b) => (b.seq || 0) - (a.seq || 0));
  const rows = list.map((r) => ({ r, s: stateOf(r, checks) }));
  const isOut = (x) => x.s === 'out' || x.s === 'held';
  const sum = (xs, f) => r2(xs.reduce((a, x) => a + f(x), 0));
  const outs = rows.filter(isOut), reds = rows.filter((x) => x.s === 'redeemed');
  let tab = LS.get('scTab', 'out');
  if (!TABS.some(([k]) => k === tab)) tab = 'out';
  const q = String(storeCouponsView.q || '').trim().toLowerCase();
  const shown = rows.filter((x) => (q ? `${x.r.no} ${x.r.customer} ${x.r.redeemed?.checkNo ?? ''}`.toLowerCase().includes(q) : tab === 'all' || (tab === 'out' ? isOut(x) : x.s === tab)));
  const red = (r) => r.redeemed || {};
  const statusCell = (x) => `${stChip(x.s)}${x.s === 'held' ? ` <span class="muted small">${esc(t('on check #{0}', x.r.hold.checkNo))}</span>` : ''}`;
  // Columns follow the tab: what a coupon in that state has.
  const C = {
    no: ['Number', (x) => `<b class="notr">${esc(x.r.no)}</b>`],
    cu: ['Customer', (x) => `<span class="notr">${esc(x.r.customer)}</span>`],
    am: ['Amount', (x) => money(x.r.amount), 1],
    is: ['Issued', (x) => esc(when(x.r.issuedAt))],
    ib: ['Issued by', (x) => `<span class="notr">${esc(x.r.issuedByName || '')}</span>`],
    st: ['Status', statusCell],
    nt: ['Note', (x) => `<span class="notr">${esc(x.r.note || '')}</span>`],
    rd: ['Redeemed', (x) => esc(when(red(x.r).at))],
    ck: ['Check', (x) => '#' + esc(red(x.r).checkNo)],
    pu: ['Purchase', (x) => money(red(x.r).purchase), 1],
    di: ['Discount', (x) => '−' + money(red(x.r).discount), 1],
    au: ['Authorized by', (x) => `<span class="notr">${esc(red(x.r).authByName || '')}</span>`],
    vd: ['Voided', (x) => esc(when(x.r.voided?.at))],
    vb: ['Voided by', (x) => `<span class="notr">${esc(x.r.voided?.byName || '')}</span>`],
    vr: ['Reason', (x) => `<span class="notr">${esc(x.r.voided?.reason || '')}</span>`],
    ls: ['Redeemed or voided', (x) => (x.s === 'redeemed' ? esc(t('{0} · check #{1}', when(red(x.r).at), red(x.r).checkNo)) : x.s === 'void' ? esc(when(x.r.voided?.at)) : '—')],
  };
  const COLS = q ? 'no cu am is st ls' : { out: 'no cu am is ib st nt', redeemed: 'no cu am rd ck pu di au', void: 'no cu am is vd vb vr', all: 'no cu am is ib st ls' }[tab];
  const cols = COLS.split(' ').map((k) => C[k]);
  const table = () => `<div class="wtable-wrap"><table class="wtable sc-table">
      <thead><tr>${cols.map(([h, , n]) => `<th${n ? ' class="num"' : ''}>${h}</th>`).join('')}</tr></thead>
      <tbody>${shown.map((x) => `<tr class="tap-row" data-sc="${x.r.id}">${cols.map(([, f, n]) => `<td${n ? ' class="num"' : ''}>${f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const cards = () => `<div class="group">${shown.map((x) => `<button class="row nav" type="button" data-sc="${x.r.id}"><span class="grow"><span class="title"><span class="notr">${esc(x.r.no)}</span> ${statusCell(x)}</span>
      <span class="sub"><span class="notr">${esc(x.r.customer)}</span> · ${esc(x.s === 'redeemed' ? t('redeemed {0} · check #{1}', when(red(x.r).at), red(x.r).checkNo) : x.s === 'void' ? t('voided {0}', when(x.r.voided?.at)) : t('issued {0}', when(x.r.issuedAt)))}</span></span>
      <span class="meta">${x.s === 'redeemed' ? '−' + money(red(x.r).discount) : money(x.r.amount)}</span></button>`).join('')}</div>`;
  view.innerHTML = `
    <div class="pr-kpis">
      <div class="card"><div class="pr-v">${money(sum(outs, (x) => +x.r.amount || 0))}</div><div class="pr-lab">${esc(t('{0} outstanding', outs.length))}</div><div class="pr-lab small">Promotional commitments, not on the books</div></div>
      <div class="card"><div class="pr-v">−${money(sum(reds, (x) => +red(x.r).discount || 0))}</div><div class="pr-lab">${esc(t('{0} redeemed', reds.length))}</div><div class="pr-lab small">${esc(t('Posted to {0}', accountName()))}</div></div>
    </div>
    <div class="segmented">${TABS.map(([k, l]) => `<button type="button" data-tab="${k}" class="${!q && tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${searchBox('scq', 'Search number, customer or check', storeCouponsView.q)}
    ${shown.length ? (isWide() ? table() : cards()) : `<div class="empty">${list.length ? 'No store coupons here.' : 'No store coupons issued yet.'}${!list.length && canIssue() ? '<br><button class="btn" id="sc-new2" type="button" style="margin-top:10px">Issue a store coupon</button>' : ''}</div>`}
    ${list.length ? `<div class="btn-row no-print" style="margin-top:14px"><button class="btn tonal" id="sc-csv" type="button">Copy register (CSV)</button></div>${printButtons()}` : ''}
    <div class="section-label">How store coupons work</div>
    <div class="group"><div class="row"><span class="grow sc-how">${[
      'A manager issues a coupon to a guest here. Each gets its own number, never used twice, and a picture with a barcode to text, email or print.',
      'The register only tracks what the restaurant has promised: outstanding coupons are not on the books.',
      'At the table, the server taps Store coupon on the check and scans the barcode or types the number.',
      'When the check is paid, the coupon is marked Redeemed with the check number, the purchase, the discount and who authorized it.',
      t('The discount goes to {0}, which takes gross sales down to net sales. It is not an expense and not food cost.', accountName()),
      'Redeemed and void coupons stay in the register for good. Clear test data never removes them.',
    ].map((x) => `<span class="sub">${esc(x)}</span>`).join('')}</span></div></div>`;
  $$('[data-tab]').forEach((b) => b.onclick = () => { LS.set('scTab', b.dataset.tab); storeCouponsView.q = ''; storeCouponsView(); });
  const qi = $('#scq');
  qi?.addEventListener('input', () => { storeCouponsView.q = qi.value; clearTimeout(storeCouponsView.tm); storeCouponsView.tm = setTimeout(async () => { await storeCouponsView(); const n = $('#scq'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); });
  $$('[data-sc]').forEach((b) => b.onclick = () => detailSheet(list.find((r) => r.id === b.dataset.sc)));
  $('#sc-new')?.addEventListener('click', issueSheet);
  $('#sc-new2')?.addEventListener('click', issueSheet);
  $('#sc-csv')?.addEventListener('click', () => copy(csv(rows), 'Register copied. Paste it into a spreadsheet or an email.'));
  if (list.length) wirePrint({ title: t('Store coupon register · {0}', new Date().toLocaleDateString()), getLines: () => printLines(rows), $ });
}

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function csv(rows) {
  const head = ['Number', 'Customer', 'Contact', 'Amount', 'Issued', 'Issued by', 'Note', 'Status', 'Redeemed', 'Check', 'Purchase', 'Discount', 'Authorized by', 'Account', 'Voided', 'Voided by', 'Void reason'];
  const out = rows.map(({ r, s }) => {
    const d = r.redeemed || {}, v = r.voided || {};
    return [r.no, r.customer, r.contact || '', (+r.amount || 0).toFixed(2), when(r.issuedAt), r.issuedByName || '', r.note || '', LABEL[s] + (s === 'held' ? ` (on check #${r.hold.checkNo})` : ''),
      s === 'redeemed' ? when(d.at) : '', s === 'redeemed' ? d.checkNo : '', s === 'redeemed' ? (+d.purchase || 0).toFixed(2) : '', s === 'redeemed' ? (+d.discount || 0).toFixed(2) : '',
      s === 'redeemed' ? d.authByName || '' : '', s === 'redeemed' ? accountName() : '', s === 'void' ? when(v.at) : '', s === 'void' ? v.byName || '' : '', s === 'void' ? v.reason || '' : ''];
  });
  return [head, ...out].map((l) => l.map(csvCell).join(',')).join('\n');
}
function printLines(rows) {
  const outs = rows.filter((x) => x.s === 'out' || x.s === 'held'), reds = rows.filter((x) => x.s === 'redeemed'), voids = rows.filter((x) => x.s === 'void');
  const d = (r) => r.redeemed || {};
  return [
    t('Outstanding: {0} coupons, {1} (promotional commitments, not on the books)', outs.length, money(outs.reduce((a, x) => a + (+x.r.amount || 0), 0))),
    t('Redeemed: {0} coupons, {1} posted to {2}', reds.length, money(reds.reduce((a, x) => a + (+d(x.r).discount || 0), 0)), accountName()),
    '',
    '# Outstanding',
    ...(outs.length ? outs.map((x) => `${x.r.no}  ${money(x.r.amount)}  ${x.r.customer}  ·  ${t('issued {0} by {1}', when(x.r.issuedAt), x.r.issuedByName || '')}${x.s === 'held' ? '  ·  ' + t('on check #{0}', x.r.hold.checkNo) : ''}`) : ['None']),
    '',
    '# Redeemed',
    ...(reds.length ? reds.map((x) => `${x.r.no}  ${x.r.customer}  ·  ${when(d(x.r).at)}  ·  ${t('check #{0}', d(x.r).checkNo)}  ·  ${t('purchase {0}', money(d(x.r).purchase))}  ·  ${t('discount −{0}', money(d(x.r).discount))}  ·  ${t('authorized by {0}', d(x.r).authByName || '')}`) : ['None']),
    '',
    '# Void',
    ...(voids.length ? voids.map((x) => `${x.r.no}  ${money(x.r.amount)}  ${x.r.customer}  ·  ${t('voided {0} by {1}', when(x.r.voided?.at), x.r.voided?.byName || '')}${x.r.voided?.reason ? '  ·  ' + x.r.voided.reason : ''}`) : ['None']),
  ];
}

// Issue a new coupon (management jobs).
async function issueSheet() {
  if (!canIssue()) return;
  const r = await sheet({
    title: 'Issue a store coupon', right: 'Issue',
    body: `<label class="field"><span>Customer</span><input type="text" id="sc-cu" autocomplete="off" placeholder="Guest's name"></label>
      <label class="field"><span>Amount ($)</span><input type="text" inputmode="decimal" id="sc-am" placeholder="10.00"></label>
      <label class="field"><span>Phone or email (optional)</span><input type="text" id="sc-ct" autocomplete="off"></label>
      <label class="field"><span>Reason or note (optional)</span><input type="text" id="sc-nt" autocomplete="off" placeholder="e.g. long wait on Friday"></label>
      <p id="sc-err" class="cpn-err" role="alert"></p>
      <p class="muted small">The number is given out on its own and never used again. An outstanding coupon is only a promise: nothing goes on the books until it is redeemed on a check.</p>`,
    onMount(api) {
      api.onRight = () => {
        const cu = $('#sc-cu', api.el).value.trim(), am = r2(+String($('#sc-am', api.el).value).replace(/[$,\s]/g, ''));
        if (!cu) { $('#sc-err', api.el).textContent = 'Enter the customer\'s name.'; return; }
        if (!(am > 0)) { $('#sc-err', api.el).textContent = 'Enter an amount over $0.'; return; }
        api.close({ customer: cu, amount: am, contact: $('#sc-ct', api.el).value.trim(), note: $('#sc-nt', api.el).value.trim() });
      };
    },
  });
  if (!r) return;
  const list = await allCoupons();
  let seq = await nextSeq(list);
  while (byNo(list, fmtNo(seq))) seq++;
  const rec = await data.put(coll(), { no: fmtNo(seq), seq, ...r, status: 'out', issuedAt: Date.now(), issuedBy: meId(), issuedByName: meName(), hold: null });
  const s = await data.settings();
  if ((+s.storeCouponSeq || 0) < seq) await data.saveSettings({ ...s, storeCouponSeq: seq });
  toast(t('Store coupon {0} issued', rec.no));
  storeCouponsView();
  detailSheet(rec, true);
}

// The coupon picture: Code 128 barcode with the number, the amount and the guest's name.
async function picture(r) {
  const cp = { type: 'off', value: +r.amount || 0, food: false, stack: true, fine: t('Issued to {0}. One use only, no cash value.', r.customer) };
  return drawCoupon(cp, r.no, 'bar');
}

async function detailSheet(r, fresh = false) {
  if (!r) return;
  const checks = await data.list('check');
  const s = stateOf(r, checks), d = r.redeemed || {}, v = r.voided || {};
  const row = (k, val, notr = false) => `<div class="row"><span class="grow muted">${esc(k)}</span><span class="meta${notr ? ' notr' : ''}" style="white-space:normal;text-align:right">${esc(val)}</span></div>`;
  const act = await sheet({
    title: t('Store coupon {0}', r.no), left: 'Close',
    body: `${fresh ? '<p class="hint small">Issued. Send the guest the coupon picture below, or print it.</p>' : ''}
      <div class="card center"><div class="pr-big">${money(r.amount)}</div><div>${stChip(s)}</div></div>
      <div class="group">
        ${row('Customer', r.customer, true)}${r.contact ? row('Phone or email', r.contact, true) : ''}
        ${row('Issued', when(r.issuedAt))}${row('Issued by', r.issuedByName || '', true)}${r.note ? row('Note', r.note, true) : ''}
        ${s === 'held' ? row('On check', '#' + r.hold.checkNo) : ''}
        ${s === 'redeemed' ? `${row('Redeemed', when(d.at))}${row('Check', '#' + d.checkNo)}${row('Purchase before discounts', money(d.purchase))}${row('Discount applied', '−' + money(d.discount))}${row('Authorized by', d.authByName || '', true)}${row('Account', accountName())}` : ''}
        ${s === 'void' ? `${row('Voided', when(v.at))}${row('Voided by', v.byName || '', true)}${v.reason ? row('Reason', v.reason, true) : ''}` : ''}
      </div>
      <div class="stack" style="margin-top:12px">
        ${s === 'out' || s === 'held' ? '<button class="btn block" type="button" data-a="send">Send or print the coupon</button>' : ''}
        ${s === 'out' && canIssue() ? '<button class="btn block tonal" type="button" data-a="void" style="color:var(--danger)">Void this coupon</button>' : ''}
      </div>
      ${s === 'held' ? '<p class="muted small">It is on an open check. Take it off the check first to void it.</p>' : ''}
      ${s === 'redeemed' || s === 'void' ? '<p class="muted small">This record stays in the register for good.</p>' : ''}`,
    onMount(api) { $$('[data-a]', api.el).forEach((b) => b.onclick = () => api.close(b.dataset.a)); },
  });
  if (act === 'send') {
    try { const cv = await picture(r); await sendPictures([await toFile(cv, `${r.no}.png`)], t('Store coupon {0}', r.no)); }
    catch (e) { toast(e?.message || 'Couldn\'t make the coupon picture'); }
  }
  if (act === 'void') voidSheet(r);
}

async function voidSheet(r) {
  const why = await sheet({
    title: t('Void {0}?', r.no), right: 'Void',
    body: `<p>${esc(t('{0} for {1} can\'t be redeemed after this. The record stays in the register.', money(r.amount), ''))}<b class="notr">${esc(r.customer)}</b></p>
      <label class="field"><span>Reason</span><input type="text" id="vr" autocomplete="off" placeholder="e.g. issued by mistake"></label><p id="verr" class="cpn-err" role="alert"></p>`,
    onMount(api) { api.onRight = () => { const v = $('#vr', api.el).value.trim(); if (!v) { $('#verr', api.el).textContent = 'Enter a reason.'; return; } api.close(v); }; },
  });
  if (!why) return;
  const cur = await data.get(coll(), r.id);
  if (stateOf(cur, await data.list('check')) !== 'out') { toast('It is on a check or already used. It can\'t be voided now.'); storeCouponsView(); return; }
  await data.put(coll(), { ...cur, status: 'void', hold: null, voided: { at: Date.now(), by: meId(), byName: meName(), reason: why } });
  toast(t('{0} voided', r.no));
  storeCouponsView();
}

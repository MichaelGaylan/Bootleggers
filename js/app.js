// Bootleggers Kitchen: screens and navigation.

import {
  APP_NAME, VERSION, BUILD, WHATS_NEW, ROOT_KEYS, INACTIVITY_DAYS, INVITE_HOURS,
  WEB3FORMS_KEY, REPORT_PREFIX, NOTIFICATIONS_URL,
} from './config.js';
import * as access from './access.js';
import * as store from './store.js';
import { randomId } from './crypto.js';
import { STARTER_STOCK, STOCK_STATUS } from './starter-stock.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const view = $('#view');
const dlg = $('#dlg');
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('blg.' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('blg.' + k, JSON.stringify(v)),
};
const isIOS = document.documentElement.classList.contains('is-ios');
const standalone = document.documentElement.classList.contains('standalone');
const NOTICE_VERSION = 1;

let profile = null;
let notices = [];

// ---------------------------------------------------------------- helpers

function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>`;
  if (action) {
    const b = document.createElement('button');
    b.textContent = action.label;
    b.onclick = () => { t.hidden = true; action.run(); };
    t.append(b);
  }
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, action ? 12000 : 3000);
}

async function copy(text, done = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    toast(done);
  } catch {
    // Older browsers: select a hidden field instead.
    const ta = document.createElement('textarea');
    ta.value = text; document.body.append(ta); ta.select();
    document.execCommand('copy'); ta.remove(); toast(done);
  }
}

async function share(title, text) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  copy(text, 'Copied. Paste it into a text message.');
}

async function pasteInto(ta) {
  try { ta.value = await navigator.clipboard.readText(); ta.dispatchEvent(new Event('input')); }
  catch { ta.focus(); toast('Long-press the box and tap Paste'); }
}

// Opens the bottom sheet. Resolves with whatever close(value) gets.
function sheet({ title, body, left = 'Cancel', right, onMount, dismissable = true }) {
  return new Promise((resolve) => {
    dlg.innerHTML = `
      <div class="sheet-head">
        ${left ? `<button class="btn plain small" data-act="left" type="button">${esc(left)}</button>` : '<span style="width:70px"></span>'}
        <h3>${esc(title)}</h3>
        ${right ? `<button class="btn plain small" data-act="right" type="button" style="font-weight:700">${esc(right)}</button>` : '<span style="width:70px"></span>'}
      </div>
      <div class="sheet-body">${body}</div>`;
    let result;
    const close = (v) => { result = v; dlg.close(); };
    dlg.onclose = () => resolve(result);
    dlg.oncancel = (e) => { if (!dismissable) e.preventDefault(); };
    const api = { close, el: dlg };
    $('[data-act=left]', dlg)?.addEventListener('click', () => close(undefined));
    const r = $('[data-act=right]', dlg);
    if (r) r.addEventListener('click', () => api.onRight ? api.onRight() : close(true));
    onMount?.(api);
    dlg.showModal();
    $('.sheet-body', dlg).scrollTop = 0;
  });
}

function setTitle(text, actionHtml = '') {
  $('#title').textContent = text;
  $('#title-action').innerHTML = actionHtml;
}

function setChrome({ locked = false, tab = null, back = false }) {
  document.body.classList.toggle('locked', locked);
  $('#tabs').hidden = locked;
  $('#btn-bell').hidden = locked;
  $('#btn-back').hidden = !back;
  $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  window.scrollTo(0, 0);
}

const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// ------------------------------------------------- startup screen (RRA-014)

function startupScreen() {
  const seen = LS.get('seenVersion', null);
  if (seen === VERSION) return Promise.resolve();
  const updated = !!seen;
  return new Promise((resolve) => {
    const splash = $('#splash');
    const video = $('#splash-video');
    const card = $('#splash-card');
    const skip = $('#splash-skip');
    splash.hidden = false;
    let shown = false;
    const showCard = () => {
      if (shown) return;
      shown = true;
      video.pause();
      skip.hidden = true;
      video.style.transition = 'opacity .6s'; video.style.opacity = '0';
      const notes = WHATS_NEW.find((w) => w.version === VERSION)?.lines || [];
      card.innerHTML = `
        <img src="assets/app-icon-512.png" alt="">
        <h2>${esc(APP_NAME)}</h2>
        <div class="ver">Version ${VERSION} · build ${BUILD}</div>
        ${updated
          ? `<p style="margin-top:16px;font-weight:600">What's new</p><ul>${notes.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`
          : `<p style="margin:16px 0 22px;color:rgba(255,255,255,.8)">Recipes and kitchen notes for Bootleggers Bar &amp; Grill, Augusta.</p>`}
        <button class="btn" type="button">${updated ? 'Continue' : 'Get started'}</button>`;
      card.hidden = false;
      $('button', card).onclick = () => {
        LS.set('seenVersion', VERSION);
        splash.style.transition = 'opacity .35s'; splash.style.opacity = '0';
        setTimeout(() => { splash.hidden = true; splash.style.opacity = ''; resolve(); }, 350);
      };
    };
    video.onended = showCard;
    video.onerror = showCard;
    skip.onclick = showCard;
    setTimeout(showCard, 9000); // never get stuck if the clip stalls
    video.play().catch(showCard); // e.g. iPhone Low Power Mode blocks autoplay
  });
}

// ------------------------------------------- notices popup (RRA-020)

const NOTICE_HTML = `
  <ul class="notice-list">
    <li><b>Proprietary software.</b> Bootleggers Kitchen and the recipes in it belong to Bootleggers Bar &amp; Grill. They are for your work here only.</li>
    <li><b>Do not share it.</b> Don't forward invites, codes or screenshots of recipes, and don't let anyone else use the app on your phone.</li>
    <li><b>About email.</b> Messages sent by email, such as a problem report, could possibly (but unlikely) become public. Don't put private information in them.</li>
  </ul>`;

async function noticeGate() {
  if (LS.get('noticeAck', 0) >= NOTICE_VERSION) return;
  await sheet({
    title: 'Before you start', left: null, dismissable: false,
    body: `${NOTICE_HTML}<button class="btn block" id="ack" type="button" style="margin-top:12px">I understand</button>`,
    onMount: ({ close, el }) => { $('#ack', el).onclick = () => close(true); },
  });
  LS.set('noticeAck', NOTICE_VERSION);
}

async function emailNotice() {
  if (LS.get('emailAck', false)) return true;
  const ok = await sheet({
    title: 'About email', left: 'Cancel',
    body: `<p>Your report goes out by email. Email could possibly (but unlikely) become public, so leave out private details like passwords or personal information.</p>
      <button class="btn block" id="ack" type="button" style="margin-top:16px">Send report</button>`,
    onMount: ({ close, el }) => { $('#ack', el).onclick = () => close(true); },
  });
  if (ok) LS.set('emailAck', true);
  return !!ok;
}

// ---------------------------------------- global notices (RRA-015)

async function loadNotices() {
  try {
    const r = await fetch(NOTIFICATIONS_URL, { cache: 'no-store' });
    if (r.ok) { notices = (await r.json()).messages || []; LS.set('noticesCache', notices); }
  } catch { notices = LS.get('noticesCache', []); }
  updateBadge();
  const popped = new Set(LS.get('popped', []));
  const fresh = notices.find((n) => !popped.has(n.id));
  if (fresh && profile && !dlg.open) {
    popped.add(fresh.id); LS.set('popped', [...popped]);
    await sheet({
      title: 'Notice', left: null, right: 'OK',
      body: `<p class="muted small">${esc(fresh.from || 'Management')} · ${esc(fresh.date || '')}</p><h2 style="margin-top:4px">${esc(fresh.title)}</h2><p>${esc(fresh.body)}</p>`,
    });
  }
}

function unreadCount() {
  const read = new Set(LS.get('read', []));
  return notices.filter((n) => !read.has(n.id)).length;
}

function updateBadge() {
  const n = unreadCount();
  $('#tab-badge').hidden = !n;
  $('#tab-badge').textContent = n;
  $('#bell-dot').hidden = !n;
}

function noticesView() {
  setChrome({ tab: 'notices' });
  setTitle('Notices');
  const read = new Set(LS.get('read', []));
  view.innerHTML = notices.length
    ? notices.map((n) => `
      <div class="card">
        <p class="muted small">${esc(n.from || 'Management')} · ${esc(n.date || '')} ${read.has(n.id) ? '' : '<span class="chip warn">New</span>'}</p>
        <h3 style="margin:4px 0">${esc(n.title)}</h3><p>${esc(n.body)}</p>
      </div>`).join('') + '<p class="muted small center">Notices are sent to everyone by management.</p>'
    : '<div class="empty">No notices yet.</div>';
  LS.set('read', notices.map((n) => n.id));
  updateBadge();
}

// --------------------------------------------- house recipes (RRA-025)
// Saved encrypted on this phone. Sharing them between phones needs the
// recipe archive (RRA-001), which is not approved yet.

const CATEGORIES = ['Rub', 'Sauce', 'Dressing', 'Marinade', 'Other'];
const recipes = {
  all: async () => (await store.all('recipe:')).sort((a, b) => a.name.localeCompare(b.name)),
  get: (id) => store.get(`recipe:${id}`),
  save: (r) => store.put(`recipe:${r.id}`, r),
  remove: (id) => store.del(`recipe:${id}`),
};

async function recipesView() {
  setChrome({ tab: 'recipes' });
  setTitle('House recipes', '<button class="btn btn-new" id="new-recipe" type="button">NEW RECIPE</button>');
  $('#new-recipe').onclick = () => recipeDialog();
  const list = await recipes.all();
  const filter = LS.get('recipeKind', 'house');
  const q = (recipesView.q || '').toLowerCase();
  const shown = list.filter((r) => r.kind === filter && (!q || r.name.toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q)));
  const byCat = {};
  for (const r of shown) (byCat[r.kind === 'house' ? r.category || 'Other' : 'Dishes'] ||= []).push(r);
  view.innerHTML = `
    <div class="segmented" role="tablist">
      <button data-k="house" class="${filter === 'house' ? 'on' : ''}" type="button">House recipes</button>
      <button data-k="dish" class="${filter === 'dish' ? 'on' : ''}" type="button">Dishes</button>
    </div>
    <div class="search"><input type="search" id="q" placeholder="Search" value="${esc(recipesView.q || '')}"></div>
    ${shown.length ? Object.entries(byCat).map(([cat, rs]) => `
      <div class="section-label">${esc(cat)}</div>
      <div class="group">${rs.map((r) => `
        <a class="row" href="#/recipe/${r.id}"><span class="grow"><span class="title">${esc(r.name)}</span>
        <span class="sub">${esc(r.kind === 'house' ? [r.yield && `Yield ${r.yield}`, r.storage].filter(Boolean).join(' · ') : usesText(r, list))}</span></span></a>`).join('')}
      </div>`).join('')
    : `<div class="empty">${q ? 'Nothing matches that search.' : filter === 'house'
      ? 'No house recipes yet.<br>Tap <b>NEW RECIPE</b> to add a rub, sauce or dressing.'
      : 'No dishes yet. A dish can link to the house recipes it uses, like a wing sauce.'}</div>`}
    <p class="muted small center">Recipes are saved on this phone, encrypted.</p>`;
  $$('.segmented button', view).forEach((b) => { b.onclick = () => { LS.set('recipeKind', b.dataset.k); recipesView(); }; });
  const qi = $('#q');
  qi.oninput = () => { recipesView.q = qi.value; clearTimeout(qi.t); qi.t = setTimeout(async () => { await recipesView(); const n = $('#q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200); };
}

function usesText(r, list) {
  const names = (r.uses || []).map((id) => list.find((x) => x.id === id)?.name).filter(Boolean);
  return names.length ? 'Uses ' + names.join(', ') : '';
}

async function recipeView(id) {
  setChrome({ tab: 'recipes', back: true });
  const r = await recipes.get(id);
  if (!r) { location.hash = '#/recipes'; return; }
  const list = await recipes.all();
  const uses = (r.uses || []).map((u) => list.find((x) => x.id === u)).filter(Boolean);
  const usedIn = list.filter((x) => (x.uses || []).includes(r.id));
  setTitle(r.name, '<button class="btn plain small" id="edit" type="button">Edit</button>');
  $('#edit').onclick = () => recipeDialog(r);
  view.innerHTML = `
    <div class="recipe">
      <p><span class="chip">${r.kind === 'house' ? esc(r.category || 'House recipe') : 'Dish'}</span></p>
      ${r.kind === 'house' && (r.yield || r.storage) ? `<div class="facts">
        <div><b>Yield</b>${esc(r.yield || '—')}</div><div><b>Storage</b>${esc(r.storage || '—')}</div></div>` : ''}
      ${uses.length ? `<h2>Uses house recipes</h2><div class="group">${uses.map((u) => `<a class="row" href="#/recipe/${u.id}"><span class="grow">${esc(u.name)}</span></a>`).join('')}</div>` : ''}
      <h2>Ingredients</h2>
      <div class="card"><ul class="ing">${(r.ingredients || []).map((i) => `<li><span class="qty">${esc(i.qty)}</span><span>${esc(i.item)}</span></li>`).join('')}</ul></div>
      <h2>Step by step</h2>
      <div class="card"><ol class="steps">${(r.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
      ${usedIn.length ? `<h2>Used in</h2><div class="group">${usedIn.map((u) => `<a class="row" href="#/recipe/${u.id}"><span class="grow">${esc(u.name)}</span></a>`).join('')}</div>` : ''}
      <details class="comments" id="comments">
        <summary>Comments (${(r.comments || []).length})</summary>
        ${(r.comments || []).map((c) => `<div class="comment"><div class="who">${esc(c.by)} · ${fmtDate(c.at)}</div>${esc(c.text)}</div>`).join('')}
        <label class="field"><span>Add a comment</span><textarea id="c-text" style="min-height:64px"></textarea></label>
        <button class="btn tonal small" id="c-add" type="button">Add comment</button>
      </details>
      <p class="muted small" style="margin-top:24px">Added by ${esc(r.by || '—')} · updated ${fmtDate(r.updated || r.created)}</p>
      <button class="btn danger block no-print" id="del" type="button">Delete recipe</button>
    </div>`;
  $('#c-add').onclick = async () => {
    const text = $('#c-text').value.trim();
    if (!text) return;
    r.comments = [...(r.comments || []), { by: profile.name, at: Date.now(), text }];
    await recipes.save(r);
    await recipeView(id);
    $('#comments').open = true;
  };
  $('#del').onclick = async () => {
    const ok = await sheet({
      title: 'Delete recipe?', right: 'Delete',
      body: `<p>Delete <b>${esc(r.name)}</b> from this phone?${usedIn.length ? ` It is used in ${usedIn.length} dish${usedIn.length > 1 ? 'es' : ''}; those links will be removed.` : ''}</p>`,
    });
    if (!ok) return;
    for (const d of usedIn) { d.uses = d.uses.filter((u) => u !== r.id); await recipes.save(d); }
    await recipes.remove(r.id);
    toast('Recipe deleted');
    location.hash = '#/recipes';
  };
}

async function recipeDialog(existing) {
  const r = existing ? structuredClone(existing) : { kind: LS.get('recipeKind', 'house'), category: 'Sauce', ingredients: [{ qty: '', item: '' }, { qty: '', item: '' }], steps: [], uses: [], comments: [] };
  const house = (await recipes.all()).filter((x) => x.kind === 'house' && x.id !== r.id);
  const ingRow = (i = { qty: '', item: '' }) => `
    <div class="ing-edit"><input type="text" placeholder="Qty" value="${esc(i.qty)}" aria-label="Quantity">
    <input type="text" placeholder="Ingredient" value="${esc(i.item)}" aria-label="Ingredient">
    <button type="button" aria-label="Remove">×</button></div>`;
  const saved = await sheet({
    title: existing ? 'Edit recipe' : 'New recipe', right: 'Save',
    body: `
      <label class="field"><span>Name</span><input type="text" id="r-name" value="${esc(r.name || '')}" placeholder="e.g. Honey Sriracha wing sauce" autocomplete="off"></label>
      <div class="segmented" id="r-kind">
        <button type="button" data-k="house">House recipe</button><button type="button" data-k="dish">Dish</button>
      </div>
      <div id="house-only">
        <label class="field"><span>Type</span><select id="r-cat">${CATEGORIES.map((c) => `<option ${c === r.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      </div>
      <div class="field"><span class="muted small" style="margin-left:4px">Ingredients and quantities</span>
        <div id="r-ings" style="margin-top:6px">${(r.ingredients.length ? r.ingredients : [{}]).map(ingRow).join('')}</div>
        <button class="btn plain small" id="r-add-ing" type="button">+ Add ingredient</button>
      </div>
      <label class="field"><span>Instructions (one step per line)</span><textarea id="r-steps" placeholder="Whisk the butter and hot sauce over low heat&#10;Add honey and sriracha&#10;Cool, label and date">${esc((r.steps || []).join('\n'))}</textarea></label>
      <div id="house-only-2" class="facts" style="background:none">
        <label class="field" style="margin:0"><span>Yield</span><input type="text" id="r-yield" value="${esc(r.yield || '')}" placeholder="e.g. 2 qt"></label>
        <label class="field" style="margin:0"><span>Storage</span><input type="text" id="r-storage" value="${esc(r.storage || '')}" placeholder="e.g. Walk-in, 7 days"></label>
      </div>
      <div id="dish-only">
        <div class="section-label" style="margin-left:4px">Uses house recipes</div>
        <div class="checks">${house.length ? house.map((h) => `<label><input type="checkbox" value="${h.id}" ${(r.uses || []).includes(h.id) ? 'checked' : ''}>${esc(h.name)}</label>`).join('') : '<p class="muted small">No house recipes yet.</p>'}</div>
      </div>
      <details class="comments" style="margin-top:12px">
        <summary>Comments</summary>
        <textarea id="r-comment" placeholder="Optional note for the team" style="min-height:64px"></textarea>
      </details>
      <p id="r-err" class="small" style="color:var(--danger)"></p>`,
    onMount: (api) => {
      const el = api.el;
      const setKind = (k) => {
        r.kind = k;
        $$('#r-kind button', el).forEach((b) => b.classList.toggle('on', b.dataset.k === k));
        $('#house-only', el).hidden = k !== 'house';
        $('#house-only-2', el).hidden = k !== 'house';
        $('#dish-only', el).hidden = k !== 'dish';
      };
      setKind(r.kind);
      $$('#r-kind button', el).forEach((b) => { b.onclick = () => setKind(b.dataset.k); });
      const wireRemove = () => $$('.ing-edit button', el).forEach((b) => { b.onclick = () => { if ($$('.ing-edit', el).length > 1) b.parentElement.remove(); }; });
      wireRemove();
      $('#r-add-ing', el).onclick = () => { $('#r-ings', el).insertAdjacentHTML('beforeend', ingRow()); wireRemove(); $('#r-ings .ing-edit:last-child input', el).focus(); };
      api.onRight = () => {
        const name = $('#r-name', el).value.trim();
        const ingredients = $$('.ing-edit', el).map((row) => { const [q, i] = $$('input', row); return { qty: q.value.trim(), item: i.value.trim() }; }).filter((i) => i.item);
        const steps = $('#r-steps', el).value.split('\n').map((s) => s.trim()).filter(Boolean);
        const err = !name ? 'Give the recipe a name.' : !ingredients.length ? 'Add at least one ingredient.' : !steps.length ? 'Add the instructions.' : '';
        if (err) { $('#r-err', el).textContent = err; return; }
        const comment = $('#r-comment', el).value.trim();
        Object.assign(r, {
          name, ingredients, steps,
          category: r.kind === 'house' ? $('#r-cat', el).value : undefined,
          yield: r.kind === 'house' ? $('#r-yield', el).value.trim() : undefined,
          storage: r.kind === 'house' ? $('#r-storage', el).value.trim() : undefined,
          uses: r.kind === 'dish' ? $$('#dish-only input:checked', el).map((c) => c.value) : [],
          comments: comment ? [...(r.comments || []), { by: profile.name, at: Date.now(), text: comment }] : r.comments || [],
        });
        api.close(true);
      };
    },
  });
  if (!saved) return;
  const now = Date.now();
  if (!r.id) { r.id = randomId(8); r.created = now; r.by = profile.name; }
  r.updated = now;
  await recipes.save(r);
  LS.set('recipeKind', r.kind);
  toast(existing ? 'Saved' : 'Recipe added');
  if (location.hash === `#/recipe/${r.id}`) recipeView(r.id); else location.hash = `#/recipe/${r.id}`;
}

// ------------------------------------------------ starter stock (RRA-024)

function stockView() {
  setChrome({ tab: 'stock' });
  setTitle('Starter stock');
  const q = (stockView.q || '').toLowerCase();
  const groups = STARTER_STOCK.map((g) => ({ ...g, items: g.items.filter((i) => !q || i.join(' ').toLowerCase().includes(q)) })).filter((g) => g.items.length);
  view.innerHTML = `
    <div class="hint small">${esc(STOCK_STATUS)}</div>
    <div class="search"><input type="search" id="q" placeholder="Search stock" value="${esc(stockView.q || '')}"></div>
    ${groups.map((g) => `
      <div class="section-label">${esc(g.group)}</div>
      <div class="group">${g.items.map(([name, unit, used]) => `
        <div class="row"><span class="grow"><span class="title">${esc(name)}</span>${used ? `<span class="sub">${esc(used)}</span>` : ''}</span>
        ${unit ? `<span class="meta">${esc(unit)}</span>` : ''}</div>`).join('')}</div>`).join('') || '<div class="empty">Nothing matches that search.</div>'}
    <p class="muted small center">Par levels and counts come with stock tracking (not built yet).</p>`;
  const qi = $('#q');
  qi.oninput = () => { stockView.q = qi.value; clearTimeout(qi.t); qi.t = setTimeout(() => { stockView(); const n = $('#q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200); };
}

// ------------------------------------------------------------- More

function moreView() {
  setChrome({ tab: 'more' });
  setTitle('More');
  const daysLeft = INACTIVITY_DAYS;
  view.innerHTML = `
    <div class="card">
      <b>${esc(profile.name)}</b> <span class="chip">${esc(access.ROLES[profile.role] || profile.role)}</span>
      <p class="muted small">${profile.role === 'owner' ? 'Owner phone. Access does not expire.' : `Access stays on while you use it. It ends after ${daysLeft} days without opening the app.`}</p>
    </div>
    ${access.can(profile, 'invite') ? `<div class="group"><a class="row" href="#/team"><span class="grow">Invite and approve staff</span></a></div>` : ''}
    <div class="group">
      <a class="row" href="#/about"><span class="grow">About and how-to</span></a>
      <a class="row" href="#/whatsnew"><span class="grow">What's new</span><span class="meta">${VERSION}</span></a>
      <a class="row" href="#/report"><span class="grow">Report a problem</span></a>
      <button class="row nav" id="show-notice" type="button"><span class="grow">Notices of use</span></button>
    </div>
    <div class="group">
      <button class="row" id="leave" type="button" style="color:var(--danger)"><span class="grow">Remove access from this phone</span></button>
    </div>
    <p class="muted small center">${esc(APP_NAME)} ${VERSION} · build ${BUILD}</p>`;
  $('#show-notice').onclick = () => sheet({ title: 'Notices of use', left: null, right: 'Done', body: NOTICE_HTML });
  $('#leave').onclick = async () => {
    const ok = await sheet({ title: 'Remove access?', right: 'Remove', body: `<p>This deletes the app's data from this phone, including recipes saved here. You'll need a new invite to use it again.</p>${profile.role === 'owner' ? '<p class="hint">This is the Owner phone. Removing access deletes the Owner key, and a new key has to be added to the app.</p>' : ''}` });
    if (!ok) return;
    await access.wipeAccess();
    localStorage.removeItem('blg.expiredNotice');
    location.hash = ''; location.reload();
  };
}

// ---------------------------------------------------- About (RRA-012)

function aboutView() {
  setChrome({ tab: 'more', back: true });
  setTitle('About');
  view.innerHTML = `
    <div class="card center">
      <img src="assets/app-icon-192.png" alt="" width="84" height="84" style="border-radius:20px">
      <h2 style="margin:10px 0 0">${esc(APP_NAME)}</h2>
      <p class="muted">Version ${VERSION} · build ${BUILD}</p>
      <p class="small muted">Bootleggers Bar &amp; Grill · Augusta</p>
    </div>
    <div class="section-label">How to use it</div>
    <div class="card small">
      <p><b>Recipes:</b> house recipes are the rubs, sauces and dressings made in house. Tap <b>NEW RECIPE</b> to add one, with its ingredients, steps, yield and storage. A dish can link to the house recipes it uses.</p>
      <p><b>Stock:</b> the starter list of what the kitchen keeps on hand. Search it by name or dish.</p>
      <p><b>Notices:</b> messages from management to everyone. A red dot means something new.</p>
      <p><b>Access:</b> the app opens only on the phone a manager approved. It locks itself after ${INACTIVITY_DAYS} days without use.</p>
      <p><b>Install it:</b> on iPhone, tap Share, then Add to Home Screen. On Android, tap the menu, then Install app.</p>
    </div>
    <div class="group">
      <a class="row" href="#/whatsnew"><span class="grow">What's new</span></a>
      <a class="row" href="#/report"><span class="grow">Report a problem</span></a>
    </div>`;
}

function whatsNewView() {
  setChrome({ tab: 'more', back: true });
  setTitle("What's new");
  view.innerHTML = WHATS_NEW.map((w) => `
    <div class="card"><b>${esc(w.version)}</b> <span class="muted small">· build ${esc(w.build)} · ${esc(w.date)}</span>
    <ul>${w.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>`).join('');
}

// Report a problem → email via Web3Forms (no server).
async function sendReport({ subject, body }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `${REPORT_PREFIX} ${subject}`,
        from_name: APP_NAME,
        botcheck: '',
        message: `${subject}\n\n${body}`,
      }),
    });
    const j = await res.json();
    if (j && j.success) return 'sent';
    throw new Error('not sent');
  } catch {
    return 'failed';
  }
}

function reportView() {
  setChrome({ tab: 'more', back: true });
  setTitle('Report a problem');
  view.innerHTML = `
    <p class="muted small">Tell us what went wrong. Reports go to the app's inbox by email, so leave out anything private.</p>
    <label class="field"><span>What kind of problem?</span><select id="p-type">
      <option>Something isn't working</option><option>A recipe is wrong</option><option>Access or invite</option><option>Idea or request</option><option>Other</option></select></label>
    <label class="field"><span>Where in the app?</span><select id="p-where">
      <option>Recipes</option><option>Stock</option><option>Notices</option><option>Access / invites</option><option>Startup</option><option>Other</option></select></label>
    <label class="field"><span>What happened?</span><textarea id="p-body" placeholder="What you did, what you expected, what happened instead"></textarea></label>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn" id="p-send" type="button">Send report</button>
    </div>
    <button class="btn plain block" id="p-copy" type="button" style="margin-top:8px">Copy report text</button>
    <p id="p-status" class="small center"></p>`;
  const compose = () => {
    const subject = `${$('#p-where').value} · ${$('#p-type').value}`;
    const body = `${$('#p-body').value.trim()}\n\n— ${profile.name} (${access.ROLES[profile.role] || profile.role})\nApp ${VERSION} · build ${BUILD}\n${navigator.userAgent}`;
    return { subject, body };
  };
  $('#p-copy').onclick = () => { const r = compose(); copy(`${REPORT_PREFIX} ${r.subject}\n\n${r.body}`, 'Report copied'); };
  $('#p-send').onclick = async () => {
    if (!$('#p-body').value.trim()) { $('#p-status').textContent = 'Please describe the problem first.'; return; }
    if (!(await emailNotice())) return;
    const btn = $('#p-send');
    btn.disabled = true; btn.textContent = 'Sending…';
    const r = compose();
    const result = await sendReport(r);
    btn.disabled = false; btn.textContent = 'Send report';
    if (result === 'sent') {
      $('#p-body').value = '';
      $('#p-status').innerHTML = '<span style="color:var(--ok)">Sent. Thank you.</span>';
    } else {
      copy(`${REPORT_PREFIX} ${r.subject}\n\n${r.body}`, 'Not sent, so the report was copied');
      $('#p-status').innerHTML = '<span style="color:var(--danger)">It couldn\'t be sent (maybe no signal). The report text was copied so you can paste it in a message to a manager.</span>';
    }
  };
}

// ------------------------------------------------ Team (RRA-018)

async function teamView(incoming) {
  if (!access.can(profile, 'invite')) { location.hash = '#/more'; return; }
  setChrome({ tab: 'more', back: true });
  setTitle('Team access');
  const invites = (await access.issuedInvites()).sort((a, b) => b.iat - a.iat);
  view.innerHTML = `
    <div class="section-label">1. Send an invite</div>
    <div class="card">
      <label class="field" style="margin-top:0"><span>Their name</span><input type="text" id="i-name" placeholder="e.g. Sam (line cook)" autocomplete="off"></label>
      ${access.can(profile, 'invite.manager') ? `<label class="field"><span>Role</span><select id="i-role"><option value="staff">Staff</option><option value="manager">Manager (can invite staff)</option></select></label>` : ''}
      <button class="btn block" id="i-make" type="button">Create invite</button>
      <p class="muted small">Each invite works once, on one phone, within ${INVITE_HOURS} hours.</p>
    </div>
    <div class="section-label">2. Approve their phone</div>
    <div class="card">
      <p class="small muted" style="margin-top:0">When they open the invite, their phone gives them a request to send back to you. Paste it here.</p>
      <textarea id="a-code" placeholder="Paste the request" style="min-height:70px">${esc(incoming || '')}</textarea>
      <div class="btn-row" style="margin-top:10px">
        <button class="btn tonal" id="a-paste" type="button">Paste</button>
        <button class="btn" id="a-go" type="button">Check request</button>
      </div>
    </div>
    <div class="section-label">Invites from this phone</div>
    <div class="group">${invites.length ? invites.map((i) => `
      <div class="row"><span class="grow"><span class="title">${esc(i.name)} <span class="chip">${esc(access.ROLES[i.role])}</span></span>
      <span class="sub">Sent ${fmtDate(i.iat)} · id ${esc(i.iid)}</span></span>
      ${i.status === 'approved' ? '<span class="chip ok">Approved</span>' : Date.now() > i.exp ? '<span class="chip">Expired</span>' : '<span class="chip warn">Waiting</span>'}</div>`).join('')
      : '<div class="row muted">None yet.</div>'}</div>
    <p class="muted small">To take access away right now, send the invite id to the app's developer so it can be added to the revoked list. Otherwise access ends by itself after ${INACTIVITY_DAYS} days without use.</p>`;

  $('#i-make').onclick = async () => {
    const name = $('#i-name').value.trim();
    if (!name) { $('#i-name').focus(); return; }
    const role = $('#i-role')?.value || 'staff';
    const code = await access.createInvite(profile, name, role);
    const link = `${location.origin}${location.pathname}#t=${code}`;
    const text = `Bootleggers Kitchen invite for ${name}. Open this on your own phone (works once, for ${INVITE_HOURS} hours):\n${link}`;
    await sheet({
      title: 'Invite ready', left: null, right: 'Done',
      body: `<p>Send this to <b>${esc(name)}</b> by text message. It works once, only on the first phone that's approved.</p>
        <button class="btn block" id="s" type="button">Send invite</button>
        <button class="btn plain block" id="c" type="button" style="margin-top:6px">Copy invite</button>
        <p class="muted small">Next: they'll send you back a request. Paste it under “Approve their phone”.</p>`,
      onMount: ({ el }) => {
        $('#s', el).onclick = () => share('Bootleggers Kitchen invite', text);
        $('#c', el).onclick = () => copy(text, 'Invite copied');
      },
    });
    teamView();
  };
  $('#a-paste').onclick = () => pasteInto($('#a-code'));
  $('#a-go').onclick = async () => {
    let req;
    try { req = await access.readRequest($('#a-code').value); }
    catch (e) { toast(e.message); return; }
    const ok = await sheet({
      title: 'Approve phone', right: 'Approve',
      body: `<p><b>${esc(req.invite.name)}</b> · ${esc(access.ROLES[req.invite.role])}</p>
        <p>Ask them to read the code on their phone. It must match:</p>
        <div class="code-big">${esc(req.deviceCode)}</div>
        <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="match" style="width:22px;height:22px"> The code on their phone matches</label>`,
      onMount: (api) => { api.onRight = () => { if ($('#match', api.el).checked) api.close(true); else toast('Check the code with them first'); }; },
    });
    if (!ok) return;
    const code = await access.approve(profile, req);
    const text = `Bootleggers Kitchen activation for ${req.invite.name}. Copy this whole message, then open the app and tap Paste:\n${code}`;
    await sheet({
      title: 'Approved', left: null, right: 'Done',
      body: `<p>Send this activation back to <b>${esc(req.invite.name)}</b>. It only works on their phone.</p>
        <button class="btn block" id="s" type="button">Send activation</button>
        <button class="btn plain block" id="c" type="button" style="margin-top:6px">Copy activation</button>`,
      onMount: ({ el }) => {
        $('#s', el).onclick = () => share('Bootleggers Kitchen activation', text);
        $('#c', el).onclick = () => copy(text, 'Activation copied');
      },
    });
    teamView();
  };
}

// --------------------------------------------- locked screens (RRA-018)

function installHint(code) {
  if (!isIOS || standalone) return '';
  return `<div class="hint small"><b>iPhone: install first.</b> Tap the Share button, then <b>Add to Home Screen</b>. Open Bootleggers from your home screen and paste your code there.
    ${code ? `<button class="btn tonal small" id="copy-in" type="button" style="margin-top:8px">Copy my code</button>` : ''}</div>`;
}

async function lockedView(incoming) {
  setChrome({ locked: true });
  setTitle('');
  const pending = await access.pendingInvite();
  const ownerInfo = await access.ownerSetupInfo();
  const expired = localStorage.getItem('blg.expiredNotice');

  if (ownerInfo && !ROOT_KEYS.includes(ownerInfo.pub)) {
    view.innerHTML = `
      <h2>Owner setup</h2>
      <p>This phone made the Owner key below. The app opens for you once this key is added to the app and published.</p>
      <div class="card mono small">${esc(ownerInfo.pub)}</div>
      <button class="btn block" id="copy" type="button">Copy Owner key</button>
      <p class="muted small">The key is public: it lets other phones check that invites really come from you. The secret half never leaves this phone.</p>
      <button class="btn plain block" id="restart" type="button">Start over</button>`;
    $('#copy').onclick = () => copy(ownerInfo.pub, 'Owner key copied');
    $('#restart').onclick = async () => { await store.wipe(); location.reload(); };
    return;
  }

  if (pending) {
    view.innerHTML = `
      <h2>Almost there, ${esc(pending.name)}</h2>
      <p><b>Step 1.</b> Send your request to the manager who invited you.</p>
      <button class="btn block" id="send" type="button">Send request</button>
      <p style="margin-top:18px"><b>Step 2.</b> Your manager will ask for this code. Read it to them:</p>
      <div class="code-big">${esc(pending.deviceCode)}</div>
      <p style="margin-top:18px"><b>Step 3.</b> Paste the activation your manager sends back.</p>
      <textarea id="code" placeholder="Paste the activation" style="min-height:70px">${esc(incoming || '')}</textarea>
      <div class="btn-row" style="margin-top:10px">
        <button class="btn tonal" id="paste" type="button">Paste</button>
        <button class="btn" id="go" type="button">Open the app</button>
      </div>
      <p id="err" class="small" style="color:var(--danger)"></p>
      <button class="btn plain block" id="restart" type="button">Use a different invite</button>`;
    const req = `Bootleggers Kitchen request from ${pending.name}. Paste this in the app under More → Invite and approve staff:\n${pending.request}`;
    $('#send').onclick = () => share('Bootleggers Kitchen request', req);
    $('#paste').onclick = () => pasteInto($('#code'));
    $('#go').onclick = async () => {
      try { profile = await access.activate($('#code').value); localStorage.removeItem('blg.expiredNotice'); toast(`Welcome, ${profile.name}`); boot(); }
      catch (e) { $('#err').textContent = e.message; }
    };
    $('#restart').onclick = async () => { await store.del('pending'); lockedView(); };
    if (incoming) $('#go').click();
    return;
  }

  view.innerHTML = `
    ${expired ? `<div class="hint"><b>Your access ended</b> after ${INACTIVITY_DAYS} days without use, or a manager removed it. Ask a manager for a new invite.</div>` : ''}
    <h2>Invite only</h2>
    <p>Bootleggers Kitchen is for the Bootleggers team. A manager sends you an invite, and it opens on your phone only.</p>
    ${installHint(incoming)}
    <textarea id="code" placeholder="Paste your invite" style="min-height:70px">${esc(incoming || '')}</textarea>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn tonal" id="paste" type="button">Paste</button>
      <button class="btn" id="go" type="button">Continue</button>
    </div>
    <p id="err" class="small" style="color:var(--danger)"></p>
    ${ROOT_KEYS.length ? '' : `<div class="card" style="margin-top:28px"><b>Owner setup</b><p class="small muted">No Owner key is set yet. If you are the Owner, set it up on your own phone${isIOS ? ', from the home screen app' : ''}.</p>
      <button class="btn tonal block" id="owner" type="button">I'm the Owner: set up this phone</button></div>`}`;
  $('#copy-in')?.addEventListener('click', () => copy(incoming, 'Code copied'));
  $('#paste').onclick = () => pasteInto($('#code'));
  $('#go').onclick = async () => {
    const raw = $('#code').value;
    const t = access.parse(raw);
    try {
      if (t?.kind === 'act') throw new Error('This is an activation. Open your invite first.');
      await access.acceptInvite(raw);
      lockedView();
    } catch (e) { $('#err').textContent = e.message; }
  };
  // Opening an invite link goes straight on, except in iPhone Safari where
  // the person should install the app first (Safari and the home screen app
  // keep separate storage).
  if (incoming && !(isIOS && !standalone)) $('#go').click();
  $('#owner')?.addEventListener('click', async () => {
    const name = await sheet({
      title: 'Owner setup', right: 'Create key',
      body: `<p>This makes the Owner key on this phone. Only do this once, on the Owner's own phone${isIOS ? ' (open the app from the home screen first)' : ''}.</p>
        <label class="field"><span>Your name</span><input type="text" id="o-name" value="Gaylan"></label>`,
      onMount: (api) => { api.onRight = () => api.close($('#o-name', api.el).value.trim() || 'Owner'); },
    });
    if (!name) return;
    await access.ownerSetup(name);
    lockedView();
  });
}

// ------------------------------------------------------------ routing

const routes = {
  recipes: () => recipesView(),
  recipe: (id) => recipeView(id),
  stock: () => stockView(),
  notices: () => noticesView(),
  more: () => moreView(),
  about: () => aboutView(),
  whatsnew: () => whatsNewView(),
  report: () => reportView(),
  team: (arg) => teamView(arg),
};

async function route() {
  if (!profile) return;
  const [, name = 'recipes', arg] = location.hash.match(/^#\/([^/]+)\/?(.*)$/) || [];
  (routes[name] || routes.recipes)(arg ? decodeURIComponent(arg) : undefined);
}

$('#btn-back').onclick = () => (history.length > 1 ? history.back() : (location.hash = '#/recipes'));
$('#btn-bell').onclick = () => { location.hash = '#/notices'; };
window.addEventListener('hashchange', route);

// A code can arrive in the link (#t=...). Take it out of the address bar.
function takeIncoming() {
  const m = location.hash.match(/^#t=(.+)$/);
  if (!m) return null;
  history.replaceState(null, '', location.pathname + location.search);
  return decodeURIComponent(m[1]);
}

async function boot() {
  const incoming = takeIncoming();
  await access.loadRevocations();
  profile = await access.currentProfile();
  if (access.isExpired() && profile?.role !== 'owner') {
    await access.wipeAccess();
    profile = null;
  }
  await startupScreen();
  if (!profile) {
    // Revoked activation on this phone: clear it so the phone can be invited again.
    if (await store.get('profile')) { await access.wipeAccess(); }
    return lockedView(incoming);
  }
  access.touch();
  await noticeGate();
  if (incoming && access.parse(incoming)?.kind === 'req') { location.hash = '#/team'; return teamView(incoming); }
  if (!location.hash || location.hash === '#') location.hash = '#/recipes'; else route();
  loadNotices();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && profile) { access.touch(); loadNotices(); }
});

// Offline support and update prompt.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('An update is ready', { label: 'Update', run: () => nw.postMessage('skipWaiting') });
        }
      });
    });
  }).catch(() => {});
  // Reload only when an update takes over, not on the very first install.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloading) { reloading = true; location.reload(); }
  });
}

boot();

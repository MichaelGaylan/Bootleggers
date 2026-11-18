// Shared helpers for every screen.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const view = $('#view');
export const dlg = $('#dlg');
export const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('blg.' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('blg.' + k, JSON.stringify(v)),
};
export const isIOS = document.documentElement.classList.contains('is-ios');
export const standalone = document.documentElement.classList.contains('standalone');

// ---------------------------------------------------------------- helpers

export function toast(msg, action) {
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

export async function copy(text, done = 'Copied') {
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

export async function share(title, text) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  copy(text, 'Copied. Paste it into a text message.');
}

export async function pasteInto(ta) {
  try { ta.value = await navigator.clipboard.readText(); ta.dispatchEvent(new Event('input')); }
  catch { ta.focus(); toast('Long-press the box and tap Paste'); }
}

// Opens the bottom sheet. Resolves with whatever close(value) gets.
export function sheet({ title, body, left = 'Cancel', right, onMount, dismissable = true }) {
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

export function setTitle(text, actionHtml = '') {
  $('#title').textContent = text;
  $('#title-action').innerHTML = actionHtml;
}

export function setChrome({ locked = false, tab = null, back = false }) {
  document.body.classList.toggle('locked', locked);
  $('#tabs').hidden = locked;
  $('#btn-bell').hidden = locked;
  $('#btn-back').hidden = !back;
  $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  window.scrollTo(0, 0);
}

export const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// Who is using this phone, and the latest notices. Set by app.js.
export const session = { profile: null, notices: [] };

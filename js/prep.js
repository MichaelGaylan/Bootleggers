// Interactive prep lists (RRA-005): a standing list per station; each day
// starts unticked, and cooks tick items off as they finish them.

import * as data from './data.js';
import { $, $$, esc, view, sheet, toast, setTitle, setChrome, session } from './ui.js';
import { canChange } from './perms.js';

let editing = false;

export async function prepView() {
  setChrome({ tab: 'prep' });
  const change = canChange('prep');
  const settings = await data.settings();
  const stations = settings.stations || [];
  const items = (await data.list('prepitem')).sort((a, b) => (a.order || 0) - (b.order || 0) || data.byName(a, b));
  const day = data.today();
  const done = (await data.get('prepday', day)) || { id: day, done: {} };
  setTitle(editing ? 'Edit prep list' : "Today's prep", change ? `<button class="btn plain small" id="edit" type="button">${editing ? 'Done' : 'Edit'}</button>` : '');
  const byStation = {};
  for (const it of items) (byStation[it.station || 'Other'] ||= []).push(it);
  const order = [...stations, ...Object.keys(byStation).filter((s) => !stations.includes(s))];
  const total = items.length;
  const finished = items.filter((i) => done.done[i.id]).length;
  view.innerHTML = `
    <p class="muted small">${new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}${total ? ` · ${finished} of ${total} done` : ''}</p>
    ${order.filter((s) => byStation[s]).map((s) => `
      <div class="section-label">${esc(s)}</div>
      <div class="group">${byStation[s].map((i) => {
        const d = done.done[i.id];
        return `<div class="row ${d && !editing ? 'done' : ''}" data-id="${i.id}">
          ${editing ? `<button class="rm" type="button" data-rm="${i.id}" aria-label="Remove">−</button>` : '<span class="chk"></span>'}
          <span class="grow"><span class="title">${esc(i.name)}</span>${d && !editing ? `<span class="sub">${esc(d.by)} · ${new Date(d.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>` : ''}</span>
          <span class="meta">${esc(i.amount || '')}</span></div>`;
      }).join('')}</div>`).join('') || `<div class="empty">No prep items yet.${change ? '<br>Tap <b>Edit</b> to add what gets prepped each day.' : ''}</div>`}
    ${editing ? '<button class="btn tonal block" id="add" type="button">+ Add prep item</button><p class="muted small">Stations are set in Settings → Prep stations.</p>' : total ? '<p class="muted small center">Tap an item when it\'s done. The list starts fresh each day.</p>' : ''}`;
  $('#edit')?.addEventListener('click', () => { editing = !editing; prepView(); });
  $('#add')?.addEventListener('click', () => itemDialog(stations));
  if (!editing) {
    $$('.row[data-id]', view).forEach((row) => {
      row.onclick = async () => {
        const id = row.dataset.id;
        if (done.done[id]) delete done.done[id]; else done.done[id] = { by: session.profile.name, at: Date.now() };
        await data.put('prepday', done);
        prepView();
      };
    });
  }
  $$('[data-rm]', view).forEach((b) => {
    b.onclick = async (e) => {
      e.stopPropagation();
      await data.remove('prepitem', b.dataset.rm);
      toast('Removed');
      prepView();
    };
  });
}

async function itemDialog(stations) {
  const it = await sheet({
    title: 'Add prep item', right: 'Add',
    body: `<label class="field"><span>What to prep</span><input type="text" id="i-name" placeholder="e.g. Slice tomatoes"></label>
      <label class="field"><span>Amount</span><input type="text" id="i-amt" placeholder="e.g. 2 qt"></label>
      <label class="field"><span>Station</span><select id="i-st">${(stations.length ? stations : ['Other']).map((s) => `<option>${esc(s)}</option>`).join('')}</select></label>`,
    onMount: (api) => { api.onRight = () => { const n = $('#i-name', api.el).value.trim(); if (n) api.close({ name: n, amount: $('#i-amt', api.el).value.trim(), station: $('#i-st', api.el).value, order: Date.now() }); }; },
  });
  if (!it) return;
  await data.put('prepitem', it);
  prepView();
}

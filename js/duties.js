// My job duties (RRA-159), in the Employee lounge. Each person sees the duty
// list for their own job title: opening, during the shift, closing and side
// work. The Admin and managers can open every job's list and rewrite it,
// including custom titles. Starter lists live in js/brand.js (jobDuties); a
// rewritten list is kept in the shared settings (settings.jobDuties) and shows
// as it was typed. The starter lists are translated with the rest of the app.

import * as data from './data.js';
import { $, esc, view, sheet, toast, setTitle, setChrome, session } from './ui.js';
import { isHost, myStaff } from './perms.js';
import { positionList } from './schedule.js';
import { printButtons, wirePrint } from './pdf.js';

const PARTS = [['o', 'Opening'], ['s', 'During the shift'], ['c', 'Closing'], ['w', 'Side work']];
const canEdit = () => isHost() || session.profile?.role === 'manager';
const starter = (title) => (globalThis.BRAND?.jobDuties || {})[title] || null;
async function dutiesOf(title) {
  const own = ((await data.settings()).jobDuties || {})[title];
  if (own) return { list: own, own: true };
  return { list: starter(title), own: false };
}

export async function dutiesView(arg) {
  setChrome({ tab: 'lounge', back: true });
  setTitle('My job duties');
  const mine = myStaff()?.position || '';
  const titles = await positionList(mine || undefined);
  const edit = canEdit();
  let title = arg || mine;
  if (!title || (!edit && title !== mine)) title = mine;
  if (!title && edit) title = titles[0];
  if (!title) {
    view.innerHTML = '<div class="empty">No job title yet. Ask a manager to set your Position in Settings → Staff.</div>';
    return;
  }
  const { list, own } = await dutiesOf(title);
  const cls = own ? ' notr' : '';
  view.innerHTML = `
    ${edit ? `<label class="field no-print"><span>Job title</span><select id="du-title">${titles.map((x) => `<option value="${esc(x)}"${x === title ? ' selected' : ''}>${esc(x)}${x === mine ? ' ★' : ''}</option>`).join('')}</select></label>` : ''}
    <div class="duties-page">
      <h2 style="margin:4px 0 2px">${esc(title)}</h2>
      ${title === mine ? '<p class="muted small" style="margin-top:0">Your job</p>' : ''}
      ${list && PARTS.some(([k]) => (list[k] || []).length) ? PARTS.filter(([k]) => (list[k] || []).length).map(([k, label]) => `<div class="section-label">${label}</div>
        <div class="card"><ul class="duties${cls}">${list[k].map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>`).join('')
      : `<p class="muted">No duties written for ${esc(title)} yet.${edit ? ' Tap Edit duties to add them.' : ' Ask a manager.'}</p>`}
    </div>
    ${edit ? `<div class="btn-row no-print"><button class="btn tonal" id="du-edit" type="button">Edit duties</button>${own && starter(title) ? '<button class="btn plain" id="du-reset" type="button">Back to the starter list</button>' : ''}</div>` : ''}
    ${printButtons()}
    <p class="muted small no-print">${edit ? 'You can change any job\'s duties. Everyone with that job sees the change.' : 'Only the Admin and managers can change these.'}</p>`;
  $('#du-title')?.addEventListener('change', (e) => { location.hash = '#/duties/' + encodeURIComponent(e.target.value); });
  wirePrint({ title: `${title} - duties`, $, getLines: () => PARTS.flatMap(([k, label]) => ((list || {})[k] || []).length ? ['# ' + label, ...list[k].map((d) => '- ' + d), ''] : []) });
  $('#du-edit')?.addEventListener('click', async () => {
    const res = await sheet({
      title: `Edit duties · ${title}`, right: 'Save',
      body: `<p class="muted small" style="margin-top:0">One duty per line. What you type shows exactly as written, in every language.</p>
        ${PARTS.map(([k, label]) => `<label class="field"><span>${label}</span><textarea data-k="${k}" style="min-height:90px">${esc(((list || {})[k] || []).join('\n'))}</textarea></label>`).join('')}`,
      onMount(api) {
        api.onRight = () => api.close(Object.fromEntries(PARTS.map(([k]) => [k, api.el.querySelector(`[data-k="${k}"]`).value.split('\n').map((x) => x.trim()).filter(Boolean)])));
      },
    });
    if (!res) return;
    const s = await data.settings();
    await data.saveSettings({ ...s, jobDuties: { ...(s.jobDuties || {}), [title]: res } });
    toast('Duties saved for everyone');
    dutiesView(title);
  });
  $('#du-reset')?.addEventListener('click', async () => {
    const s = await data.settings();
    const jd = { ...(s.jobDuties || {}) }; delete jd[title];
    await data.saveSettings({ ...s, jobDuties: jd });
    toast('Back to the starter list');
    dutiesView(title);
  });
}

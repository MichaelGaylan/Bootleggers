// Message board (RRA-004): posts to everyone, the kitchen or managers, with
// replies. Store-and-forward: posts wait until people open the app. Not
// end-to-end private. Notices from management (RRA-015) are pinned on top.

import * as data from './data.js';
import { $, $$, esc, view, LS, sheet, toast, setTitle, setChrome, session } from './ui.js';
import { canChange, isHost } from './perms.js';

const CHANNELS = { all: 'Everyone', kitchen: 'Kitchen', managers: 'Managers' };
const inManagers = () => isHost() || ['manager', 'chef'].includes(session.profile?.role);

const when = (t) => {
  const d = new Date(t);
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export async function unreadPosts() {
  const seen = LS.get('boardSeen', 0);
  return (await data.list('post')).filter((p) => p.at > seen && p.by !== session.profile?.name && (p.channel !== 'managers' || inManagers())).length;
}

export async function boardView() {
  setChrome({ tab: 'board' });
  setTitle('Message board');
  const ch = LS.get('boardChannel', 'all');
  const posts = (await data.list('post')).filter((p) => (ch === 'all' ? true : p.channel === ch) && (p.channel !== 'managers' || inManagers())).sort((a, b) => b.at - a.at);
  const read = new Set(LS.get('read', []));
  const notices = session.notices || [];
  view.innerHTML = `
    <div class="segmented">${Object.entries(CHANNELS).filter(([k]) => k !== 'managers' || inManagers()).map(([k, n]) => `<button type="button" data-ch="${k}" class="${ch === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    ${ch === 'all' && notices.length ? `<div class="section-label">From management</div>${notices.slice(0, 3).map((n) => `
      <div class="msg notice"><div class="who">${esc(n.from || 'Management')} · ${esc(n.date || '')} ${read.has(n.id) ? '' : '<span class="chip warn">New</span>'}</div><b>${esc(n.title)}</b><br>${esc(n.body)}</div>`).join('')}` : ''}
    ${canChange('board') ? `<div class="card" style="padding:12px">
      <textarea id="p-text" style="min-height:56px" placeholder="Write to ${ch === 'all' ? 'everyone' : CHANNELS[ch].toLowerCase()}"></textarea>
      <button class="btn block" id="p-send" type="button" style="margin-top:8px">Post</button></div>` : ''}
    ${posts.map((p) => `
      <div class="msg" data-id="${p.id}"><div class="who">${esc(p.by)} · ${when(p.at)} · ${CHANNELS[p.channel]}</div>${esc(p.text).replace(/\n/g, '<br>')}
        ${(p.replies || []).map((r) => `<div class="reply"><span class="who">${esc(r.by)} · ${when(r.at)}</span><br>${esc(r.text)}</div>`).join('')}
        <div class="btn-row" style="margin-top:6px">${canChange('board') ? '<button class="btn plain small" data-reply type="button">Reply</button>' : ''}
        ${p.by === session.profile.name || isHost() ? '<button class="btn danger small" data-del type="button">Delete</button>' : ''}</div>
      </div>`).join('') || '<div class="empty">No posts yet.</div>'}
    <p class="muted small center">Posts wait for people who are off shift. The board is not end-to-end private.</p>`;
  LS.set('boardSeen', Date.now());
  LS.set('read', notices.map((n) => n.id));
  boardView.after?.();
  $$('[data-ch]', view).forEach((b) => { b.onclick = () => { LS.set('boardChannel', b.dataset.ch); boardView(); }; });
  $('#p-send')?.addEventListener('click', async () => {
    const text = $('#p-text').value.trim();
    if (!text) return;
    await data.put('post', { text, by: session.profile.name, at: Date.now(), channel: ch, replies: [] });
    toast('Posted');
    boardView();
  });
  $$('[data-reply]', view).forEach((b) => {
    b.onclick = async () => {
      const p = posts.find((x) => x.id === b.closest('[data-id]').dataset.id);
      const text = await sheet({
        title: 'Reply', right: 'Send',
        body: `<p class="muted small">${esc(p.by)}: ${esc(p.text.slice(0, 120))}</p><textarea id="r-text" style="min-height:80px"></textarea>`,
        onMount: (api) => { api.onRight = () => { const t = $('#r-text', api.el).value.trim(); if (t) api.close(t); }; },
      });
      if (!text) return;
      p.replies = [...(p.replies || []), { by: session.profile.name, at: Date.now(), text }];
      await data.put('post', p);
      boardView();
    };
  });
  $$('[data-del]', view).forEach((b) => {
    b.onclick = async () => {
      const id = b.closest('[data-id]').dataset.id;
      const ok = await sheet({ title: 'Delete post?', right: 'Delete', body: '<p>Delete this post and its replies?</p>' });
      if (ok) { await data.remove('post', id); boardView(); }
    };
  });
}

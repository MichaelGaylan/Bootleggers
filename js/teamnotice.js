// Team notices (RRA-161, Gaylan 2026-11-27): when anyone invites, approves or
// removes a person, everyone in a management job title and the Admin get a
// private notice on the bulletin board and a pop-up, "so to keep everyone on
// the same page when a new hire is expected and being considered."

import * as data from './data.js';
import { esc, sheet, dlg, LS, session } from './ui.js';
import { sendPost } from './board.js';
import { canSeePost, sentByMe } from './audience.js';
import { t } from './i18n.js';

const TITLE = { invite: 'New hire expected', approve: 'Phone approved', remove: 'Removed from the team' };
const TEXT = {
  invite: '{0} sent an app invite to {1}.',
  approve: "{0} approved {1}'s phone. They can use the app now.",
  remove: '{0} removed {1} from the team. Their app access ended.',
};
const who = (a) => (a.extra ? `${a.who} (${a.extra})` : a.who);

// kind: invite | approve | remove. name: the person's name. extra: their job.
export async function teamNotice(kind, name, extra = '') {
  const by = session.profile?.viewAs ? `${session.profile.name} (Admin)` : session.profile?.name || 'Someone';
  const about = { team: kind, who: name, extra, by };
  const text = TEXT[kind].replace('{0}', by).replace('{1}', who(about));
  try { await sendPost({ text, to: { kind: 'group', group: 'mgmt' }, about }); } catch { /* the invite, approval or removal still went through */ }
}

// Team notices for this phone that it hasn't shown yet.
export async function unseenTeamNotices() {
  const seen = new Set(LS.get('teamSeen', []));
  return (await data.list('post')).filter((p) => p.about?.team && !sentByMe(p) && canSeePost(p) && !seen.has(p.id));
}

// Show the new ones once, like a notice from management.
export async function teamNoticePopup() {
  if (!session.profile || dlg.open || teamNoticePopup.busy) return false;
  const list = (await unseenTeamNotices()).sort((a, b) => a.at - b.at);
  if (!list.length) return false;
  teamNoticePopup.busy = true;
  LS.set('teamSeen', [...LS.get('teamSeen', []), ...list.map((p) => p.id)].slice(-300));
  const line = (p) => (TEXT[p.about.team] ? t(TEXT[p.about.team], p.about.by, who(p.about)) : p.text);
  const rows = list.slice(-5).map((p) => `<p><b>${esc(t(TITLE[p.about.team] || 'Team notice'))}</b><br><span class="notr">${esc(line(p))}</span><br><span class="muted small notr">${esc(new Date(p.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }))}</span></p>`).join('');
  try {
    await sheet({ title: 'Team notice', left: null, right: 'OK', body: `${rows}<p class="muted small">Sent to everyone in a management job and the Admin. It's also on the bulletin board.</p>` });
  } finally { teamNoticePopup.busy = false; }
  return false; // nothing on the screen behind it changed
}

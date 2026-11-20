// Shared team data through Firebase (RRA-031).
//
// Every record is encrypted on the phone with the team key before it goes to
// Firestore, so Google (and anyone who gets hold of the public Firebase
// config) only ever sees scrambled data. Phones sign in anonymously; the
// Firestore rules in firestore.rules only let signed-in phones read and write.
//
// Layout: teams/bootleggers/docs/{collection}~{id} = { c, i, u, d, iv, ct }
//   c collection, i id, u updated (ms), d deleted flag, iv + ct the sealed record.

import { FIREBASE } from './config.js';
import * as data from './data.js';
import * as store from './store.js';
import { b64uEnc, b64uDec, importTeamKey } from './crypto.js';
import { teamKeyBytes, ensureTeamKey } from './access.js';
import { canTime, myStaff } from './perms.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const COLLS = ['recipe', 'stock', 'vendor', 'staff', 'prepitem', 'prepday', 'post', 'week', 'swap', 'event', 'waste', 'punch', 'prepsaved', 'settings'];
const te = new TextEncoder();
const td = new TextDecoder();

let state = FIREBASE ? 'starting' : 'off';
let detail = '';
export const status = () => ({ state, detail });
export const enabled = () => !!FIREBASE;

let fs = null;
let db = null;
let key = null;
let connecting = null;
let inboxFn = null;
export const onInbox = (fn) => { inboxFn = fn; };

// One Firebase connection per page, used by sync and by the request inbox.
function connect() {
  if (!connecting) {
    connecting = (async () => {
      const [{ initializeApp }, auth, firestore] = await Promise.all([
        import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js'),
      ]);
      fs = firestore;
      const app = initializeApp(FIREBASE);
      await auth.signInAnonymously(auth.getAuth(app));
      db = fs.getFirestore(app);
    })();
    connecting.catch(() => { connecting = null; });
  }
  return connecting;
}

const inboxRef = (iid) => fs.doc(db, 'teams', 'bootleggers', 'docs', docPath('inbox', iid));

// New phone: leave a sealed request for the inviter (RRA-043).
export async function postRequest(iid, box) {
  if (!FIREBASE) return false;
  await connect();
  await fs.setDoc(inboxRef(iid), { c: 'inbox', i: iid, u: Date.now(), d: false, iv: '', ct: JSON.stringify(box) });
  return true;
}

// Inviter: clear a request once it has been handled.
export async function clearRequest(iid) {
  if (!FIREBASE || !db) return;
  await fs.setDoc(inboxRef(iid), { c: 'inbox', i: iid, u: Date.now(), d: true, iv: '', ct: '' }).catch(() => {});
}
const docPath = (c, i) => `${c}~${i}`;

async function seal(obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)));
  return { iv: b64uEnc(iv), ct: b64uEnc(ct) };
}
async function open(rec) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64uDec(rec.iv) }, key, b64uDec(rec.ct));
  return JSON.parse(td.decode(pt));
}

async function push(coll, doc) {
  if (!db) return;
  const box = await seal(doc);
  await fs.setDoc(fs.doc(db, 'teams', 'bootleggers', 'docs', docPath(coll, doc.id)), { c: coll, i: doc.id, u: doc.updated || Date.now(), d: false, ...box });
}
async function drop(coll, id) {
  if (!db) return;
  await fs.setDoc(fs.doc(db, 'teams', 'bootleggers', 'docs', docPath(coll, id)), { c: coll, i: id, u: Date.now(), d: true, iv: '', ct: '' });
}

async function localDoc(coll, id) {
  return coll === 'settings' ? data.settings() : data.get(coll, id);
}

export async function start(profile, onStatus = () => {}) {
  if (!FIREBASE) return;
  const set = (s, d = '') => { state = s; detail = d; onStatus(status()); };
  try {
    if (!(await ensureTeamKey(profile))) { set('nokey', 'This phone has no team key yet. Ask a manager to invite it again.'); return; }
    key = await importTeamKey(await teamKeyBytes());
    await connect();
    data.useSync({
      push: (c, d) => push(c, d).catch((e) => set('error', e.message)),
      drop: (c, i) => drop(c, i).catch((e) => set('error', e.message)),
    });
    let first = true;
    fs.onSnapshot(fs.collection(db, 'teams', 'bootleggers', 'docs'), async (snap) => {
      const seen = new Set();
      for (const ch of snap.docChanges()) {
        const r = ch.doc.data();
        seen.add(docPath(r.c, r.i));
        if (r.c === 'inbox') { if (!r.d && inboxFn) { try { await inboxFn(r.i, JSON.parse(r.ct)); } catch { /* not for this phone */ } } continue; }
        if (!COLLS.includes(r.c)) continue;
        const mine = await localDoc(r.c, r.i);
        if (mine && (mine.updated || 0) >= r.u) continue; // ours is as new or newer
        try {
          if (r.c === 'settings') { if (!r.d) await data.applyRemoteSettings(await open(r)); }
          else {
            const doc = r.d ? null : await open(r);
            // Someone else's hours stay off phones that can't see time sheets (RRA-055).
            if (doc && r.c === 'punch' && !canTime() && doc.staffId !== myStaff()?.id) continue;
            await data.applyRemote(r.c, r.i, doc);
          }
        } catch { set('error', 'Some shared data could not be opened with this phone\'s team key.'); }
      }
      if (first) {
        first = false;
        // Send up anything this phone has that the team doesn't have yet.
        for (const c of COLLS) {
          if (c === 'settings') {
            const s = await data.settings();
            const remote = snap.docs.find((d) => d.id === docPath('settings', 'settings'))?.data();
            if (Object.keys(s).length && (!remote || (s.updated || 0) > remote.u)) await push('settings', { id: 'settings', ...s });
            continue;
          }
          for (const d of await data.list(c)) {
            const remote = snap.docs.find((x) => x.id === docPath(c, d.id))?.data();
            if (!remote || (d.updated || 0) > remote.u) await push(c, d);
          }
        }
        await store.put('synced', { at: Date.now() });
      }
      set('on');
    }, (err) => set('error', err.message));
  } catch (e) {
    set('error', e.message || String(e));
  }
}

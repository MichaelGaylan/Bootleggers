// Invite-only access (RRA-018) and expiry (RRA-019). No server is needed.
//
// Every code is "BLG1.<kind>.<payload>.<signature>":
//   inv  invite      signed by a Manager or Host device, valid for INVITE_HOURS
//   req  request     signed by the new phone's own device key
//   act  activation  signed by the Manager, names the new phone's device key
//
// Flow: the Manager sends an invite. The new phone turns it into a request
// tied to its own device key and shows a short device code. The Manager
// checks that code with the person and approves. Each invite can be approved
// once, and an activation only works on the phone whose key it names, so a
// forwarded invite or activation does not open the app anywhere else.
//
// Trust: an Host key is listed in config ROOT_KEYS. A Manager's activation
// (signed by the Host) travels with every code that Manager signs ("chain").

import { ROOT_KEYS, INVITE_HOURS, INACTIVITY_DAYS, ACCESS_URL } from './config.js';
import { sign, verify, exportPublic, shortCode, randomId, textToB64u, b64uToText, sealTo, openFrom, b64uEnc, b64uDec, newTeamKeyBytes } from './crypto.js';
import * as store from './store.js';

const LAST_USED = 'blg.lastUsed';
const DAY = 86400000;

// The internal key stays 'owner' so existing codes keep working; people see "Host".
export const ROLES = { owner: 'Host', manager: 'Manager', chef: 'Chef', staff: 'Staff' };
const CAN_INVITE = ['owner', 'manager'];

// Hook for RRA-002 (roles and permissions). Everyone can do everything that
// is built today, except handing out invites.
export function can(profile, action) {
  if (!profile) return false;
  if (action === 'invite') return CAN_INVITE.includes(profile.role);
  if (action === 'invite.manager') return profile.role === 'owner';
  return true;
}

export async function myPublicKey() {
  const k = await store.deviceKey();
  return exportPublic(k.publicKey);
}

export const deviceCode = (pub) => shortCode(pub);

async function signToken(kind, payload) {
  const k = await store.deviceKey();
  const head = `BLG1.${kind}.${textToB64u(JSON.stringify(payload))}`;
  return `${head}.${await sign(k.privateKey, head)}`;
}

export function parse(code) {
  const m = String(code || '').match(/BLG1\.(inv|req|act)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    return { kind: m[1], head: `BLG1.${m[1]}.${m[2]}`, sig: m[3], payload: JSON.parse(b64uToText(m[2])), raw: m[0] };
  } catch {
    return null;
  }
}

let revoked = new Set();
export async function loadRevocations() {
  try {
    const r = await fetch(ACCESS_URL, { cache: 'no-store' });
    if (r.ok) revoked = new Set((await r.json()).revoked || []);
  } catch { /* offline: keep what we had */ }
  return revoked;
}

// Checks the signature and that the signer traces back to an Host key.
// Returns the payload or throws an Error with a plain-language message.
export async function check(code, kind) {
  const t = typeof code === 'string' ? parse(code) : code;
  if (!t) throw new Error("That doesn't look like a Bootleggers code.");
  if (t.kind !== kind) throw new Error(`This is ${kindName(t.kind)}, not ${kindName(kind)}.`);
  const p = t.payload;
  if (!(await verify(p.by, t.head, t.sig))) throw new Error('This code has been changed or damaged.');
  if (kind === 'req') return p; // self-signed by the new phone; trust comes from the Manager's approval
  await checkSigner(p);
  if (p.iid && revoked.has(p.iid)) throw new Error('This access has been withdrawn.');
  return p;
}

async function checkSigner(p) {
  if (ROOT_KEYS.includes(p.by)) return;
  if (!p.chain) throw new Error('This code was not signed by a Bootleggers manager.');
  const c = await check(p.chain, 'act');
  if (c.dev !== p.by || !CAN_INVITE.includes(c.role)) throw new Error('This code was not signed by a Bootleggers manager.');
}

function kindName(k) {
  return { inv: 'an invite', req: 'an approval request', act: 'an activation code' }[k] || 'a code';
}

// ----- Manager side -----

export async function createInvite(profile, name, role) {
  const pub = await myPublicKey();
  const iid = randomId(9);
  const now = Date.now();
  const payload = { iid, name, role, iat: now, exp: now + INVITE_HOURS * 3600000, by: pub };
  if (profile.activation) payload.chain = profile.activation;
  const code = await signToken('inv', payload);
  await store.put(`invite:${iid}`, { iid, name, role, iat: now, exp: payload.exp, status: 'sent' });
  return code;
}

export const issuedInvites = () => store.all('invite:');

// Reads a request; returns what the Manager must confirm before approving.
export async function readRequest(code) {
  const p = await check(code, 'req');
  const inv = await store.get(`invite:${p.iid}`);
  if (!inv) throw new Error('This request is for an invite sent from another phone. Only the manager who sent the invite can approve it.');
  if (inv.status === 'approved') throw new Error(`The invite for ${inv.name} was already used. Each invite works once.`);
  if (Date.now() > inv.exp) throw new Error(`The invite for ${inv.name} has expired. Send a new one.`);
  return { invite: inv, dev: p.dev, ek: p.ek, deviceCode: await deviceCode(p.dev) };
}

export async function approve(profile, request) {
  const { invite, dev } = request;
  const payload = { iid: invite.iid, name: invite.name, role: invite.role, dev, iat: Date.now(), by: await myPublicKey() };
  if (profile.activation) payload.chain = profile.activation;
  // Hand over the team key for shared data, sealed so only the new phone can open it.
  const tk = await teamKeyBytes();
  if (tk && request.ek) payload.tk = await sealTo(request.ek, tk);
  const code = await signToken('act', payload);
  await store.put(`invite:${invite.iid}`, { ...invite, status: 'approved', approved: Date.now(), deviceCode: request.deviceCode });
  return code;
}

// ----- Team key (shared data, RRA-031) -----
// One AES key for the whole team encrypts everything stored online. The Host
// phone makes it; each approval passes it on, sealed to the new phone.

export async function teamKeyBytes() {
  const b = await store.get('teamkey');
  return b ? b64uDec(b) : null;
}

export async function ensureTeamKey(profile) {
  if (await store.get('teamkey')) return true;
  if (profile?.role !== 'owner') return false;
  await store.put('teamkey', b64uEnc(newTeamKeyBytes()));
  return true;
}

// ----- New phone side -----

export async function acceptInvite(code) {
  const p = await check(code, 'inv');
  if (Date.now() > p.exp) throw new Error('This invite has expired. Ask your manager for a new one.');
  const dev = await myPublicKey();
  const ek = await exportPublic((await store.ecdhKey()).publicKey);
  const req = await signToken('req', { iid: p.iid, name: p.name, dev, ek, iat: Date.now(), by: dev });
  const pending = { iid: p.iid, name: p.name, role: p.role, from: p.by, request: req, deviceCode: await deviceCode(dev) };
  await store.put('pending', pending);
  return pending;
}

export const pendingInvite = () => store.get('pending');

export async function activate(code) {
  const p = await check(code, 'act');
  const dev = await myPublicKey();
  if (p.dev !== dev) throw new Error('This activation code belongs to a different phone. Activation codes only work on the phone that asked for them.');
  if (p.tk) {
    try { await store.put('teamkey', b64uEnc(await openFrom((await store.ecdhKey()).privateKey, p.tk))); }
    catch { throw new Error('This activation was made for a different request. Ask your manager to approve your latest request.'); }
  }
  const profile = { name: p.name, role: p.role, iid: p.iid, activation: parse(code).raw, since: Date.now() };
  await store.put('profile', profile);
  await store.del('pending');
  touch();
  return profile;
}

// Host bootstrap: the first Host key is created on the Host's phone, then
// added to ROOT_KEYS in config.js and published.
export async function ownerSetup(name) {
  const pub = await myPublicKey();
  await store.put('owner-setup', { name, pub, at: Date.now() });
  return pub;
}

export const ownerSetupInfo = () => store.get('owner-setup');

// Who is this phone? Returns a profile, or null when it has no access.
export async function currentProfile() {
  const pub = await myPublicKey();
  if (ROOT_KEYS.includes(pub)) {
    const setup = await store.get('owner-setup');
    return { name: setup?.name || 'Host', role: 'owner', since: setup?.at || Date.now() };
  }
  const profile = await store.get('profile');
  if (!profile) return null;
  try {
    await check(profile.activation, 'act');
  } catch {
    return null; // revoked, or the Host key that signed it was replaced
  }
  return profile;
}

// ----- Expiry (RRA-019) -----

export function touch() {
  localStorage.setItem(LAST_USED, String(Date.now()));
}

export function isExpired() {
  const last = Number(localStorage.getItem(LAST_USED) || 0);
  return last > 0 && Date.now() - last > INACTIVITY_DAYS * DAY;
}

export async function wipeAccess() {
  await store.wipe();
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith('blg.') && k !== 'blg.seenVersion') localStorage.removeItem(k);
  }
  localStorage.setItem('blg.expiredNotice', '1');
}

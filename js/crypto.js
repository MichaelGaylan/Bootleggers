// Small wrappers around the browser's Web Crypto API.
// Device keys (ECDSA P-256) and the data key (AES-GCM 256) are created
// non-extractable: the browser can use them but never hands out the secret.

const EC = { name: 'ECDSA', namedCurve: 'P-256' };
const SIG = { name: 'ECDSA', hash: 'SHA-256' };
const te = new TextEncoder();
const td = new TextDecoder();

export function b64uEnc(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64uDec(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const textToB64u = (t) => b64uEnc(te.encode(t));
export const b64uToText = (b) => td.decode(b64uDec(b));

export function newDeviceKey() {
  return crypto.subtle.generateKey(EC, false, ['sign', 'verify']);
}

export async function exportPublic(pub) {
  return b64uEnc(await crypto.subtle.exportKey('raw', pub));
}

export async function sign(privateKey, text) {
  return b64uEnc(await crypto.subtle.sign(SIG, privateKey, te.encode(text)));
}

export async function verify(publicB64, text, sigB64) {
  try {
    const pub = await crypto.subtle.importKey('raw', b64uDec(publicB64), EC, false, ['verify']);
    return await crypto.subtle.verify(SIG, pub, b64uDec(sigB64), te.encode(text));
  } catch {
    return false;
  }
}

const B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1

// Short code people can read aloud to compare two phones, e.g. "K7QM-2HXA".
export async function shortCode(text) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(text)));
  let out = '';
  for (let i = 0; i < 8; i++) out += B32[h[i] % 32];
  return out.slice(0, 4) + '-' + out.slice(4);
}

export function randomId(n = 12) {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return b64uEnc(b);
}

export function newDataKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function seal(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(value)));
  return { iv, ct };
}

export async function unseal(key, rec) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: rec.iv }, key, rec.ct);
  return JSON.parse(td.decode(pt));
}

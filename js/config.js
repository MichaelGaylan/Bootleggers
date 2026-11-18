// Bootleggers Kitchen: app settings.
// Bump VERSION and BUILD on every release, and add one line to WHATS_NEW.

export const APP_NAME = 'Bootleggers Kitchen';
export const VERSION = '0.1.0';
export const BUILD = '2026.11.18-1';

export const WHATS_NEW = [
  {
    version: '0.1.0', build: '2026.11.18-1', date: '2026-11-18',
    lines: [
      'First release: invite-only access, house recipes, starter stock list, notices from management, About and Report a problem.',
    ],
  },
];

// Public keys (base64url, raw P-256) of the Owner device(s). Only invites that
// trace back to one of these keys can open the app. Empty = the app offers
// "Owner setup" so the first Owner key can be created on the Owner's phone.
export const ROOT_KEYS = [];

// Access ends after this many days without opening the app (RRA-019).
export const INACTIVITY_DAYS = 21;

// An invite must be used within this many hours.
export const INVITE_HOURS = 72;

// Report a problem (Web3Forms). The key is public by design: it can only post
// to the inbox it is registered to. Never put the inbox address here.
export const WEB3FORMS_KEY = '003383c6-4896-4f71-bdec-f7ada99ae0ec';
export const REPORT_PREFIX = 'Bootleggers —';

// Global messages to everyone (RRA-015) and revoked invites (RRA-019).
// Both are plain files published with the app.
export const NOTIFICATIONS_URL = 'data/notifications.json';
export const ACCESS_URL = 'data/access.json';

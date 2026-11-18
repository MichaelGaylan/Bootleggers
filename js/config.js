// Bootleggers Kitchen: app settings.
// Bump VERSION and BUILD on every release, and add one line to WHATS_NEW.

export const APP_NAME = 'Bootleggers Kitchen';
export const VERSION = '0.2.1';
export const BUILD = '2026.11.18-3';

export const WHATS_NEW = [
  {
    version: '0.2.1', build: '2026.11.18-3', date: '2026-11-18',
    lines: ['The Host phone is set up, so managers can now send invites.'],
  },
  {
    version: '0.2.0', build: '2026.11.18-2', date: '2026-11-18',
    lines: [
      'Recipe archive for every dish, with photos, plate cost and links to house recipes.',
      'Print any recipe, scaled ×2, ×3 or ×4.',
      "Today's prep list by station, ticked off as you go.",
      'Stock counts with par levels, a needed list and order guides by vendor.',
      'Message board, schedule with swap requests, event sheets (BEOs), costs and waste log.',
      'Settings for staff, roles and permissions, vendors, stock items, stations and menu sections. Owner is now Host.',
      'Shared team data through Firebase, encrypted on each phone with a team key that only invited phones receive.',
    ],
  },
  {
    version: '0.1.0', build: '2026.11.18-1', date: '2026-11-18',
    lines: [
      'First release: invite-only access, house recipes, starter stock list, notices from management, About and Report a problem.',
    ],
  },
];

// Public keys (base64url, raw P-256) of the Host device(s): the app's administrator. Only invites that
// trace back to one of these keys can open the app. Empty = the app offers
// "Host setup" so the first Host key can be created on the Host's phone.
export const ROOT_KEYS = [
  'BG302HsWOPkEyblja_BVenbtca2eMqya_1jZ-rTrnWgiJ-HhzFxKQGuuSdOzkbgNvaPurTSgcx9OpYpS1shuduw', // Host phone, added 2026-11-18
];

// Access ends after this many days without opening the app (RRA-019).
export const INACTIVITY_DAYS = 21;

// An invite must be used within this many hours.
export const INVITE_HOURS = 72;

// Report a problem (Web3Forms). The key is public by design: it can only post
// to the inbox it is registered to. Never put the inbox address here.
export const WEB3FORMS_KEY = '003383c6-4896-4f71-bdec-f7ada99ae0ec';
export const REPORT_PREFIX = 'Bootleggers —';

// Shared team data (RRA-031): the web config from the Firebase console
// (Project settings → Your apps → Web). Public by design; the data itself is
// encrypted with the team key before it is sent. Set to null to keep data on each phone only.
export const FIREBASE = {
  apiKey: 'AIzaSyDXZuUDplTUfzB1WN58Qk5mE2TVf4Q_aPU',
  authDomain: 'bootleggers-kitchen.firebaseapp.com',
  projectId: 'bootleggers-kitchen',
  storageBucket: 'bootleggers-kitchen.firebasestorage.app',
  messagingSenderId: '49283173779',
  appId: '1:49283173779:web:9193c90d1cb752fdfc2c66',
};

// Global messages to everyone (RRA-015) and revoked invites (RRA-019).
// Both are plain files published with the app.
export const NOTIFICATIONS_URL = 'data/notifications.json';
export const ACCESS_URL = 'data/access.json';

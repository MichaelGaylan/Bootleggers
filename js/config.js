// Bootleggers Kitchen: app settings.
// Bump VERSION and BUILD on every release, and add one line to WHATS_NEW.

export const APP_NAME = 'Bootleggers Kitchen';
export const VERSION = '0.5.3';
export const BUILD = '2026.11.21-3';

export const WHATS_NEW = [
  {
    version: '0.5.3', build: '2026.11.21-3', date: '2026-11-21',
    lines: [
      'Dark mode: choose Light, Dark or Match device in Settings, under Appearance. Each phone or iPad keeps its own choice, and everyone can now open Settings to set it.',
    ],
  },
  {
    version: '0.5.2', build: '2026.11.21-2', date: '2026-11-21',
    lines: [
      'Fix: the Admin setup screen on a second device (like an iPad) no longer gets stuck. It now offers Restore from an Admin backup, or Use an invite instead.',
    ],
  },
  {
    version: '0.5.1', build: '2026.11.21-1', date: '2026-11-21',
    lines: [
      'The What\'s new screen now scrolls, so long update notes fit on any phone or iPad, and the Continue button always stays on screen.',
    ],
  },
  {
    version: '0.5.0', build: '2026.11.20-1', date: '2026-11-20',
    lines: [
      'New Employee lounge: the time clock, your week of shifts, today\'s tasks and the bulletin board in one place. One tap from the first screen, and it replaces the Board tab.',
      'Time clock: clock in and out in the lounge. Managers and the Admin get Time sheets with everyone\'s hours by week, can fix a missed punch, and can print or send them for payroll.',
      'The app\'s top position is now called Admin, so it isn\'t confused with the Host stand. Your phone and computer stay Admin with full control.',
      'Pay: managers and the Admin can set an hourly rate for each person. Time sheets show hours, overtime after 40 hours, rate and pay, and print or send for payroll. Hours and rates are locked so staff phones can\'t open anyone else\'s.',
      'The Admin sets what each manager can do with time sheets and pay rates (No, See or Change) in Roles and permissions.',
      'Prep: when every task is checked off, the list clears itself for the next shift (with Undo). Saved items fill it again with one tap each.',
      'Stock has tabs at the top: Food and bar, Cleaning, Paper and to-go, Smallwares, and Linens and uniforms, with starter items in each.',
      'Prep: in Edit, tap an item to change it. Saved items at the bottom put an item back on the list with one tap.',
      'Tablets and computers get their own layout: a sidebar with every section, all sections open, and stock and dishes as wide tables.',
      'Colored chips everywhere: In stock green, Low stock orange, Ingredient blue, Sub recipe purple.',
      'The schedule is grouped by role with colored bands and shift pills. Tablets show the whole week; phones show one day at a time with a day picker. Time off and open shifts are new.',
      'Stock items: removing an item keeps you on the edit page.',
      'Stock count: Save clears the search, and the search bar has an X to clear it.',
    ],
  },
  {
    version: '0.4.2', build: '2026.11.19-4', date: '2026-11-19',
    lines: ['A whoosh plays with the opening screen, on first launch and after each update.'],
  },
  {
    version: '0.4.1', build: '2026.11.19-3', date: '2026-11-19',
    lines: [
      'Printing works from the app: order guides, recipes and the schedule each have Print and "Save or share PDF". The PDF opens the share sheet, where you can print it, save it or send it.',
      'Recipe archive sections stay closed until you tap one. Opening another closes the first, like Stock count.',
    ],
  },
  {
    version: '0.4.0', build: '2026.11.19-2', date: '2026-11-19',
    lines: [
      'Managers can invite Staff or Chef. Only the Admin can invite a Manager.',
      'Stock count: the Save button floats at the top, above the search, and shows how many items changed.',
      'Stock sections stay closed until you tap one. Opening another closes the first.',
      'Print the schedule for 1 to 8 weeks at once (Schedule → Print schedule).',
      "A new phone's request now reaches the inviter by itself, with a note and a badge, so there is no need to wait on the screen.",
      'Ten common food-service vendors are ready in Vendors. Edit or remove any you don\'t use.',
    ],
  },
  {
    version: '0.3.1', build: '2026.11.19-1', date: '2026-11-19',
    lines: ['The full Bootleggers menu is in the Recipe archive, sorted by menu section with prices, and the stock list matches it (sauces by heat, sauce cups by size, tea supplies).'],
  },
  {
    version: '0.3.0', build: '2026.11.18-7', date: '2026-11-18',
    lines: [
      'Admin backup: save a password-protected backup once, and restore Admin on any phone without a new key (More → Admin backup).',
      'Lost access? Tap "Ask to get back in" and a manager or the Admin lets you back in, with no new invite.',
      'A reminder to always open the app from its home screen icon, so your access stays saved.',
    ],
  },
  {
    version: '0.2.4', build: '2026.11.18-6', date: '2026-11-18',
    lines: ['New Admin key for the Admin phone, so it opens as Admin again.'],
  },
  {
    version: '0.2.3', build: '2026.11.18-5', date: '2026-11-18',
    lines: ['The Admin can always set up a new Admin key from the Invite only screen, so the Admin phone cannot be locked out.'],
  },
  {
    version: '0.2.2', build: '2026.11.18-4', date: '2026-11-18',
    lines: ['Fixes the Admin phone staying on the setup screen after an update. Updates now install by themselves.'],
  },
  {
    version: '0.2.1', build: '2026.11.18-3', date: '2026-11-18',
    lines: ['The Admin phone is set up, so managers can now send invites.'],
  },
  {
    version: '0.2.0', build: '2026.11.18-2', date: '2026-11-18',
    lines: [
      'Recipe archive for every dish, with photos, plate cost and links to house recipes.',
      'Print any recipe, scaled ×2, ×3 or ×4.',
      "Today's prep list by station, ticked off as you go.",
      'Stock counts with par levels, a needed list and order guides by vendor.',
      'Message board, schedule with swap requests, event sheets (BEOs), costs and waste log.',
      'Settings for staff, roles and permissions, vendors, stock items, stations and menu sections. Owner is now Admin.',
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

// Public keys (base64url, raw P-256) of the Admin device(s): the app's administrator. Only invites that
// trace back to one of these keys can open the app. Empty = the app offers
// "Admin setup" so the first Admin key can be created on the Admin's phone.
export const ROOT_KEYS = [
  'BK1NN42HvfwbPZ0vGQp_H7geN30lY-lD1ZNdNhKz160oBRAAbSIaBX2cYpCWsxONq61DIEnX9SkcJ3b51zqDPUA', // Admin phone (home screen app), added 2026-11-18; replaces the lost key
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

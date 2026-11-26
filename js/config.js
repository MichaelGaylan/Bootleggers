// App settings: version, keys and timings. Restaurant names live in js/brand.js.
// Bump VERSION and BUILD on every release, and add one line to WHATS_NEW.

// Restaurant names, pictures and data names come from js/brand.js (BPAY-017).
export const BRAND = globalThis.BRAND;
export const APP_NAME = BRAND.appName;
export const VERSION = '0.12.0';
export const BUILD = '2026.11.26-25';

// Text that names the restaurant uses tokens, so it reads right after a
// changeout (RRA-123): {name} = short name, {restaurant} = full name,
// {app} = app name.
export const brandText = (s) => String(s ?? '')
  .replace(/\{name\}/g, BRAND.shortName).replace(/\{restaurant\}/g, BRAND.restaurant).replace(/\{app\}/g, BRAND.appName);

const WHATS_NEW_RAW = [
  {
    version: '0.12.0', build: '2026.11.26-25', date: '2026-11-26',
    lines: [
      'Alert badges: a red number on the tab, the left menu, More and the app icon when something new needs you, with a chime and buzz, and a phone notification when the app is in the background. Each person gets only the alerts for their job: new kitchen tickets (cooks and chefs), new bar tickets (bartenders and barbacks), tables to clear (bussers, servers, hosts), order up, new guests seated in your section, a check or ticket waiting too long, new messages and problem-report replies, swap requests and answers, and 86 or low stock.',
      'Settings for alerts are in More → Alerts: turn each kind, the chime, and phone notifications on or off for this phone. Managers and the Admin can also ask for alerts other jobs get. The Admin sets how long a check can stay open in Settings → Point of sale.',
      'Fixed: "Picked up" on the order-up banner did nothing while a pop-up was open (like Staff member in Team access). The banner now shows on top of the pop-up and the tap works.',
    ],
  },
  {
    version: '0.11.0', build: '2026.11.26-24', date: '2026-11-26',
    lines: [
      'Bar menu: new Draft Beer, Bottles & Cans, Wine, Liquor and Cocktails sections. Add each drink in Recipes with its price and photo, and it shows in Orders. Six starter cocktails (Margarita, Long Island, Rum & Coke and more) already have their pours; add a price to put them on.',
      'Every beer, wine, liquor and mixed drink goes to the bar ticket, never the kitchen. Settings → Menu sections now shows where each section is sent, and you can switch food sections between Bar and Kitchen.',
      '21+ ID check: the first alcoholic drink on a seat asks the server to check ID and shows the birth date to look for. Seats that were checked show 🪪 on the check.',
      'Liquor and cocktails ask Rocks, Neat, Up, Shot or Double. A double pours twice and costs twice the price.',
      'Pours count down Stock: when a drink is sent, its pours (like 1.5 oz Well vodka) come off that bottle in Stock. A voided drink puts them back. Bottles show part counts, like 2.96.',
      'Happy hour: set the days and times in Settings → Point of sale, with dollars off every alcoholic drink or a happy hour price on any dish in Recipes. Orders shows the happy hour price while it is on.',
      'Your menu changes are kept: a price, section or dish you changed or took out stays that way when a menu update comes out. Every menu section shows in Recipes with "+ Add to", even before it has a dish.',
    ],
  },
  {
    version: '0.10.0', build: '2026.11.26-23', date: '2026-11-26',
    lines: [
      'Invites ask for the person\'s job (Server, Bartender, Host, Line cook…), so they get the right screens from the start. Approving an older invite or letting someone back in asks too.',
      'Anyone who joined without a job title shows "Pick a job" on the Staff list, so nobody is left on the Line cook screens by mistake.',
      '"Ask to get back in" now goes to every manager and the Admin in the app, not only the person who first invited them. Any one of them can let the person back in, and the app opens on that phone by itself once approved.',
    ],
  },
  {
    version: '0.9.0', build: '2026.11.26-22', date: '2026-11-26',
    lines: [
      'The app now fits each job. A busser sees Tables and the Employee lounge; servers see Seating, their orders and tables; bartenders see Seating, orders and the bar tickets; hosts seat guests for a server; cooks see the kitchen tickets, prep, recipes and stock. The bottom tabs change to match, and other parts of the app stay closed.',
      'Tables to clear: when a check is paid, its table turns orange ("Clear") on the seating layout. A busser, server, host or manager taps it, or the Cleared button on Tables, once it\'s reset, and it shows as free again.',
      'Hosts seat guests and pick the server; the table then shows on that server\'s layout. People who don\'t take orders don\'t see check amounts.',
      'The Admin chooses what each job sees in Settings → People → Job titles (tap a job, then switch screens on or off). Chefs, managers and the Admin see what their role allows, as before.',
    ],
  },
  {
    version: '0.8.6', build: '2026.11.26-21', date: '2026-11-26',
    lines: [
      'You can add your own job titles. When adding or editing staff, pick "+ Add a job title…" in Position, or manage the list in Settings → People → Job titles. Busser is now on the list next to Bartender.',
      'Tip pool points for "Host" now also count for "Host stand".',
    ],
  },
  {
    version: '0.8.5', build: '2026.11.26-20', date: '2026-11-26',
    lines: [
      'Clear test data (Admin, in Settings) has a "Pick sales and time logs" button, and can now restart check numbers at 1, empty the 86 list, clear daily prep check-offs and clear past schedules only. Used one-time coupons are paused when checks go. Stock is never touched.',
    ],
  },
  {
    version: '0.8.4', build: '2026.11.24-19', date: '2026-11-24',
    lines: [
      'Seating areas can be sized to fit the room: in Seating layout, tap Size and pick how many squares wide and deep the area is (a small nook can be 2 by 1). Tap an empty square to add a table, tap one to remove it.',
    ],
  },
  {
    version: '0.8.3', build: '2026.11.24-18', date: '2026-11-24',
    lines: [
      'Coupons (More → Coupons, managers and the Admin): make a coupon for percent off, dollars off, a free dish, or buy one get one, with dates, days, hours, a minimum, food only, a use limit and one-time codes. Send it as a framed {name} coupon picture with a QR code or barcode and the offer printed under it.',
      'At the table, tap Add a coupon on the check and scan the coupon with the camera (works on iPhone) or type the code. The app checks the rules, takes the discount off before tax, and shows coupons in Today\'s sales. Net sales in Payroll count the discount.',
      'Military / veteran discount (also first responder and senior): set it up once under More → Coupons. On a check, tap Discounts, pick it, and confirm you saw the guest\'s ID. It works every visit with no coupon, and Today\'s sales shows these discounts on their own line. Its QR card can also be printed for regulars.',
    ],
  },
  {
    version: '0.8.2', build: '2026.11.24-17', date: '2026-11-24',
    lines: [
      'Behind the scenes: everything that belongs to this restaurant (names, pictures, menu, starter stock, vendors, shared data settings) now lives in one place, so the app can be set up for another restaurant with nothing of {name} left in it. Nothing changes on your screen.',
    ],
  },
  {
    version: '0.8.1', build: '2026.11.24-16', date: '2026-11-24',
    lines: [
      'Music: a Test sound button checks the speaker and volume, the player says when a station is connecting or why something isn\'t playing, and the built-in stations try backup servers on their own.',
      'Order-up alert: bumping a ticket on the kitchen or bar screen tells the server who took the order "Pick up" with a chime and a count on Orders (POS). If nobody taps Picked up in time, every server on the clock gets it in red. The Admin sets the time in POS settings (2 minutes to start).',
      'Radio dial: tune like a real radio with an AM/FM switch, a tuning knob, seek buttons and preset buttons. The Admin and managers program presets by frequency (for example 104.3 FM), linked to that station\'s online stream, and every phone gets them.',
    ],
  },
  {
    version: '0.8.0', build: '2026.11.24-13', date: '2026-11-24',
    lines: [
      'Orders (POS) opens a popup: Seating, the kitchen screen, sales and your current orders. Seating shows each area (Dining room, Bar, Outside) laid out with its tables, booths, high tops, bar seats and patio tables: tap a free table, tap the number of guests, and the menu opens. Tap a seated table to bring its order back up. Managers and the Admin add areas and arrange the tables under Change the seating layout. On a check, your open tables show as tabs across the top. No typing needed.',
      'Point of sale picture menu: dishes are photo tiles with their name and price using the real {name} food, sauce and drink photos (also shown in Recipes), the menu sections are tabs across the top, and the open check sits on the left with − and + for each item. A photo added to a dish in Recipes takes the place of the standard one. Send turns orange (✓ Sent) once the order is in, and Pay opens a popup over the check for splitting and taking card or cash.',
      'On an iPad or computer, work screens use the whole screen: Point of sale, a check and its Pay screen, the Kitchen and bar screen, Schedule, Time sheets, a Payroll run, Stock count and an open recipe. The back arrow at the top left brings the left menu back.',
      'Stock count: the All tab is gone. It opens on the first group with its first section open, and opening another section closes the one before.',
      "Today's prep: when the last task in a tab is done, that tab goes away (with Undo), so only tabs with work left show.",
      'Music (More → Music): play MP3s from a USB drive or this computer with play, pause, skip, shuffle and volume, or internet radio. Find a station adds local AM/FM stations that stream online. Music keeps playing while you use the app.',
      'Gift cards (More → Gift cards): open the {name} gift card shop for a guest, or send them the link.',
      'Admin: Settings → App → Clear test data erases practice clock-ins, payroll, checks, messages, swaps, events, waste and schedules for the whole team, with a backup file first. Dishes, recipes, stock, staff, pay rates and settings are never touched.',
    ],
  },
  {
    version: '0.7.1', build: '2026.11.22-6', date: '2026-11-22',
    lines: [
      'Event reminders: the Admin, managers and chefs get a pop-up for an event coming up, once a day until it happens, plus a badge on Events and a card at the top of the Employee lounge.',
      'Pick how many days ahead (Off, 1, 2, 3, 5, 7 or 14) for each event under Edit, or the usual for every event in Settings → App → Event reminders (3 days to start).',
    ],
  },
  {
    version: '0.7.0', build: '2026.11.22-5', date: '2026-11-22',
    lines: [
      'Point of sale (More → Orders): open a check for a table or bar tab, add dishes from your menu by seat with sauce, temperature and notes, and send them to the kitchen and bar.',
      'Kitchen and bar screen: tickets with timers that turn orange at 8 minutes and red at 15; tap items when they are up and Bump the ticket. Chefs and cooks keep the 86 list, which switches items off on every phone.',
      'Paying: one check, split evenly or by seat; card with tip, cash with change. Cards will go through your own Square Terminal, Clover Flex/Mini or Toast handheld; nothing is connected yet, so card payments are practice runs.',
      "Managers see Today's sales. Tips go into each night's tip pool and net sales into labor % in Payroll on their own.",
      'The Admin picks the card service, reader name and sales tax in Settings → App → Point of sale. Roles and permissions has a new Point of sale switch.',
    ],
  },
  {
    version: '0.6.0', build: '2026.11.22-4', date: '2026-11-22',
    lines: [
      'Payroll is now part of the app (More → Payroll). It reads the clock-ins, time sheets, pay rates and pay rules you already have: Review hours, fix anything marked Fix right there, Review pay, then Submit.',
      'Everyone gets My pay & tips (in the Lounge): your hours this period, your pay so far, your tip shares, paystubs and, where offered, Get paid early. You now see your own hourly rate there.',
      'The Admin sets the pay period, tip rules, which chef may approve kitchen hours, the payroll service and the POS in Settings → Pay → Payroll settings, and uploads the POS tip and sales report there.',
      'Roles and permissions has two new pay switches for managers: Submit payroll and Approve early pay. Managers can review payroll by default; the Admin submits unless they allow it.',
      'No payroll service is connected yet, so runs are practice runs: nothing is paid or filed. Amounts are estimates until one is connected.',
    ],
  },
  {
    version: '0.5.10', build: '2026.11.22-3', date: '2026-11-22',
    lines: [
      'Shorter pages: lists open one section at a time. Tap a section to open it; opening another closes the one before. This now works on iPads and computers too, in Dishes, House recipes and Stock.',
      'The Prep list (by station, with how many are done), Order guides (by vendor), Time sheets, Settings and Clean up duplicates open one section at a time as well. Printouts still show everything.',
    ],
  },
  {
    version: '0.5.9', build: '2026.11.22-2', date: '2026-11-22',
    lines: [
      'Behind the scenes: the restaurant name, logo, icons and colors now come from one settings file, ready for other restaurants. Nothing changes for you.',
    ],
  },
  {
    version: '0.5.8', build: '2026.11.22-1', date: '2026-11-22',
    lines: [
      'Report a problem now also goes to the Admin and managers in the app. They can reply, and you get a pop-up with the answer. Settings → Problem reports lists them, with Mark fixed and Close.',
      'Notices on the message board have a Remove button, and the welcome notice is now "Welcome to {name} Message Board".',
      'Removing someone from Staff ends their app access: their phone locks and goes back to the enter-invite screen.',
      'Settings → Shift times: set your own quick shift buttons (optionally per position) and what time "cl" (close) means. One list for the whole team.',
      'Someone removed and added back: Staff and Time sheets offer to move their old hours, pay rate and shifts onto the current record.',
    ],
  },
  {
    version: '0.5.7', build: '2026.11.21-7', date: '2026-11-21',
    lines: [
      'Swap requests: you get a pop-up when yours is approved or declined, and you can Remove your own request until it is approved.',
      'A swap badge (⇄) on the Employee lounge button shows requests waiting for managers, and updates on your own requests.',
      'When someone answers a question about their swap, the request gets a 🚩 Reply received flag with the answer, for every manager who can approve it.',
      'Tapping a swap request takes you straight to it on the schedule.',
      'More → Staff: Change role opens properly, and people whose phone isn\'t linked yet are marked Not linked.',
      'New Settings → Pay rules: set overtime hours and rates, daily overtime and double time, with state presets.',
      'Recipe archive: add a sauce, a drink or any menu item without ingredients. Each section has its own + Add button.',
      'Duplicates: Settings → Clean up duplicates merges repeated stock, recipes, vendors and saved prep in one tap, keeping counts, pars and prices. A second Admin device no longer adds the starter lists twice.',
    ],
  },
  {
    version: '0.5.6', build: '2026.11.21-6', date: '2026-11-21',
    lines: [
      'Messages: pick who a post goes to: Everyone, Kitchen team, Chefs, Managers or one person. Group and one-person posts are private (🔒): only those people and you can open them. Anyone can still post to Everyone.',
      'Your job position now shows next to Employee lounge, in your role color.',
      'The "All prep done" pop-up goes away after 4 seconds.',
      'Shift swaps are checked for conflicts (already working that day, time off, or over 40 hours). Managers get a pop-up to Approve, Deny or Ask a question, and the person who asked can answer right away.',
    ],
  },
  {
    version: '0.5.5', build: '2026.11.21-5', date: '2026-11-21',
    lines: [
      'Print works on iPhone and iPad: it opens the share sheet with the PDF, where you tap Print. No more "blocked from automatically printing".',
      'Invites and activations show the code by itself with a Copy code only button, so it pastes cleanly.',
      'Bigger back button at the top, and bigger open arrows (›) everywhere.',
      'Today\'s tasks in the lounge: the bar is red for what\'s left and fills in green as tasks are done. Opening Today\'s prep from the lounge now has a back button.',
    ],
  },
  {
    version: '0.5.4', build: '2026.11.21-4', date: '2026-11-21',
    lines: [
      'Change role: in Roles and permissions, tap a person, then Change role to move them between Staff, Chef and Manager. Their phone switches to the new role and its permissions on its own, with no new invite.',
      'A new manager gets hours and pay access from the same tap. Moving a manager down takes it away, and the app makes a new pay key for the remaining managers.',
      'Night mode button: the moon at the top switches between light and dark in one tap.',
    ],
  },
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
    lines: ['The full {name} menu is in the Recipe archive, sorted by menu section with prices, and the stock list matches it (sauces by heat, sauce cups by size, tea supplies).'],
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
export const WHATS_NEW = WHATS_NEW_RAW.map((w) => ({ ...w, lines: w.lines.map(brandText) }));

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
export const WEB3FORMS_KEY = BRAND.reportKey || '';
export const REPORT_PREFIX = BRAND.reportPrefix;

// Shared team data (RRA-031): the restaurant's Firebase web config lives in
// js/brand.js (firebase). Public by design; the data itself is encrypted with
// the team key before it is sent. null keeps data on each phone only.
export const FIREBASE = BRAND.firebase || null;

// Global messages to everyone (RRA-015) and revoked invites (RRA-019).
// Both are plain files published with the app.
export const NOTIFICATIONS_URL = 'data/notifications.json';
export const ACCESS_URL = 'data/access.json';

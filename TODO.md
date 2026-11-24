# Restaurant Recipe App (RRA) — Build list

Rule: every build item goes on the Build list and waits until Gaylan says "Build list". Nothing is built before then.
Platform: a web app that works on iPhone and Android, like the VYBEON apps. Only a Manager or the Admin can hand it out, through an invite. An invite can't be passed on by anyone else: it works once, on one device.

Previews of RRA-001 to RRA-011 and Settings: /mnt/project-files/previews/rra-001-011/rra-previews.html. Gaylan approved them with changes on 2026-11-18 and ordered the build. Built in 0.2.0. Firebase config is in the app; shared data works once the rules are published (RRA-032).

## 🔴 Needs you
- [ ] RRA-113 · Gift cards in our POS: ask the Shift4 rep whether Shift4 offers developer/API access for selling and redeeming gift cards from another app, and what it costs · Infra · S · added 2026-11-24
- [ ] RRA-100 · Payroll: pick a payroll service and POS; attorney check on tip pool, tip credit and early pay rules (federal + SC) · S
- [ ] RRA-028 · Chef review of the starter stock list (items, units, bar list) · Content · S

## 🔵 Build list

## 🟡 Hold
- [ ] RRA-104 · POS: live card payments through the restaurant's service (Square Terminal API, Clover REST Pay Display, or Toast order handoff) via the restaurant's server; bar menu with drink prices · Infra · L
- [ ] RRA-098 · Payroll: Crew Hub (profiles, onboarding checklists, permit expiry alerts) — was BPAY-011 · Feature · L
- [ ] RRA-099 · Payroll: connect a real payroll service and POS through the restaurant's server (keys, pulls, money movement) — needs the server first · Infra · L

## 🟣 Done
### 0.8.0 · build 2026.11.24-11
- [x] RRA-112 · Dish pictures for the POS tiles and Recipes · Content · S. Gaylan sent photos of every dish, sauce and drink (2026-11-24); resized to 480px in assets/menu/, mapped in js/brand.js menuPhotos. Chicken Sandwich with Fries still uses a colored tile until its photo arrives
- [x] RRA-114 · POS seating: tapping POS shows the restaurant's own seating layout (tables, booths, bar seats). Tap a free table, tap the number of guests (clickable numbers, no typing), then the menu opens; tapping a seated table brings its order back up. Managers and the Admin lay out the tables under Seating (add, number, seats, move, remove), shared by every phone (Gaylan, 2026-11-24, screenshot of Table 1) · Feature · M · added 2026-11-24. OK'd by Gaylan on the 0.8.0 sample
- [x] RRA-115 · Stock count: remove the All tab; keep one tab per group, open on the first group, and opening another section collapses the previous one (Gaylan, 2026-11-24) · UX · S · added 2026-11-24. OK'd by Gaylan on the 0.8.0 sample
- [x] RRA-116 · POS menu: section tabs across the top (Appetizers, Baskets, Beverages…), no All tab (Gaylan, 2026-11-24) · UX · S · added 2026-11-24. OK'd by Gaylan on the 0.8.0 sample
- [x] RRA-117 · Orders: tapping Orders opens a popup with Seating and the current orders (tap one to bring it up), plus the kitchen screen and sales (Gaylan, 2026-11-24) · UX · S · added 2026-11-24. OK'd by Gaylan on the 0.8.0 sample
- [x] RRA-118 · POS check screen: the open tables show as tabs across the top (Table 2, Table 4, Table 7…), the current one highlighted; tap one to jump to its order, + Seat goes back to Seating (Gaylan, 2026-11-24, mockup) · UX · S · added 2026-11-24. OK'd by Gaylan on the 0.8.0 sample
- [x] RRA-119 · Seating areas: the Admin's seating layout screen has separate areas (Dining room, Bar, Outside to start), each laid out on its own, with area tabs on Seating; add, rename or remove areas; places can be tables, booths, high tops, bar seats or patio tables (Gaylan, 2026-11-24) · Feature · S · added 2026-11-24. OK'd by Gaylan on the 0.8.0 sample
- [x] RRA-106 · Settings: Clear test data (Admin only). One screen with checkboxes for what to erase for the whole team: clock-ins and time sheets, payroll (pay runs, paystubs, early pay, tip shares, tip pool and sales uploads), Point of sale (checks, kitchen and bar tickets, today's sales), messages and problem reports, swap requests, events, waste log, schedules. Never touches dishes, house recipes, stock, vendors, prep lists, staff, pay rates, roles or settings. Shows how many of each will go, asks the Admin to type CLEAR to confirm, and offers a backup file first. Removes them on every phone (Gaylan, 2026-11-22) · Feature · M
- [x] RRA-107 · iPad and computer: full-screen work screens. Opening Point of sale hides the left menu so the screen uses the full width; the back arrow stays at top left and going back brings the left menu back. Same for the other screens that need the room: a POS check and its Pay screen, the Kitchen and bar screen, Schedule (whole week), Time sheets, a Payroll run (Review hours and pay), Stock count, and an open recipe (for cooking from it). Phones are unchanged (they have no left menu) (Gaylan, 2026-11-23) · UX · S
- [x] RRA-108 · Point of sale: picture menu. Dish buttons become photo tiles (the dish's Recipes photo, with name and price under it; a colored tile with the name when a dish has no photo), the menu sections become tabs along the bottom of the grid, and the open check stays on the left as item, qty (with − and + buttons) and amount, with the total and Send/Pay at the bottom. 86'd dishes stay greyed out. Works with full-screen mode (RRA-107); on phones the tiles are smaller, two or three across (Gaylan, 2026-11-23, reference picture). Use the real Bootleggers menu and dish pictures from https://bootleggersaugusta.com/ ; all menu names, image paths and data keys go in js/brand.js, never in code · UX · M. Built with the menu moved into js/brand.js; tiles use Recipes photos or brand.js menuPhotos. The website blocks automated downloads (Cloudflare), so dish pictures wait on RRA-112
- [x] RRA-109 · Music player: plays MP3 files from a USB drive or the computer (pick a folder, play, pause, skip, shuffle, volume), for background music in the restaurant. Built into the app as a "container" music area: MP3s plus AM/FM internet radio streams and any other music services that can be added without licensing hassles (Gaylan, 2026-11-23) · Feature · M. SomaFM stations built in (brand.js radio) plus Find a station (Radio Browser, https streams only); licensing note in the app
- [x] RRA-110 · Prep: Today's prep tabs clear themselves. Prep items stay grouped under their tabs, and once the last task in a tab is done that tab disappears, so only tabs with work left show (Gaylan, 2026-11-23) · UX · S
- [x] RRA-111 · Gift cards: add the Bootleggers gift card shop (https://313b30113192392.s4shops.com/giftcard.html) to the app, e.g. a Gift cards link/screen staff can open for customers; URL and labels go in js/brand.js (Gaylan, 2026-11-23). Bootleggers runs Shift4 POS (the gift shop is Shift4 Shop); selling/redeeming cards in our POS would need Shift4 developer/API access, so start as a link and check what Shift4 allows · Feature · S. Built as a Gift cards screen (open shop, send/copy link); selling/redeeming in our POS waits on RRA-113
### 0.7.1 · build 2026.11.22-6
- [x] RRA-105 · Events (BEOs): reminders for upcoming events. Each event gets a "Remind" choice for how many days ahead (e.g. Off, 1, 2, 3, 5, 7, 14 days; default set in Settings, changeable per event). From that day until the event, the app shows a pop-up when it opens (to the Admin, managers and chefs, or the people picked on the event), a badge on Events, and the event at the top of the Employee lounge. Each person can dismiss it for the day (Gaylan, 2026-11-22) · Feature · M
### 0.7.0 · build 2026.11.22-5
- [x] RRA-101 · Point of sale merged into the app (from the Bootleggers POS test app, BPAY-025): checks for tables and bar tabs from the Recipe archive menu (sauce, temperature, dressing, notes, seats), send to kitchen and bar tickets, kitchen and bar screen (timers, mark up, bump), 86 list shared by all phones, split one/evenly/by seat, card with tip and cash with change through the chosen card service (practice until connected), today's sales for managers · Feature · L · added 2026-11-22
- [x] RRA-102 · POS feeds Payroll: closed checks give each night's tip pool and net sales (labor %), unless that night has an uploaded POS report · Feature · S
- [x] RRA-103 · Roles: new Point of sale permission (staff Change by default). Servers and bartenders take orders and see their own checks; managers and the Admin see all checks, void and see sales; chefs and kitchen staff get the kitchen screen and 86 list; card settings are Admin only (Settings → App → Point of sale) · Feature · S

### 0.6.0 · build 2026.11.22-4
- [x] RRA-095 · Payroll merged into the app (from the stand-alone Bootleggers Payroll test app, BPAY-001…024). Reads Staff, Lounge punches, Time sheets pay rates and Settings → Pay rules directly. Flow: Review hours (fix clock-outs, rate, hourly/salary, department in one sheet) → Review pay → Submit (or Send to Admin) → History. Last/This period switcher; pay period, payday, tip rules, chef approval of kitchen hours, payroll service and POS (keys keep last 4 only) and POS tip/sales CSV upload in Settings → Pay → Payroll settings (Admin) · Feature · L · added 2026-11-22
- [x] RRA-096 · My pay & tips for everyone (Lounge, More): hours and pay so far this period, own tip shares, paystubs, Get paid early (when the payroll service offers it) with manager approval. A person's own rate, paystubs, early pay and tip shares are sealed to their phone; everyone else's stay on the pay key · Feature · M
- [x] RRA-097 · Roles and permissions: new manager pay switches Submit payroll (default See) and Approve early pay (default Change), set by the Admin only. A chef the Admin allows fixes and approves kitchen hours (kitchen punches are also sealed to that chef's phone), never sees rates or dollars. Demoted managers lose payroll data on their phone · Feature · M

### 0.5.10 · build 2026.11.22-3
- [x] RRA-094 · Collapsible sections everywhere, one open at a time: every section starts collapsed, tapping one opens it and closes the one that was open (a search still opens every match). Dishes, House recipes and Stock already do this on phones, but on an iPad or computer (the wide table view) every section shows open at once, so: (1) Dishes and House recipes wide table: section bands collapse and expand; (2) Stock count and Edit list wide table: same, keeping the low-stock count on each band. Other screens checked that would also get it: (3) Prep list, by station; (4) Order list, by vendor; (5) Time sheets wide table (the per-person punches below it already collapse); (6) Settings, by group (Pay, People, Kitchen, App), remembering which one was open; (7) Clean up duplicates, by area. Left as they are: Schedule (the whole week needs to be seen at once), Message board, Events (short lists) (Gaylan, 2026-11-22) · UX · M. Prep list opens the station a new item goes into; printouts unchanged
### 0.5.9 · build 2026.11.22-2
- [x] RRA-093 · Brand settings file (BPAY-017): every built-in name, logo, icon, intro video, accent color, © credit line and data name (`blg.` prefix, on-phone database, Firebase team folder) moved into `js/brand.js`, for the multi-restaurant setup wizard. Bootleggers keeps its current values, so saved data is untouched · Infra · M · added 2026-11-22
### 0.5.8 · build 2026.11.22-1
- [x] RRA-088 · Report a problem: besides the email, each report also lands in the app for the Admin and managers the Admin allows (a Problem reports list with a badge). They can reply right there; the reply reaches the person who reported it as a private message (RRA-075) with a pop-up, and they can answer back. Mark a report Fixed or Closed (Gaylan picked in-app over email replies, 2026-11-21) · Feature · M
- [x] RRA-089 · Message board: rewrite the management welcome notice (2026-11-18, in data/notifications.json) to title "Welcome to Bootleggers Message Board" and text "This is where your messages and notices from management will show up." Each person can remove a notice from their own board (and lounge), on their phone only (Gaylan, 2026-11-21) · UX · S
- [x] RRA-090 · Security: removing someone from Staff also ends their app access. Removing a linked person withdraws their invite/phone automatically (with a clear warning in the Remove dialog). Their phone, on its next open or sync, locks: shared data is cleared from it, no changes or clock-ins are accepted, and it shows the Request access / enter invite code screen. Changes that phone still tries to send are refused by the other phones (Gaylan, 2026-11-21) · Bug · M. Note: a phone that was tampered with could still read data it already has until the team key changes; a normal phone locks itself.
- [x] RRA-091 · Schedule: custom shift times. Managers (anyone who can change the schedule) add, edit, reorder and remove the quick shift buttons (today fixed at 8-2, 10-6, 11-7, 4-cl, Time off) in Settings → Shift times, optionally per role (e.g. Bartender 6-cl). One shared list for the whole team (saved in the team settings, same on every phone), not per phone. The shift picker and open shifts use them; typing any time still works. Hours (swap checks, 40-hour check) read the custom times, including "cl" as the close time set there (Gaylan, 2026-11-22) · Feature · S
- [x] RRA-092 · Staff: reconnect a removed employee's history. When someone is added with the same name as a removed person who still has hours, offer "Same person? Move their hours, pay rate and shifts to the new record". Also a Merge button on a "(removed)" person in Time sheets to move their punches onto a current staff member (Gaylan's two Wendys, 2026-11-22) · Feature · S
### 0.5.7 · build 2026.11.21-7
- [x] RRA-079 · Swap declined: the person who asked gets a pop-up when a manager declines their swap request (and when one approves it), the next time they open the app (Gaylan, 2026-11-21) · Feature · S
- [x] RRA-080 · Home screen: show waiting swap requests as a badge on the right of the Employee lounge button, next to the arrow (shown to managers, the Admin and anyone else allowed to approve swaps, with the number waiting for a decision; and to the person who made the request, for their own requests that are waiting or answered) (Gaylan, 2026-11-21) · UX · S
- [x] RRA-081 · Fix (RRA-078): the requester's answer to a swap question only shows under the private message on the board, so approvers don't know a reply came in. Put a flag (🚩 "Reply received") with the answer on the swap request itself (Schedule swap list and the conflict pop-up), shown to every approval holder (managers, the Admin, anyone allowed to approve swaps), not only the one who asked. Also pop it up for approvers when they open the app, and count new replies as unread on the board (Gaylan, 2026-11-21) · Bug · S
- [x] RRA-082 · Tapping a swap request (the "Swap requests" row in the lounge, the RRA-080 badge, or a swap pop-up) opens the Schedule page and scrolls straight down to that request, briefly highlighted, instead of just landing at the top of the page (Gaylan, 2026-11-21) · UX · S
- [x] RRA-083 · Swap requests: the person who asked gets a Remove button on their own request, to withdraw it (for example after a conflict, or for personal reasons). Only while it hasn't been approved; once approved it can't be removed. Approvers see it as withdrawn and any pop-up for it stops (Gaylan, 2026-11-21) · Feature · S
- [x] RRA-084 · Fix (RRA-066): Change role from More → Staff. (1) For a linked phone (e.g. wendy) the "Change role ›" link inside the Staff member sheet does nothing you can see: the page behind changes but the sheet stays open on top. Make it close the sheet and open the Change role screen (or open Change role right there). (2) For a person whose phone isn't linked yet (e.g. Scott: added by hand, or hasn't opened the app since 0.5.2) the "App role" drop-down only changes the label on the staff list, not what their phone can do. Show the role read-only with a note ("Change role unlocks after they open the app on their phone") and a "Not linked" chip on the staff list (Gaylan, 2026-11-21) · Bug · S
- [x] RRA-085 · Pay rules setting (Settings → Pay rules): the Admin, and managers the Admin allows (pay permission), can change how time sheets count pay. Weekly overtime after N hours (today fixed at 40) at a chosen rate (today fixed at 1.5×); optional daily overtime after N hours a day (e.g. California 8 h) and double time after N hours a day; the day the pay week starts; a state preset that fills these in (Federal/Georgia default: 40 h weekly, 1.5×). Time sheets, pay totals and the printed/shared time sheet use these rules. Not payroll or taxes (still an idea on hold) (Gaylan, 2026-11-21) · Feature · M
- [x] RRA-086 · Menu items like sauces (Extra Sauce) and drinks (N/A Beverages) can be added without ingredients or instructions: a dish only needs a name (section and price optional), and each menu section in the Recipe archive has a "+ Add to <section>" button. House recipes still need ingredients and steps (Gaylan, 2026-11-21) · UX · S
- [x] RRA-087 · Duplicates: merge duplicate entries in stock (food, supplies, bakery, bar), recipes and menu items, vendors and saved prep in one tap (Settings → Clean up duplicates; the Admin is offered it when duplicates are found). The entry with the most filled in is kept, counts/pars/vendors/prices from copies are kept, vendor and house-recipe links move over. Cause fixed: a second Admin device no longer adds the starter lists again before the shared data arrives (Gaylan, 2026-11-21) · Bug · M

### 0.5.6 · build 2026.11.21-6
- [x] RRA-075 · Messages by hierarchy: pick who a message goes to (Everyone, Kitchen staff, Chefs, Managers, or one person). Each person sees only Everyone posts, posts they sent, and posts sent to their group or to them, so staff never see chef-to-manager or manager-to-chef messages. Today the Kitchen channel is open to all and Managers is open to chefs too, and every phone receives every post (only hidden on screen). Seal non-Everyone posts to the recipients' phones (like the pay key) so other phones can't open them. Replies go to the same people. Anyone, any role, can post to Everyone and everyone sees it; group and one-person messages stay private (confirmed by Gaylan) (Gaylan, 2026-11-21) · Feature · M
- [x] RRA-076 · Employee lounge: show the person's job position (e.g. Line cook, Chef, Manager; Admin for the Admin) on the right side of the "Employee lounge" title, as a colored chip in their role color (Gaylan, 2026-11-21) · UX · S
- [x] RRA-077 · Prep: the "All prep done" pop-up (with Undo) shows for 4 seconds, then goes away (Gaylan changed 3 to 4) (today it stays up much longer because it carries the Undo button) (Gaylan, 2026-11-21) · UX · S
- [x] RRA-078 · Schedule swaps: check each swap request for a conflict (the person covering already works that day, has time off, or would go over 40 hours that week). A conflicting request pops up for managers when they open the app, with Approve, Deny, or Ask a question: a private follow-up to the person who asked (uses the private messages from RRA-075). The requester gets a pop-up with the answer or question and can reply (Gaylan, 2026-11-21) · Feature · M

### 0.5.5 · build 2026.11.21-5
- [x] RRA-068 · Invites, requests and activations: show the code on its own in a box with a "Copy code only" button, separate from the message text and link, so it pastes cleanly. Keep "Send" for the full message (Gaylan, 2026-11-21) · UX · S
- [x] RRA-069 · Bigger back (return) buttons everywhere: a larger tap target at the top left (Gaylan, 2026-11-21) · UX · S
- [x] RRA-070 · Today's prep opened from the Employee lounge: show a back button at the top that returns to the lounge (Gaylan, 2026-11-21) · UX · S
- [x] RRA-071 · Bug: Print on Time sheets does nothing. Find why (home screen app print block?) and fix, keeping Save or share PDF as the fallback (Gaylan, 2026-11-21) · Bug · S
- [x] RRA-072 · Bug: the Print buttons on the schedule (week and Print schedule) do nothing. Same cause as RRA-071 likely; fix both together (Gaylan, 2026-11-21). Clue (Gaylan's screenshot): the iPhone home screen app shows "This website has been blocked from automatically printing" (Ignore / Allow), though pdf.js calls window.print() straight from the tap. Plan: on iPhone/iPad home screen app, Print opens the PDF share sheet (which has Print) instead of window.print() · Bug · S
- [x] RRA-073 · Today's tasks bar (Employee lounge): the part still to do shows red, the done part green, filling in as items are checked off. Keep the auto-clear when everything is done (Gaylan, 2026-11-21) · UX · S
- [x] RRA-074 · Bigger open (›) buttons everywhere: larger chevrons and tap areas on rows and cards (home page lounge card, Full schedule ›, Open ›, list rows). Build with RRA-069. Back and open buttons don't need to match; sizes at Claude's discretion (Gaylan, 2026-11-21, screenshot) · UX · S

### 0.5.4 · build 2026.11.21-4
- [x] RRA-066 · Change role (promotions): the Admin (or a manager, for Staff and Chef, if the Admin allows) taps Change role on a person; a signed role change syncs to that person's phone, which switches role and permissions with no new invite. A new Manager gets the pay key in the same tap; moving a Manager down drops it and the Admin phone makes a new pay key for the remaining managers and Admin devices · Feature · L
- [x] RRA-067 · Night mode button: a moon button in the top bar switches between light and dark in one tap (Settings → Appearance keeps Match device) · UX · S

### 0.5.3 · build 2026.11.21-3
- [x] RRA-065 · Dark mode: Light / Dark / Match device under Settings → Appearance, saved per device; everyone can open Settings for it (the rest of Settings stays limited). Status colors and chips have dark versions · Feature · S

### 0.5.2 · build 2026.11.21-2
- [x] RRA-064 · Bug: Admin setup on a second device (Gaylan's iPad) was a dead end with only Copy and Start over. Now it offers Restore from an Admin backup and Use an invite instead, and warns before making a second Admin key · Bug · S

### 0.5.1 · build 2026.11.21-1
- [x] RRA-063 · What's new screen scrolls so long update notes can be read fully on phone and iPad; the Continue button always stays on screen. Shows every release since the phone's last update · UX · S

### 0.5.0 · build 2026.11.20-1
- [x] RRA-059 · Pay: hourly rate per employee; Time sheets show hours, overtime (over 40 h at 1.5x), rate and pay, printable and as PDF for payroll. Everyone's hours and rates are sealed in shared data with a managers-only pay key made on the Admin phone; staff phones keep only their own hours · Feature · L
- [x] RRA-060 · Admin sets each manager's access to time sheets and pay rates (No / See / Change) in Roles and permissions; only the Admin can change them · Feature · M
- [x] RRA-061 · Rename the app's top position from Host to Admin everywhere (Host stays a front-of-house role); existing Admin phones keep full control · UX · S
- [x] RRA-062 · Prep: when every task is checked off, Today's prep clears itself for the next shift (with Undo); Saved items refill it · UX · S
- [x] RRA-058 · Stock: tabs at the top for food and non-food supplies (All, Food and bar, Cleaning and chemicals, Paper and to-go, Smallwares, Linens and uniforms), with starter items in each new section. Compared with the reference list (Gaylan's image, 2026-11-20); Equipment inventory is not included · Feature · M
- [x] RRA-053 · Employee lounge: one section for staff that holds the bulletin board (Board messages), the schedule and tasks. Messaging and the schedule live in the lounge · Feature · L
- [x] RRA-054 · One-tap Employee lounge button on the landing page, for every employee · UX · S
- [x] RRA-055 · Time clock and time sheets: employees clock in and out in the app (one tap from the lounge) and see their own hours. Managers and the Host get a Time sheets page compiling everyone's hours (daily punches, weekly totals per employee, fix a missed punch), printable and as a PDF or copy to send for payroll · Feature · L
- [x] RRA-056 · Prep: tap an item already on the list to change it (name, amount, station) · UX · S
- [x] RRA-057 · Prep: a closable "Saved items" list at the bottom of the page with items used before; one tap puts one back on the list without retyping (confirmed by Gaylan 2026-11-20) · UX · M
- [x] RRA-049 · Stock items (Edit list): after removing an item, stay on the edit page for more removals instead of going back to Stock count · Bug · S
- [x] RRA-050 · Stock count: after searching and changing a count, Save clears the search and shows the full list again; also an X in the search bar to clear it · UX · S
- [x] RRA-051 · Tablet and computer layout (reference: /mnt/project-files/references/rra-051-tablet-layout.png). Phones stay as they are. On wide screens: a left sidebar listing every section (Recipes, Prep, Stock, Board, Schedule, Settings...) instead of bottom tabs; sections shown open instead of collapsed; stock and dishes as wide tables (item, type, unit, on hand, par, status, vendor/price). Colored chips like the reference: In stock (green), Low stock (orange), Ingredient (blue) vs Sub recipe / house recipe (purple), used on phones too · UX · L
- [x] RRA-052 · Schedule layout (reference: /mnt/project-files/references/rra-052-schedule-layout.png), RRA-051 colors. Tablet and computer: week grid with days across the top, staff grouped under colored role bands (e.g. Bartender, Host, Manager, Server, Kitchen), each shift a colored pill with a role letter badge and times, TIME OFF pills, an Open shifts row. Phone: same colors and role badges, one day at a time with a day picker, grouped by role · UX · L
### 0.4.2 · build 2026.11.19-4
- [x] RRA-048 · Play the whoosh sound (/mnt/project-files/assets/whoosh.mp3) with the opening screen, only on first launch and after an update. iPhone blocks sound until a tap, so it plays on the tap that opens the app if autoplay is blocked · UX · S
### 0.4.1 · build 2026.11.19-3
- [x] RRA-046 · Order guides: Print button is grayed out and the phone says "This website has been blocked from automatic printing". Make printing work from the installed app (with a share/save-as-PDF fallback); check recipe and schedule printing too · Bug · S
- [x] RRA-047 · Recipe archive (Dishes): menu sections start closed; opening one closes the one already open, like Stock count · UX · S
### 0.4.0 · build 2026.11.19-2
- [x] RRA-040 · Stock count: floating Save button that stays fixed above the right side of the stock search · UX · S
- [x] RRA-041 · Stock sections start closed; opening one closes the one already open (accordion), to cut scrolling · UX · S
- [x] RRA-042 · Print the schedule for several weeks at once · Feature · S
- [x] RRA-043 · Notify the inviter when a phone's request is waiting for approval, so they can do other things meanwhile · Access · M
- [x] RRA-044 · Preset vendors: 10 common food-service suppliers for Bootleggers' usual items · Content · S
- [x] RRA-039 · Managers can pick Staff or Chef when sending an invite (today a manager's invites are always Staff; only the Host picks the role) · Access · S
### Your steps
- [x] RRA-032 · Paste firestore.rules into Firebase → Databases & Storage → Firestore → Rules → Publish · Infra · S — project and config done 2026-11-18 (published by Gaylan)
### 0.3.1 · build 2026.11.19-1
- [x] RRA-045 · Full menu from the Host added to the Recipe archive by section with prices; stock list updated to match · Content · S
### 0.3.0 · build 2026.11.18-7
- [x] RRA-035 · Host backup code: save a password-protected backup of the Host key once, and restore it on a new install or new phone without a new app release · Safety · M
- [x] RRA-036 · Staff restore: a phone that lost its access asks again, and the Host or a manager re-approves it with one tap instead of a new invite · Access · M
- [x] RRA-037 · Warning in the app and in About: always open from the home screen icon, never in Safari, and don't remove the icon (it erases access on this phone) · UX · S
### 0.2.4 · build 2026.11.18-6
- [x] RRA-038 · New Host key added (the old one was lost on the phone) · Safety · S
### 0.2.3 · build 2026.11.18-5
- [x] RRA-034 · Host phone opened to Invite only with no way to make invites (the phone's saved Host key was gone). The Invite only screen now always offers Host setup, so a new Host key can be made and added · Bug · S
### 0.2.2 · build 2026.11.18-4
- [x] RRA-033 · Host phone stuck on Host setup after 0.2.1: the update stored the old config from the browser cache. Fixed, and updates now install by themselves · Bug · S
### 0.2.1 · build 2026.11.18-3
- [x] RRA-027 · Host key added to the app (Host phone set up) · Safety · S
### No release (Gaylan's step)
- [x] RRA-026 · GitHub Pages turned on · Infra · S
### 0.2.0 · build 2026.11.18-2
- [x] RRA-001 · Recipe archive: shared library of every dish, by menu section, with photo, build, steps and house recipes used; Host/Chef/Managers upload · Data · L
- [x] RRA-002 · Roles and permissions: Host (app admin, full control above everyone, can't be lowered), then Chef, Manager, cooks with see/change switches per area · Safety · L
- [x] RRA-003 · Print-friendly recipe with batch scaling (×2, ×4) · UI · S
- [x] RRA-004 · Message board (everyone / kitchen / managers, replies, store-and-forward) · Data · M
- [x] RRA-005 · Interactive prep lists by station, ticked off live · UI · M
- [x] RRA-006 · Stock counts with par levels; add new items and remove ones no longer stocked · Data · M
- [x] RRA-007 · Needed-stock list, filled automatically from the RRA-006 counts · Data · S
- [x] RRA-008 · Order guides by vendor; vendors added and removed in Settings · Data · M
- [x] RRA-009 · Staff scheduling with swap requests; add and remove staff · UI · L
- [x] RRA-010 · BEOs / event orders · Content · M
- [x] RRA-011 · Recipe costing and waste log · Data · M
- [x] RRA-029 · Settings section: Staff, Roles, Invites, Vendors, Stock items, Prep stations, Menu sections, app options, About, Report a problem · UI · M
- [x] RRA-030 · Rename Owner to Host everywhere (no personal name in the app) · UI · S
- [x] RRA-031 · Shared team data: Firebase chosen (2026-11-18); sync built, encrypted with a team key handed over in each approval · Infra · M
### 0.1.0 · build 2026.11.18-1
- [x] RRA-012 · About section: short how-to, version and build, "What's new" updates link, Report a problem · UI · M
- [x] RRA-013 · Native phone colors and buttons (follow the iOS/Android system look, light and dark) · UI · M
- [x] RRA-014 · Startup screen like VYBEON ONE, shown on first launch and after updates, using Gaylan's icon · UI · M
- [x] RRA-015 · Global notifications route like VYBEON, for messages sent to everyone · Data · M
- [x] RRA-018 · Manager-only invites: single-use and tied to one device, so a forwarded link won't open the app · Safety · M
- [x] RRA-019 · Access expires after a few weeks without use (for example after someone is let go). A new invite restores it if they're rehired · Safety · M
- [x] RRA-020 · Notice popups: the software is proprietary, it must not be shared, and emails used for communication could possibly (but unlikely) become public · UI · S
- [x] RRA-021 · Encrypt part of the app's data, like VYBEON · Safety · L
- [x] RRA-022 · 6-second black-and-white startup clip: sparkles/particles come together to form the Bootleggers logo, then a 1-second fade to full black (used by RRA-014) · UI · M
- [x] RRA-023 · Bootleggers logo pinned at the top behind the upper control bar; content scrolls underneath while the logo stays still · UI · S
- [x] RRA-024 · Preinstalled starter stock list for Bootleggers Augusta (draft in research/bootleggers-starter-stock.md, waiting for chef review) · Data · S
- [x] RRA-025 · House ("designer") recipes section for rubs, sauces, dressings and other in-house items, with step-by-step prep, yield and storage notes. Dishes can link to the house recipe they use (e.g. a wing sauce). A "NEW RECIPE" button opens a dialog with name, ingredients with quantities, instructions, and a small comments section kept collapsed so it doesn't clutter the dialog · Content · M
### No release (Gaylan's step)
- [x] RRA-017 · Web3Forms access key received, stored in config/report-a-problem.md · Infra · S
- [x] RRA-016 · App icon received: Bootleggers logo, saved at assets/bootleggers-logo.png · Content · S

## ⚪ Dropped

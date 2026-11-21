# Restaurant Recipe App (RRA) — Build list

Rule: every build item goes on the Build list and waits until Gaylan says "Build list". Nothing is built before then.
Platform: a web app that works on iPhone and Android, like the VYBEON apps. Only a Manager or the Admin can hand it out, through an invite. An invite can't be passed on by anyone else: it works once, on one device.

Previews of RRA-001 to RRA-011 and Settings: /mnt/project-files/previews/rra-001-011/rra-previews.html. Gaylan approved them with changes on 2026-11-18 and ordered the build. Built in 0.2.0. Firebase config is in the app; shared data works once the rules are published (RRA-032).

## 🔴 Needs you
- [ ] RRA-028 · Chef review of the starter stock list (items, units, bar list) · Content · S

## 🔵 Build list
- [ ] RRA-081 · Fix (RRA-078): the requester's answer to a swap question only shows under the private message on the board, so approvers don't know a reply came in. Put a flag (🚩 "Reply received") with the answer on the swap request itself (Schedule swap list and the conflict pop-up), shown to every approval holder (managers, the Admin, anyone allowed to approve swaps), not only the one who asked. Also pop it up for approvers when they open the app, and count new replies as unread on the board (Gaylan, 2026-11-21) · Bug · S
- [ ] RRA-082 · Tapping a swap request (the "Swap requests" row in the lounge, the RRA-080 badge, or a swap pop-up) opens the Schedule page and scrolls straight down to that request, briefly highlighted, instead of just landing at the top of the page (Gaylan, 2026-11-21) · UX · S
- [ ] RRA-083 · Swap requests: the person who asked gets a Remove button on their own request, to withdraw it (for example after a conflict, or for personal reasons). Only while it hasn't been approved; once approved it can't be removed. Approvers see it as withdrawn and any pop-up for it stops (Gaylan, 2026-11-21) · Feature · S
- [ ] RRA-079 · Swap declined: the person who asked gets a pop-up when a manager declines their swap request (and when one approves it), the next time they open the app (Gaylan, 2026-11-21) · Feature · S
- [ ] RRA-080 · Home screen: show waiting swap requests as a badge on the right of the Employee lounge button, next to the arrow (shown to managers, the Admin and anyone else allowed to approve swaps, with the number waiting for a decision; and to the person who made the request, for their own requests that are waiting or answered) (Gaylan, 2026-11-21) · UX · S

## 🟡 Hold

## 🟣 Done
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

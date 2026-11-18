# Restaurant Recipe App (RRA) — Build list

Rule: every build item goes on the Build list and waits until Gaylan says "Build list". Nothing is built before then.
Platform: a web app that works on iPhone and Android, like the VYBEON apps. Only a Manager can hand it out, through an invite. An invite can't be passed on by anyone else: it works once, on one device.

Previews of RRA-001 to RRA-011 and Settings: /mnt/project-files/previews/rra-001-011/rra-previews.html. Gaylan approved them with changes on 2026-11-18 and ordered the build. Built in 0.2.0. Firebase config is in the app; shared data works once the rules are published (RRA-032).

## 🔴 Needs you
- [ ] RRA-032 · Paste firestore.rules into Firebase → Databases & Storage → Firestore → Rules → Publish · Infra · S — project and config done 2026-11-18
- [ ] RRA-028 · Chef review of the starter stock list (items, units, bar list) · Content · S

## 🔵 Build list

## 🟡 Hold

## 🟣 Done
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

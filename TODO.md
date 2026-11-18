# Restaurant Recipe App (RRA) — Build list

Rule: every build item goes on the Build list and waits until Gaylan says "Build list". Nothing is built before then.
Platform: a web app that works on iPhone and Android, like the VYBEON apps. Only a Manager can hand it out, through an invite. An invite can't be passed on by anyone else: it works once, on one device.

RRA-001 to RRA-011 are proposed in research/orkid-comparison.md and are waiting for Gaylan's review. They are not on any list yet.

## 🔴 Needs you
- [ ] RRA-026 · Turn on GitHub Pages so the app has a web address · Infra · S — after the PR is merged: repo Settings → Pages → Source "Deploy from a branch" → main / root → Save
- [ ] RRA-027 · Create the Owner key on your own phone · Safety · S — open the app from your home screen, tap "I'm the Owner: set up this phone", tap Copy Owner key and send it to Claude to add to the app
- [ ] RRA-028 · Chef review of the starter stock list (items, units, bar list) · Content · S

## 🔵 Build list

## 🟡 Hold

## 🟣 Done
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

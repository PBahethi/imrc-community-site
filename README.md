# Tree in the Forest

A responsive community demo built from `CODEX_PROMPT.md` and the supplied Ramayana workbook, designed for GitHub Pages. It now includes an engagement-oriented My Community dashboard with actionable next steps, explainable people suggestions, interest-based example groups, browser-local preferences, ways-to-help prompts, household event registration, event requests, family/friends tree views, a unified personal activity feed, and an IMRC Oklahoma City convention planning workflow. The convention programme uses day tabs, category filters, personal schedules, per-session QR check-ins, and private participation badges alongside the searchable directory, lineage collections, directional relationships, event artwork, saved-event filters, calendar agenda, contextual help, and ICS downloads.

The phased product plan is [docs/active-community-plan.md](docs/active-community-plan.md). Phase 1 is intentionally a safe public demo: it creates useful discovery and contribution prompts without pretending that a visitor is authenticated, has joined a group, sent an invitation, RSVP'd, or offered help to another member.

The secure backend foundation is [docs/secure-backend-phase.md](docs/secure-backend-phase.md), with the first Supabase/Postgres migration at [supabase/migrations/0001_secure_foundation.sql](supabase/migrations/0001_secure_foundation.sql). It is a schema and policy foundation only; apply it to a reviewed Supabase project before adding a member application or real data.

The public demo also includes a simulated sign-in at `#login`. Choose a fictional workbook member to open `#profile`, edit a display name, city, or short bio, and save those changes in this browser. The red **Reset demo** tab clears the simulated session, profile edits, preferences, saved introductions/groups, and local activity back to the original baseline; it does not alter the workbook or real accounts. This is deliberately not authentication.

Selected profile portraits are sourced from Wikimedia Commons public-domain or CC0 depictions and are attributed in `scripts/profile-art.json`; they are artistic representations, not historical photographs. Profiles without a selected portrait retain initials. Catch phrases are editorial demo copy and can be edited locally in the simulated profile.

The organization masthead now exposes a national/chapter context and a city-derived visual theme. Theme palettes are documented in `themes/colorpalette.md`; members can override the suggested Jaisalmer, Jodhpur, Udaipur, Jaipur, or Peacock palette from the header. Navigation is grouped into what is happening and who is here so convention categories stay with the convention rather than becoming global page chrome.

The organization model is represented by `ChapterCore`: IMRC National owns shared programs and the IMRC Convention calendar, while regional chapters are selected from a member's home-city/chapter field and maintain their own committees and initiatives. `#chapters/<id>` presents that hierarchy. `Voting`/`VotingCore` is a reusable, browser-local poll that national or chapter committees can open at `#votes` when a decision needs member input.

The landing experience is a guided Rama demo workflow: sign in, register for the IMRC Convention, choose agenda sessions, review them on the profile, and follow activity/badge progress. The original welcome survey is preserved as a reusable community-listening poll example on the Votes & polls page.

The calendar includes the February 28, 2027 `IMRC Officer Voting` event. Its linked voting component provides four National ballots and four Chapter ballots (President, Vice President, Treasurer, and Secretary); the event detail and downloadable ICS both point members back to `#votes`.

The convention airline planner uses native date and time controls, editable flight fields, and expected OKC suggestions covering the week before, convention dates, and the week after. The demo carrier fixture follows the current OKC Airport airline directory and nonstop-city listing; flight numbers and times are illustrative and must be verified against the member's booking.

## Run locally

Requires Python 3; no package installation or environment variables.

```sh
python3 scripts/build.py
python3 -m http.server 8000 --directory site
```

Open http://localhost:8000. Run all interaction, state, and security regression checks with `node --test tests/*.test.cjs`. Check each browser module with `node --check site/<module>.js`; CI checks all modules and tests automatically.

Checks cover directory search/filter/pagination, source integrity and public-field allowlisting, route rendering, missing-profile handling, HTML escaping, and local event saves. Additional checks cover monthly dates, image presence, calendar exports, month/saved filters, convention logistics, accessible tooltip markup, deterministic recommendations, preference persistence, group discovery, date-aware dashboard content, and corrupted or unavailable browser storage.

Event participation now mounts a single registration/request panel and updates it after a confirmed save. Members and family created during a demo session can register immediately; validation follows the current member list while preserving saved and visit-only activity. The signed-in profile combines login/logout history, profile changes, event registrations and requests, convention logistics, questions/help/recognition activity, and QR check-ins for that fictional member. The 2028 IMRC convention workflow adds a review path for registering, opening an external hotel booking link, returning to finish airline logistics, selecting airport bus times, choosing agenda sessions in any order, setting reminders, and saving an example packing list in the browser. Its structured programme covers business, charity, networking, matrimonial, card games, local outings, RAYS, Women/Sakhi, health, culture, meals, and travel. Day tabs and category filters operate on both the programme browser and personal planner. Selected sessions appear on the signed-in profile with a public-session QR link; simulated check-ins create private browser activity and unlock participation badges without a public score or leaderboard. Locality Map is handled by the main router, waits for Leaflet 1.9.4 CSS and scripts, and discards pending renders when the member leaves the page. Failed map assets show a retry message. The heat map currently shows aggregate US Census county total population, not South Asian or Indian-subcontinent heritage counts; Canadian directory members do not add Canadian Census coverage. Signed-in profiles can show fictional family-location dots over that aggregate layer.

The September 2026 rendering fixes and convention workflow are covered by automated checks, including observer stability, member-list replacement, convention logistics state, structured agenda integrity, badge milestones, QR check-in validation, map asset failures/retries, stylesheet readiness, and route transitions. Playwright's bundled Chromium also verifies event sign-in/registration/requests, immediate registration of a new household, loaded map tiles/heat layer, both module/data loading orders, repeated map navigation, programme filters, and profile schedule persistence. Browser screenshots are kept locally under `output/playwright/`.

## GitHub Pages

Live website: https://pbahethi.github.io/imrc-community-site/

Public deployment repository: https://github.com/PBahethi/imrc-community-site

The original IMRC repository stays private. The public repository contains only the generated `site/` contents and a `.nojekyll` file. GitHub Pages publishes its `main` branch root. No workbook, product specification, or private repository history is copied there.

The workflow `.github/workflows/pages.yml` validates the source and uploads a `public-website` artifact. It does not deploy from this private repository because the current account plan does not support that. To update the live website, rebuild and test here, copy the contents of `site/` into a checkout of the public deployment repository, then commit and push there. Preserve `.nojekyll`. These repositories do not automatically synchronize.

All assets use relative paths, and navigation uses hash routes so project-path hosting and reloads work without server routing.

## Source and data model

The importer uses Python's standard XML/ZIP libraries and an explicit public-field allowlist. Stable workbook IDs connect 54 public demo profiles (44 workbook Ramayana profiles plus 10 supplemental Mahabharata character fixtures mapped across Canadian provinces), 80 directed relationship records, 8 workbook story events, one IMRC convention planning event, and 47 seeded story-event registrations. It validates source references and overwrites the generated JSON deterministically. The original workbook is unchanged. Supplemental records are labeled with `collection: Mahabharata`, a Canada chapter, and synthetic city data so the directory can demonstrate cross-border discovery without adding private members.

`Gautama` is a referenced person without a profile (REL-060). The relationship is retained with its original identifier and note, and the UI explains the missing profile. The original workbook has no dates. The requested 2027 demo programme schedules the eight story events once each, one per month from January through August, on days 9–16 respectively. These are planned all-day demonstration dates, not historical dates or confirmed public gatherings. The added IMRC Convention 2028 planning event runs January 15-18, 2028 at Omni Oklahoma City Hotel as a public-demo concept. Venue facts are based on Omni's public Oklahoma City meetings and directions pages; airport facts and pickup-zone concepts come from OKC Airport and City of OKC public pages. The room map is schematic and not an official hotel floorplan. Each event has an ICS download; the convention ICS spans the four programme days. `scripts/event-art.json` maps supplied artwork to story event cards; `site/images/okc-convention.svg` is a generated schematic. Optimized JPEGs in `site/images/` keep page downloads small; the source images are unchanged. Lineages are derived collections, not invented membership groups.

## Privacy and architecture

This is a public **demo**, not the production private-directory MVP described in the specification. Modern details in the workbook are synthetic. The Mahabharata additions are fictional demo profiles inspired by commonly referenced characters. Relationship notes are preserved because interpretations can vary across traditions. The website excludes contact details, street addresses, demographic preferences, and private registration logistics from its generated payload. Never import real member information into this public site.

`site/index.html`, `styles.css`, `convention.css`, `convention-experience.css`, `convention-experience.js`, and `app.js` implement a dependency-free static frontend. `scripts/build.py` is the data boundary, and `site/data.json` is the public payload. Text from the workbook is HTML-escaped before rendering. Google Fonts are optional; system font fallbacks work offline. Demo event bookmarks, household registrations, event requests, convention logistics, bus choices, agenda selections, reminders, packing lists, QR check-ins, and participation badges use localStorage; they do not notify organizers, reserve a production seat, book hotel rooms, hold bus seats, confirm attendance with an organizer, or send a message.

Database migrations are provided but have not been applied to a configured backend. Real authentication, private field authorization, registration, notifications, and admin tools require that backend and cannot be secured with client-side UI controls. Browser state is personalization only, not an authorization boundary. Keep the authenticated member application separate from the public demo fixture.

## Delivery plan and current phase

| Phase | Outcome | Status |
| --- | --- | --- |
| Tree | Public directory, relationships, events, calendar, and ICS exports | Demo implemented; real RSVP/logistics remain production work |
| First branches | Interests, suggestions, groups, local member/family creation, activity, portraits, tiers, catch phrases, searchable help offers, relationship trees, convention logistics review, and spotlights/nominations | Browser-local foundation; no real accounts |
| Next branch | Community questions, replies, follow, reactions, reports | Browser-local foundation |
| Phase 2 | Mentorship discovery and preferences | Browser-local foundation; AMAs, challenges, guides and matching expansion remain planned |
| Production | Authenticated API, private database, moderation, notifications, analytics | Schema/hardening/runbook prepared; activation and live policy verification pending |

“Auto mode” means the next highest-value phase is implemented from the existing architecture without waiting for a separate redesign: reuse the static data boundary, `CommunityCore` state rules, `Engagement` views, and the existing reset behavior. Each phase remains reviewable and deployable on its own.

## Planned features and sequencing

The public demo is intentionally a browser-local foundation. The following backlog records the next capabilities, in priority order, so a new change can be placed in the product plan before implementation begins.

### P0 — Production tree

- Activate the reviewed Supabase migrations with Supabase Auth and a server-side API.
- Replace simulated sign-in with invitation/approval, owned profiles, family and friend consent, account recovery, and deletion/export.
- Add real groups, event registration, capacity and waitlists, private logistics, calendar sync, moderation, and notification preferences.
- Preserve the public GitHub Pages demo as a synthetic, read-only boundary.

### P1 — First branches

- Persist normalized interests and use deterministic, explainable suggestions across people, groups, events, and mentors.
- Add authenticated Ask the Community questions, replies, follows, reactions, reports, help offers, mentorship introductions, spotlights, and nominations.
- Add onboarding for new members, opt-in introductions, event follow-up, volunteer and carpool coordination, weekly digests, and lightweight feedback loops.
- Add administrator views for useful participation measures such as connections created, groups joined, event attendance, questions answered, and members helped.

### P2 — Community scale

- Add AMA event support, recurring small-group activities, challenges, collaborative guides and recommendations, and richer volunteer matching.
- Add privacy-reviewed photo/headshot storage, contribution prompts, notification digests, and a restrained activity feed with field-level visibility.
- Make the authenticated experience installable as a PWA and prepare the same API for future iOS and Android clients.

### P3 — Future exploration

- Improve recommendation quality from explicit feedback while keeping reasons visible and reviewable.
- Add data-informed program planning, accessibility improvements, translations, and additional calendar providers after the core privacy and moderation workflows are proven.

Features in P2 and P3 should not delay the P0 member journey. A feature moves from planned to current only after its data boundary, privacy behavior, tests, and browser flow are documented.

## Keeping this README current

When a feature is added, update the current-phase table, the capability summary near the top, the data-model notes if entities or fields changed, the verification commands or acceptance journey, and this planned-feature list. Record whether the behavior is browser-local or backed by the authenticated service. Do not describe a production capability as complete based only on a static UI; require passing tests and a representative browser flow first.

## Foundation verification and backend boundary

Run all local regression checks with `node --test tests/*.test.cjs`, then build with `python3 scripts/build.py`. Browser verification should cover creation → sign-in → edit → reload → family link → questions → mentor preferences → reset on desktop and mobile. Unit/static checks alone do not establish that these journeys work in a browser.

The [security review](docs/security-review.md) records findings and fixes. Both migrations and the [database assertions](supabase/tests/access-control.sql) passed in a disposable PGlite PostgreSQL/WASM runtime using minimal Supabase Auth stand-ins. The optional runner is `tests/security-runtime.cjs`; hosted Supabase Auth, PostgREST, and Storage remain unverified. The ordinary Node security tests are static regression guards. See the [backend runbook](docs/secure-backend-phase.md) for activation prerequisites.

## Try the local member journey

1. Choose **Demo sign in**, or create a fictional member. Creation opens the saved profile automatically.
2. Choose **Add a family member** to copy the household's shared fields. Select the relationship; names, portraits, and catch phrases stay personal. New people and relationships appear in the directory and family view.
3. Address suggestions use four public landmark fixtures. Selecting one fills city and ZIP. **Fill city & state** optionally sends only the ZIP to [Zippopotam.us](https://docs.zippopotam.us/docs/getting-started/); manual city entry works when the service is unavailable.
4. Phone examples use a valid sample area code and **555-0100 through 555-0199**, the [NANPA fictional range](https://nanpa.com/numbering/555-line-numbers). ZIP codes do not uniquely identify an area code. Unknown ZIPs use the documented 202 sample fallback.
5. From **My Community → Take part**, ask/reply/follow questions, offer mentoring, find/offer help, and nominate someone for a spotlight. Sign in as a second fictional member to see the first member's explicit offers.
6. Open **Events → IMRC Convention 2028**. Register a household, open the external hotel-booking link, return to enter airline details, choose arrival/departure airport coaches, filter the four-day programme, select agenda sessions in any order, set reminders, and save the suggested packing list.
7. Open **My Profile** to see the selected sessions and their QR links. Open a scheduled session, record a simulated check-in, and return to the profile or dashboard to see the activity and earned participation badge.
8. Reload to verify saved choices. **Reset demo** clears the local members, family links, profile edits, questions, mentoring, help offers, nominations, activity, event bookmarks, registrations, requests, convention logistics, QR check-ins, and participation badges.

All local members and actions are review data in one browser. Reports and nominations do not notify anyone. Membership tiers illustrate the requested editorial story-role mapping; they grant no real permissions, prices, or benefits.

Independent workstreams can build new modules without editing shared routing. Integration owns `index.html`, `app.js`, and `engagement.js`. AMAs, challenges, guides, real registration/logistics, digest delivery, and authenticated backend activation are queued after this verification milestone.

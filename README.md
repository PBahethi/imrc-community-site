# Tree in the Forest

A responsive community demo built from `CODEX_PROMPT.md` and the supplied Ramayana workbook, designed for GitHub Pages. Includes a dashboard, searchable and paginated directory, lineage collections, directional relationships with source notes, event participant views, browser-local event bookmarks, and a 2027 calendar agenda, accessible contextual help, image-led event cards, saved-event filters, and ICS downloads.

## Run locally

Requires Python 3; no package installation or environment variables.

```sh
python3 scripts/build.py
python3 -m http.server 8000 --directory site
```

Open http://localhost:8000. Run interaction and data checks with `node --test tests/site.test.cjs`. JavaScript syntax check: `node --check site/app.js`.

Checks cover directory search/filter/pagination, source integrity and public-field allowlisting, route rendering, missing-profile handling, HTML escaping, and local event saves. Additional checks cover monthly dates, image presence, calendar exports, month/saved filters, and accessible tooltip markup.

## GitHub Pages

Live website: https://pbahethi.github.io/imrc-community-site/

Public deployment repository: https://github.com/PBahethi/imrc-community-site

The original IMRC repository stays private. The public repository contains only the generated `site/` contents and a `.nojekyll` file. GitHub Pages publishes its `main` branch root. No workbook, product specification, or private repository history is copied there.

The workflow `.github/workflows/pages.yml` validates the source and uploads a `public-website` artifact. It does not deploy from this private repository because the current account plan does not support that. To update the live website, rebuild and test here, copy the contents of `site/` into a checkout of the public deployment repository, then commit and push there. Preserve `.nojekyll`. These repositories do not automatically synchronize.

All assets use relative paths, and navigation uses hash routes so project-path hosting and reloads work without server routing.

## Source and data model

The importer uses Python's standard XML/ZIP libraries and an explicit public-field allowlist. Stable workbook IDs connect 44 people, 80 directed relationship records, 8 events, and 47 seeded registrations. It validates source references and overwrites the generated JSON deterministically. The original workbook is unchanged.

`Gautama` is a referenced person without a profile (REL-060). The relationship is retained with its original identifier and note, and the UI explains the missing profile. The original workbook has no dates. The requested 2027 demo programme schedules the eight events once each, one per month from January through August, on days 9–16 respectively. These are planned all-day demonstration dates, not historical dates or confirmed public gatherings. Each event has an ICS download with one occurrence and exclusive next-day end dates. `scripts/event-art.json` maps supplied artwork to event cards; thematic illustrations are labeled. Optimized JPEGs in `site/images/` keep page downloads small; the source images are unchanged. Lineages are derived collections, not invented membership groups.

## Privacy and architecture

This is a public **demo**, not the production private-directory MVP described in the specification. Modern details in the workbook are synthetic. Relationship notes are preserved because interpretations can vary across traditions. The website excludes contact details, street addresses, demographic preferences, and private registration logistics from its generated payload. Never import real member information into this public site.

`site/index.html`, `styles.css`, and `app.js` implement a dependency-free static frontend. `scripts/build.py` is the data boundary, and `site/data.json` is the public payload. Text from the workbook is HTML-escaped before rendering. Google Fonts are optional; system font fallbacks work offline. Demo event bookmarks use localStorage; they do not notify organizers or register a person.

No database migrations, authentication, APIs, private field authorization, real registration, notifications, or admin tools are provided. Those require a backend and cannot be secured with client-side UI controls. The next production work is an authenticated API, normalized database, centralized privacy policies, organizer-managed dated events, and transactional registration. Keep that backend separate from the public demo fixture.

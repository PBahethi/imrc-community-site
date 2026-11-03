# Festival & holiday calendar: plan (v2)

Status: **plan only, nothing built.** Draft for Praveen's review (decision D13, Nov 3, 2026).
The repo stays public on GitHub Pages. Nothing in the calendar is member data.

## 1. Where we are today (v1, PR #8, merged Oct 29, 2026)

v1 is live at `#observances` and works. This plan doesn't replace it. It turns v1 from a
hand-checked list into something that keeps itself current.

| Piece | v1 today |
|---|---|
| Data | `observances.json`: 77 dates. 39 festivals, 7 Jain, 5 Rajasthan fairs, 23 US holidays, 3 India holidays. 71 `verified`, 6 `tentative`. |
| Range | Festivals Nov 2026 to Dec 2027. US holidays 2026 and 2027. |
| Location | One panchang location: Washington, D.C. |
| Build | `scripts/build_observances.py` writes 6 `.ics` feeds (`all`, `festival`, `jain`, `rajasthan`, `us-holiday`, `india-holiday`). |
| UI | Month and list views, remembered category filters, days with no events hidden on phones, webcal, Google and download links. |
| Tests | `tests/observances.test.cjs`: data integrity, ICS/JSON in sync, line folding, helpers. |

**Gaps that v2 fixes**

1. Hindu and Jain dates were copied by hand from Drik Panchang (Washington, D.C.).
   That's fine as a one-off cross-check, but not as a yearly data source. See section 3.
2. Every date is for D.C. Tithis change at local sunrise, so a date can be a day off for
   chapters elsewhere in the US or Canada.
3. The data ends in Dec 2027, and someone has to re-enter every date each year.
4. "India holidays" has only the 3 national days. There's no central-government gazetted
   list and no Rajasthan state list.
5. There's no Jain sect handling (Shwetambar or Digambar). Paryushan and Das Lakshan differ.
6. There's no way to download a single event, or the current filtered view, as `.ics`.

## 2. Goals and non-goals

**Goals**
- Compute lunar-calendar dates ourselves from public-domain astronomy, then check them against
  published panchangs. No copying from restricted sites.
- Keep a dated source for every date, plus one line explaining why it falls on that day.
- Per-chapter dates where the panchang differs.
- A month view and a list view that work on a 320 px phone.
- Filters, subscribable feeds, and single-event and filtered `.ics` downloads.
- A yearly refresh that opens a pull request for review and never publishes by itself.

**Non-goals**
- No backend, accounts or database. It stays a static site on GitHub Pages.
- No scraping, and no automated fetching from any panchang or government site.
- No muhurat, horoscope or astrology features.
- No changes to the old private IMRC registration repo.

## 3. Data sources and licensing

| Data | Source | Licence / terms | How we use it |
|---|---|---|---|
| Sun and Moon positions, sunrise, sunset, moonrise | [Skyfield](https://rhodesmill.org/skyfield/) (MIT) with the JPL DE440s ephemeris | MIT. JPL ephemerides are NASA/JPL works, free to use. | Build time only. We compute tithi, nakshatra, sankranti and the kala windows (sunrise, pradosh, nishita, moonrise). |
| Second, independent engine for checking | [kalagana](https://pypi.org/project/kalagana/) (MIT, pure standard library) | MIT | Run in tests only. If it disagrees with our date, the build flags it for a human to check. |
| Not used | `drik-panchanga` (AGPL-3), Swiss Ephemeris and wrappers built on it (AGPL or commercial) | Copyleft or commercial | Avoided to keep the repo's licence simple. |
| Human cross-check of Hindu and Jain dates | Drik Panchang, temple panchangs, JAINA and Jain sangh calendars | Drik reserves rights to its apps and data, and its robots.txt blocks `/ajax/*` and `/dp-api/*`. | A person looks up a handful of dates each year and records the URL and date in `checkedAgainst`. No fetching and no copied text. A date is a fact; descriptions are always our own words. |
| US federal holidays | [OPM federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/) | US government work, public domain | Computed from the statutory rules (5 U.S.C. 6103), including the Friday/Monday observed-day shift, and checked against OPM's yearly table. |
| India central-government holidays | DoPT yearly Office Memorandum (gazetted and restricted holidays, usually issued in the previous summer or autumn) | Government of India publication | Entered by hand from the OM, with its link. Religious holidays use the **declared** date, not our computed one, because the government's date can differ. |
| Rajasthan state holidays (optional) | Rajasthan GAD yearly holiday notification | Government of Rajasthan publication | Same as above. Entered by hand with a link. |
| Rajasthan fairs (Pushkar, Nagaur, Desert, Marwar, Gangaur Jaipur, Teej Jaipur, Ramdevra, and others) | Rajasthan Tourism fairs and festivals list | Public tourism listing | Default date computed from the fair's tithi rule. Marked `tentative` until Rajasthan Tourism publishes that year's list; a person then confirms it and records the link. |
| Descriptions, Hindi names | Written by us or the community | Repo licence | Never copied from any source. |
| Photos (festival pages, later) | Wikimedia Commons, as in v1 | CC BY / BY-SA with credits | Same credits flow as `#credits`. |

## 4. How lunar dates are computed

- **Hindu day:** the tithi in force at local sunrise, for the chapter's location.
- **Months:** Purnimanta names (North India and Marwar usage), with Amanta stored as well.
  Handles adhik (extra) months and kshaya (skipped) tithis.
- **Rules live in data**, not code. Each festival has a rule such as:

```yaml
- id: diwali
  name: Diwali (Lakshmi Puja)
  hindi: दीपावली
  category: festival
  rule: { masa: kartika, paksha: krishna, tithi: 30, kala: pradosh }  # Amavasya during pradosh
  days: 1
- id: janmashtami
  rule: { masa: bhadrapada, paksha: krishna, tithi: 8, kala: nishita }
  traditions: [smarta, vaishnava]  # can differ by a day
- id: karva-chauth
  rule: { masa: kartika, paksha: krishna, tithi: 4, kala: moonrise }
- id: makar-sankranti
  rule: { sankranti: makara }
- id: paryushan-shwetambar
  category: jain
  rule: { masa: bhadrapada, paksha: shukla, tithi: 4, offset_days: -7 }  # ends on Samvatsari
  days: 8
  tradition: shwetambar
```

- Every computed date carries a short **reason**, e.g. "Kartik Amavasya covers pradosh on Nov 8
  in Washington, D.C.". The detail view shows it.
- **Overrides:** `overrides.yaml` sets a date by hand, with `reason`, `checkedAgainst` and
  `checkedOn`. Used for sect conventions, government-declared dates, or a published temple date
  the community follows.
- **Golden test:** v1's 71 verified dates become the regression set. The engine must match them
  for D.C., or the mismatch must have an override with a reason.

## 5. Data format in the repo

Source files (edited by people), new:

```
data/observances/
  rules.yaml                    # lunar and solar festival rules (Hindu, Jain, fairs)
  holidays-us.yaml              # US federal holiday rules
  holidays-india-2027.yaml      # from the DoPT OM, one file per year
  holidays-rajasthan-2027.yaml  # optional, from the GAD notification
  fairs-rajasthan-2027.yaml     # confirmed fair dates (else computed + tentative)
  overrides.yaml                # hand corrections, each with reason and source
  locations.yaml                # D.C. default + chapter cities (lat, lon, IANA tz)
scripts/build_observances.py    # extended: rules -> observances.json + .ics
scripts/requirements-calendar.txt  # skyfield, jplephem, numpy, pyyaml (pinned)
```

Generated files (committed, so Pages serves them as today):

- `observances.json`: same shape as v1, so the current page keeps working. New optional fields
  on each event:

```json
{
  "id": "diwali-2027",
  "name": "Diwali (Lakshmi Puja)",
  "hindi": "दीपावली",
  "category": "festival",
  "tradition": "all",
  "start": "2027-10-29",
  "end": "2027-10-29",
  "status": "computed | verified | official | tentative",
  "reason": "Kartik Amavasya covers pradosh on Oct 29 in Washington, D.C.",
  "lunar": "Kartik Krishna Amavasya",
  "source": "computed",
  "checkedAgainst": "https://...",
  "checkedOn": "2026-11-15",
  "byLocation": { "toronto": "2027-10-29", "los-angeles": "2027-10-29" },
  "description": "Our own words."
}
```

- `byLocation` is written only where a chapter's date differs from D.C. That keeps the file small.
- `calendars/observances/*.ics`: same 6 feeds as today, plus `all-<chapter>.ics` where any date
  differs.
- The ephemeris file (DE440s, about 32 MB) is **not committed**. The build downloads it from
  JPL/NAIF once and caches it locally and in Actions.

## 6. UI

Builds on the existing `#observances` route and the `observances.js` helpers.

**Month view (desktop and tablet)**
- Colored dot per category, today highlighted, previous/next month and a Today button.
- Small lunar label on festival days (e.g. "Kartik Shukla 11") when that toggle is on.
- Keyboard: arrow keys move between days, Enter opens the day.

**List view (default on phones)**
- Upcoming first, grouped by month with sticky headers, "in 12 days" hints.
- Search box (English or Hindi name).
- No horizontal scroll at 320 px. Tap targets at least 44 px.

**Detail sheet (`#observances/<id>`, shareable link)**
- English and Hindi name, date or date range, lunar date, why this date (the reason line).
- Location note when the date differs by chapter, and tradition note (e.g. Shwetambar vs Digambar).
- Sources with checked dates.
- Add to calendar: download this event (`.ics`) or open in Google Calendar.

**Location**
- Chapter picker, defaulting to the signed-in demo member's chapter, else D.C.
- Dates update from `byLocation`.

**Accessibility**
- axe WCAG 2 A/AA with no violations, as in v1.
- Respects `prefers-reduced-motion`.
- Category is shown by label and shape, not color alone.

**Optional**
- A toggle to overlay IMRC community events (the existing `calendars/EV*.ics`) on the same month.

## 7. Filters

- **Category chips** (existing, remembered): Festivals, Jain, Rajasthan fairs, US holidays, India holidays.
- **Tradition:** Jain Shwetambar or Digambar; Smarta or Vaishnava, which only affects Ekadashi and Janmashtami.
- **Depth:** "Major festivals" (default), or "Include monthly vrats" (Ekadashi, Purnima, Amavasya, Sankashti).
- **Presets:** "Holidays only" (offices and banks closed), "Festivals only".
- **Location:** chapter picker (section 6).
- Filters are saved per device in `localStorage` and also mirrored in the URL
  (`#observances?cat=festival,jain&loc=toronto`), so a filtered view can be shared.

## 8. ICS export

- **Subscribe feeds** (existing): 6 per-category feeds, plus per-chapter `all-<chapter>.ics`.
  - Webcal and Google links as today.
  - `REFRESH-INTERVAL;VALUE=DURATION:P1D` and `X-PUBLISHED-TTL:P1D`.
  - Google refreshes subscribed feeds slowly (often 12 to 24 hours or more). The page will say so.
- **Single event:** a client-side Blob download from the detail sheet.
- **Filtered export:** "Download what I see" builds a `.ics` in the browser from the current filters.
- **RFC 5545 details (keep v1's):**
  - All-day `VALUE=DATE` with exclusive `DTEND`.
  - 75-octet folding and CRLF line endings.
  - Deterministic `DTSTAMP`.
- **Stable UIDs:** `<id>@imrc-community-site` never change, so a corrected date updates the
  existing calendar entry rather than adding a duplicate. `SEQUENCE` goes up when a date changes.
- Every feed is checked in tests with Python `icalendar`.

## 9. Yearly updates

**Automated (free GitHub Actions on a public repo)**
- A workflow `calendar-refresh.yml` runs monthly and on manual dispatch.
- It rebuilds a rolling window (today through December of next year), runs the tests and
  **opens a pull request**. It never merges or deploys.
- The PR body lists new dates, changed dates, and every place where our engine and the
  cross-check engine disagree.

**Human, once a year (about Oct to Dec)**
1. Enter the next year's India holidays from the DoPT OM. Add Rajasthan state holidays if chosen.
2. Confirm Rajasthan fair dates once Rajasthan Tourism publishes them. Flip `tentative` to `verified`.
3. Spot-check about 10 major dates (Diwali, Holi, Gangaur, Teej, Raksha Bandhan, Janmashtami,
   Navratri, Samvatsari, Mahavir Jayanti, Makar Sankranti) against two published panchangs.
   Record `checkedAgainst` and `checkedOn`.
4. Check US holidays against OPM's table (rules rarely change; a new federal holiday needs an Act of Congress).
5. Review and merge the refresh PR.

**Community corrections:** a "Report a wrong date" link opens a pre-filled GitHub issue
(template `wrong-date.yml`), so fixes come with a source.

The steps go in `docs/calendar-maintenance.md`, with a named owner and reviewer.

## 10. Tests

- **Rule engine:** the golden set (v1's 71 verified dates); adhik-month years (2026 Adhik
  Jyeshtha); kshaya-tithi cases; date-line and timezone edges for Pacific and Canadian chapters.
- **Data:** JSON schema check on every source YAML and on `observances.json`; every
  non-computed date has a source; unique, stable IDs.
- **ICS:** `icalendar` parse, UIDs stable across rebuilds, `SEQUENCE` bump when a date changes.
- **UI:** `node --test` for helpers. A Playwright smoke run at 375 px and 1280 px (month, list,
  detail, filters, URL state). axe A/AA.

## 11. Effort estimate

| Phase | Work | Days |
|---|---|---|
| 1 | Source YAML and schema; migrate v1 data; output identical to v1 | 1 to 1.5 |
| 2 | Lunar engine (Skyfield) and rules for about 45 festivals, Jain observances and fairs; golden tests; kalagana cross-check | 3 to 4 |
| 3 | US holiday rules; India 2027 and Rajasthan 2027 entry | 0.5 to 1 |
| 4 | Chapter locations and `byLocation` | 1 |
| 5 | UI: location picker, tradition and vrat filters, detail sheet with reason, URL state, search | 2 to 3 |
| 6 | ICS: per-chapter feeds, single-event and filtered downloads, `SEQUENCE` | 1 |
| 7 | Refresh workflow, issue template, maintenance doc | 1 |
| 8 | QA, accessibility, review fixes | 1 |
| | **Total** | **about 10.5 to 13.5 working days** |

**Smaller first cut (about 6 days):** phases 1, 2 (D.C. only), 3 and 7. It ends the hand-copying
and gives the yearly PR. Chapters, new filters and new exports come after.

**Main risks**
- Regional and sect disagreements: some families follow a temple's date. Handled with
  overrides plus a visible reason, not by guessing.
- Government-declared dates can differ from computed ones. Use the declared date for the
  holiday categories.
- Phase 2 is the riskiest part. The golden set limits that.

## 12. Decisions needed from Praveen

1. **Locations:** D.C. only (as now), or a date per chapter city?
2. **Jain tradition:** Shwetambar (which gaccha?), Digambar, or both with a filter?
3. **Monthly vrats** (Ekadashi, Purnima, Amavasya): include them, off by default?
4. **India holidays:** the full DoPT gazetted list (this includes other faiths' holidays such as
   Eid, Christmas and Guru Nanak Jayanti), or national days only?
5. **Rajasthan state holidays:** include them?
6. **Who reviews and merges** the yearly refresh PR?
7. **Window:** a rolling 13 to 24 months, or the current year plus the next?

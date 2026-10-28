# How to use the IMRC community demo

This is a walkthrough of the public demo at <https://pbahethi.github.io/imrc-community-site/>. Everything you do is saved only in your own browser, and **Reset demo** puts it back the way it started. No real accounts, payments or messages are involved.

The screenshots come from a scripted browser run. The orange outline marks the control each step talks about.

## 1. Start here

The landing page explains the demo and asks a short survey about what would bring you back. Your answers stay in your browser.

![Landing page](how-to-use/01-landing.webp)

## 2. Join (demo profile)

**People → Create a new fictional member** opens the join form. Real sign-up will come with the planned secure backend; for now this creates a demo profile in your browser.

![Join form](how-to-use/02-join.webp)

## 3. Sign in

Choose **Demo sign in** (top right), pick a fictional member such as Rama, and select **Enter my profile**. No password is requested.

![Demo sign in](how-to-use/03-sign-in.webp)

## 4. My Community

The dashboard suggests next steps, people you may want to know, groups, and upcoming events.

![Dashboard](how-to-use/04-dashboard.webp)

## 5. Browse events and register

**Events** lists gatherings. Filter by month or saved events, then open one for its dates, a calendar download (.ics) and registration. On the IMRC Convention page, tick who will attend and save.

![Events](how-to-use/05-events.webp)
![Register a household](how-to-use/06-event-register.webp)

## 6. Find people

**People** searches the directory by name, roots, chapter or lineage.

![People search](how-to-use/07-people-search.webp)

## 7. Festival & holiday calendar

**Festivals & holidays** shows Hindu and Rajasthani festivals, Jain observances, Rajasthan fairs, U.S. federal holidays and Indian national holidays, each with its Hindi name.

- **Filter:** untick a category to hide it. The choice is remembered on this device.
- **Month view:** use **← Prev** and **Next →**. Click a coloured chip to jump to that day's description.
- **List view:** every date in order, grouped by month.
- **Tentative** dates are not yet confirmed by their source. Every date links to its source.
- **Subscribe:** add everything, or one category, to Google Calendar, Apple Calendar or Outlook, or download the `.ics` file.

Hindu and Jain dates follow the panchang for Washington, D.C. A tithi can fall on a different day in another city, so check your own city on drikpanchang.com before planning an event.

![Month view](how-to-use/08-calendar-month.webp)
![Filters](how-to-use/09-calendar-filter.webp)
![April 2027](how-to-use/10-calendar-april.webp)
![Festival detail](how-to-use/11-calendar-detail.webp)
![List view](how-to-use/12-calendar-list.webp)
![Subscribe](how-to-use/13-calendar-subscribe.webp)

On a phone, the month view collapses to just the days that have something on:

![Calendar on a phone](how-to-use/mobile-calendar.webp)

## 8. Marwar culture

**Marwar culture** is a photo album of Jodhpur and Marwar: Mehrangarh, the blue city, safas, Ghoomar and Kalbelia, kathputli, the camel fair, bandhani, dal baati and the Thar. Click a photo to open a larger version. **Photo credits** (also in the footer) lists the author, licence and source of each photo.

![Marwar culture](how-to-use/14-culture-hero.webp)
![Gallery](how-to-use/15-culture-gallery.webp)
![Photo credits](how-to-use/16-credits.webp)

## 9. Votes & polls

Committees can open a poll and members vote in the demo.

![Votes](how-to-use/17-votes.webp)

## 10. Reset

**Reset demo** (the tab on the right edge) clears everything this browser saved.

![Reset demo](how-to-use/18-reset.webp)

## For maintainers

- Run locally: `python3 -m http.server 8000`, then open <http://localhost:8000>.
- Tests: `node --test tests/*.test.cjs`.
- Calendar data lives in `observances.json`. After editing it, run `python3 scripts/build_observances.py` to regenerate `calendars/observances/*.ics`. Give every date a `source` URL and mark anything unconfirmed `"status": "tentative"`.
- Photo credits live in `marwar-photos.json`. Only add real photos with a free licence (CC0, CC BY, CC BY-SA or public domain), and keep the author, licence link and source.

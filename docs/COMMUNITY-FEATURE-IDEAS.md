# Feature ideas for the IMRC community site

Ideas only, nothing here is built yet. Ordered by value to a Marwari/Maheshwari cultural association against effort. Effort: **S** about a day, **M** a few days, **L** a week or more. Every option listed has a free tier or is open source. Anything holding member data needs the planned Supabase backend (P0 in the README) first, with privacy controls and moderation.

| # | Feature | Why members want it | Effort | Free options |
|---|---|---|---|---|
| 1 | **Events with real RSVP and reminders** | The main reason people open the site. Headcounts for food and venue. | M | Supabase (free tier) table + email via Supabase Auth or Resend free tier; or a Google Form per event linked from the event page as a stopgap (S) |
| 2 | **Announcements & newsletter** | One place for news instead of scattered WhatsApp forwards. | S–M | Static "News" page from Markdown in the repo; Buttondown or MailerLite free tiers for email |
| 3 | **WhatsApp / Telegram group directory** | Most activity already happens there; members need the right group per chapter, youth, seniors, sports. | S | Static list of invite links (show only after sign-in once auth exists, to limit spam) |
| 4 | **Festival pages (Gangaur, Teej, Diwali, Holi, Paryushan)** | Story, puja vidhi, songs, recipes, local celebration details and photos. Builds on the new calendar. | S each | Markdown pages + Wikimedia Commons photos |
| 5 | **Volunteer sign-up** | Every festival and convention needs help: food, decoration, parking, AV. | M | Supabase table with shift slots; SignUpGenius free tier or a Google Sheet as a stopgap |
| 6 | **Photo albums per event** | Members love seeing themselves and their kids after an event. | M | Google Photos shared albums or Flickr free links per event; Cloudflare R2 free tier if self-hosted. Needs consent and a takedown process |
| 7 | **Member directory with privacy controls** | Find families from your village or gotra, or near you. | L | Supabase Auth + row-level security (already drafted in the private repo's migration); per-field visibility: public, members only, hidden |
| 8 | **Hindi / Marwari language toggle** | Elders and new arrivals read Hindi more comfortably. | M | Static JSON string files per language; community volunteers translate; Noto Sans Devanagari via Google Fonts |
| 9 | **Donations** | Temple, scholarship, disaster relief, convention sponsorship. | S–M | Link to a registered nonprofit's Zeffy page (free to the organization) or PayPal Giving Fund; never handle card data on this site |
| 10 | **Youth (RAYS) and Sakhi/women's sections** | Mentoring, career talks, scholarships, sports leagues; women's programs and health camps. | M | Sections built on existing groups and mentorship pages |
| 11 | **Seniors' corner** | Large-text mode, satsang schedules, health camps, help with technology, rides to events. | M | CSS large-text toggle; carpool board on the help-offers feature |
| 12 | **Business directory** | Members want to support each other's businesses and find a CA, doctor or caterer. | M | Supabase table, member-submitted, moderated before publishing |
| 13 | **Matrimonial introductions (with caution)** | Long-standing community need, but highly sensitive. | L | Only with explicit opt-in, parent/self consent, verified members only, no public listing, moderation and reporting. Consider linking to an existing trusted service instead |
| 14 | **Scholarships & recognition** | Celebrate students and achievers; application deadlines. | S–M | Static pages + a form; spotlight feature already exists |
| 15 | **Community recipes & oral history** | Preserve dal baati, ker sangri, ghewar recipes and elders' migration stories. | M | Markdown submissions reviewed through PRs, or a moderated form |
| 16 | **Panchang widget for your city** | Tithi changes by location; members ask "is Karva Chauth today here?" | M | Compute locally with an open-source panchang library, or link to Drik Panchang per chapter city |

Suggested order: 3 and 4 first (cheap, immediately useful), then 2 and 1, then 5 and 6, then the backend-dependent items 7, 12 and 13.

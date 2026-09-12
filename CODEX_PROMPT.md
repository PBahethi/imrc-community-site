# Codex Build Prompt — Tree in the Forest Community Platform

## Role

Act as the principal software engineer, product engineer, security-minded architect, database designer, and UX implementer for a production-quality MVP called **Tree in the Forest**.

Your job is to build a web-first community operating system whose first strong “tree” is:

> **A trusted private directory of people + first-class relationships + groups + events + a community calendar.**

Do **not** build the entire long-term “forest” on day one. The architecture must support later branches such as scholarships, mentoring, matrimony, jobs, community assistance, cultural archives, philanthropy, and AI, but those are explicitly outside MVP scope unless required as extension points.

The application must be useful for cultural, ethnic, religious, professional, alumni, geographic, diaspora, and other affinity communities. It must be multi-organization-ready without turning into a generic public social network.

---

## 1. Product principles

Use these principles to resolve ambiguity:

1. **Trust before growth.** Member privacy, consent, moderation, and data ownership are product features.
2. **Relationships are first-class data.** Do not reduce the product to a contact table.
3. **Events activate the graph.** People, households, groups, organizations, and events should connect cleanly.
4. **Members own their profiles.** Administrators may govern access but should not silently appropriate member data.
5. **Private by default.** Sensitive fields must never be globally visible by default.
6. **Web first, app ready.** Deliver a responsive PWA-ready web experience with API boundaries that can later support iOS and Android.
7. **Progressive complexity.** Build the smallest coherent MVP and leave clean seams for future modules.
8. **No public scraping database.** Protect enumeration endpoints, private contact data, family data, children, documents, and bulk export.
9. **Shared digital commons.** Multiple organizations can participate while retaining their identity, branding, administrators, groups, and events.
10. Ask of every feature: **Does it strengthen a relationship between people, families, groups, organizations, events, places, knowledge, or culture?** If not, question whether it belongs.

---

## 2. MVP scope

Build the following end-to-end.

### Authentication

Support passwordless authentication with:

- Email magic link as the default MVP method.
- SMS OTP behind a feature flag/provider interface.
- Architecture that can add passkeys later without changing the user/person model.
- Session management, sign-out, expired-link handling, account recovery, and rate limiting.

Do not require passwords.

### Member profiles

Members can create and edit their own profile. Support at minimum:

- first, middle, last, preferred/display name
- profile photo
- primary email and mobile
- address: street, city, state/province, postal code, country
- ancestral home: locality/village/city, state/province, country, free-form family origin
- college/university, degree, graduation year
- company, title, profession, industry
- short bio, professional bio, skills, interests, community involvement
- marital status, optional sex/gender field
- languages spoken/understood
- cultural interests and optional religious tradition
- dietary preferences/restrictions
- hobbies and optional favorites such as food, sport, music, books, travel, animal, color, holiday
- optional pets
- optional document uploads such as résumé/professional biography

Keep structured profile data distinct from uploaded documents.

### Field-level privacy

At minimum support these visibility levels:

- `PUBLIC`
- `COMMUNITY`
- `CONNECTIONS`
- `PRIVATE`

Design the model so organization-scoped visibility can be added later.

Apply especially careful defaults to:

- street/home address
- phone
- date of birth
- family relationships
- child records
- religion/tradition
- dietary restrictions/allergies
- documents
- matrimonial data if ever added later

The authorization layer, not just the UI, must enforce visibility.

### Directory and discovery

Authenticated members can:

- browse/search the community directory
- search by name
- filter by city/region, ancestral home, college, company/profession, language, and group where privacy permits
- see profile cards and profile pages
- discover “people you may know” using explainable deterministic signals in MVP, not AI
- see people sharing hometown, college, profession, group, or event participation when permitted

Protect search from bulk harvesting. Paginate all directory results. Add throttling and audit-relevant events for suspicious enumeration.

### Relationship graph

Model person-to-person relationships as records, not columns.

Support types including:

- parent / child
- spouse / partner
- sibling
- grandparent / grandchild
- relative
- friend
- buddy
- mentor / mentee
- colleague
- classmate
- teammate

Requirements:

- relationship type taxonomy
- directional/symmetric semantics
- requested/pending/accepted/rejected states where appropriate
- source/creator
- timestamps
- privacy
- ability to represent relationships to invited/unclaimed people later
- inverse relationship handling without duplicating inconsistent application logic

Family-tree rendering should be a view over the same relationship data, not a separate family-tree database.

### Groups

Build community groups with:

- group name, description, type, privacy
- owners/admins
- members and membership roles
- group page
- member list
- group events
- simple announcements

Examples include college classmates, tennis, golf, parents, young professionals, seniors, neighborhood, book club, religious, cultural, professional, and travel groups.

Discussions/photos can be minimal stubs or extension points; do not build a full social feed.

### Organizations

Support organizations as first-class tenants/participants without requiring full SaaS multi-tenancy complexity.

Each organization can have:

- name
- slug
- description
- logo/branding metadata
- admins
- members
- groups
- events

A person may belong to multiple organizations.

### Events

Build organizer-managed events with:

- name, description, category
- start/end date-time and timezone
- venue/location and map coordinates
- organizer organization/group/person
- contact
- capacity
- registration open/close dates
- cost metadata; no payment processing required in MVP
- dress code
- agenda
- sponsors text/links
- photos/documents
- visibility
- status: draft/published/cancelled/completed

### Event registration

Members can:

- RSVP/register
- cancel
- set party size
- add family members/guests
- indicate children where appropriate
- join a waitlist
- receive confirmation/reminders
- add an event to their personal calendar

Registration connects a person to an event. Do not encode attendance as a text list on the event.

### Event logistics

Treat logistics as structured data. Support optional fields for:

- transportation mode
- carpool interest/offer
- shuttle/airport pickup need
- lodging choice/assistance need
- accessibility/mobility accommodations
- dietary needs
- childcare request
- other accommodations
- volunteer roles: setup, registration, transportation, food, photography, cleanup, operations, other

Logistics fields can contain sensitive information; visibility must be limited to the member and authorized event organizers.

### Agenda

Support organizer-editable event agenda items with:

- start/end time
- title/activity
- description
- location/room
- speaker/owner optional
- display order

### Calendar

Build a consolidated community calendar with:

- month view
- list view
- mobile-friendly agenda view
- filters by organization, group, location, event type/category, and audience tags
- links to event pages
- calendar export/download using ICS

Map view may be an MVP+ feature if it risks the 90-day target, but schema must support coordinates.

### “My Community” dashboard

After sign-in show:

- people you know
- people you may know
- new members
- shared hometown/college/profession suggestions
- family/relationships summary
- groups
- upcoming registered events
- recommended nearby/relevant community events using non-AI rules
- calendar preview
- “ways to help / people who can help” as a future-ready placeholder unless a lightweight skills/help field is already available

---

## 3. Explicit non-goals for MVP

Do not implement these as full modules now:

- matrimony/dating
- scholarships
- job board
- marketplace
- fundraising/payments
- immigration/legal/medical case management
- genealogy research engine
- chat/messaging platform
- generic social news feed
- AI recommendations or LLM chat
- native iOS/Android applications
- advanced Cvent-equivalent conference features

Create clean extension points only.

---

## 4. Recommended architecture

Use a pragmatic TypeScript-first architecture unless the existing repository already establishes another coherent stack.

### Default stack

- **Frontend:** Next.js with TypeScript, React, App Router, server components where useful, accessible client components where interaction requires them.
- **UI:** Tailwind CSS plus a small accessible component system such as shadcn/ui/Radix primitives. Keep styling community-neutral and themeable.
- **Backend/API:** Next.js route handlers/server actions for MVP, with domain/service boundaries that can later be exposed to mobile clients. Prefer a versioned REST-style API under `/api/v1` for mobile-relevant capabilities.
- **Database:** PostgreSQL.
- **ORM:** Prisma or Drizzle; choose one and use it consistently. Prefer migrations checked into Git.
- **Auth:** Supabase Auth or a similarly mature passwordless provider supporting email magic links and phone OTP. If Supabase is selected, use its Postgres/Storage capabilities where they reduce operational burden.
- **Storage:** private object storage for photos/documents, signed URLs for access.
- **Search:** PostgreSQL full-text/trigram search first. Do not add Elasticsearch/Algolia until scale justifies it.
- **Geo:** PostGIS-compatible columns if available; otherwise latitude/longitude now with a clean future PostGIS migration path.
- **Maps:** MapLibre GL with OpenStreetMap-compatible tiles/provider abstraction. Do not hard-code provider credentials into the client repository.
- **Email:** provider abstraction, defaulting to Resend/Postmark-style transactional email.
- **SMS:** Twilio-style provider abstraction, disabled unless configured.
- **Analytics:** privacy-conscious product analytics. Avoid sending sensitive profile data to analytics vendors.
- **Observability:** structured application logs, error reporting, request IDs.
- **Testing:** Vitest/Jest for units, Playwright for end-to-end flows.
- **Deployment:** Vercel + managed Postgres/Supabase is acceptable for MVP. Document an alternative container deployment path.

Do not add microservices, Kafka, a graph database, Kubernetes, or a separate search cluster for MVP.

### Graph strategy

Use PostgreSQL as the system of record for the community graph. The `relationships` table is the edge table. Recursive CTEs or application-level graph traversal are sufficient for MVP family-tree views and connection discovery.

A graph database may be evaluated later only if real query complexity or scale proves PostgreSQL insufficient.

---

## 5. Domain model

At minimum create normalized entities equivalent to:

- `User`
- `Person`
- `Profile`
- `Address`
- `PersonPrivacySetting` or generalized `FieldVisibility`
- `Family` or `Household` if needed for shared registration/household grouping
- `Relationship`
- `RelationshipType`
- `Organization`
- `OrganizationMembership`
- `Group`
- `GroupMembership`
- `Event`
- `EventRegistration`
- `EventGuest`
- `EventLogistics`
- `EventAgendaItem`
- `Photo`
- `Document`
- `Notification`
- `AuditLog`
- `ConsentRecord`

You may introduce additional join tables where normalization requires them.

### Important modeling rules

- `User` is authentication identity/account state.
- `Person` is the community person/node.
- Do not force `User.id == Person.id` even if one-to-one for most claimed profiles.
- Allow future unclaimed/invited `Person` records without a login account.
- Addresses must be separate records because home address, ancestral home, organization venues, and event locations have different semantics and privacy.
- Relationship edges reference people and type, with status and privacy metadata.
- Groups and organizations use membership join tables.
- Event registrations use a join/entity table with state and timestamps.
- Event guests are structured records rather than a single integer when names/relationships are supplied.
- Event logistics should not be placed in generic profile fields.
- Documents/photos store metadata and object-storage keys, not blobs in PostgreSQL.
- Add soft-delete/status fields where appropriate, but do not use soft delete as a substitute for actual privacy/account-deletion workflows.
- Use UTC in storage and explicit IANA timezone IDs for events.

---

## 6. Seed workbook

A seed workbook is supplied as:

`ramayana_tree_in_forest_directory(1).xlsx`

Its sheets are:

- `README`
- `Profiles` — 44 demo community members
- `Relationships` — relationship-edge seed data
- `Events` — demo events
- `Event Registrations` — person-to-event seed records and basic logistics
- `Data Model` — conceptual seed model

Important:

- The workbook explicitly describes US addresses, emails, phones, colleges, companies, and preferences as synthetic demonstration data.
- Treat the Ramayana dataset as a **demo fixture**, not as production claims.
- Preserve source/note fields where the workbook flags tradition-dependent relationships.
- Never present synthetic addresses/contact details as historical facts.

### Seed implementation

Create an idempotent import/seed pathway that maps the workbook into the normalized schema.

Preferred approach:

1. Place/copy the workbook under `data/seed/` if available to the agent.
2. Add a script such as `scripts/import-ramayana-seed.ts`.
3. Parse the workbook using a maintained XLSX package.
4. Upsert by stable external seed keys such as `RAM-001`, `REL-001`, `EV001`, `REG-001`.
5. Store seed-source metadata so demo records are identifiable.
6. Validate referential integrity before committing the transaction.
7. Produce a clear report of created/updated/skipped/error records.
8. Make the script safe to run repeatedly.

The production app must work without this demo dataset.

---

## 7. Authorization and privacy architecture

Implement authorization centrally.

Roles should include at least:

- `MEMBER`
- `GROUP_ADMIN`
- `ORGANIZATION_ADMIN`
- `PLATFORM_ADMIN`

Do not rely on role alone. Authorization decisions may depend on:

- ownership
- organization membership
- group membership
- accepted connection relationship
- event organizer rights
- per-field visibility
- consent
- age/minor status where applicable

Create reusable policy functions such as:

- `canViewPerson(viewer, person)`
- `canViewField(viewer, person, field)`
- `canEditProfile(actor, person)`
- `canManageGroup(actor, group)`
- `canManageEvent(actor, event)`
- `canViewEventRegistration(actor, registration)`
- `canViewDocument(actor, document)`

All server/API responses must be filtered through these policies.

For children/minors:

- default records to private/restricted
- avoid exposing birth dates, contact details, addresses, school information, or precise location
- require an appropriate guardian/administrator workflow before a child profile becomes independently claimable
- design for configurable age thresholds by jurisdiction; do not hard-code legal claims into UI copy

---

## 8. UX and information architecture

Primary desktop navigation:

- Home / My Community
- People
- Family & Connections
- Groups
- Events
- Calendar
- Organizations
- My Profile
- Settings

Mobile navigation should prioritize:

- Home
- People
- Events
- Groups
- Profile/menu

### Core screens

Implement:

1. landing/sign-in
2. magic-link sent / OTP screens
3. onboarding wizard
4. My Community dashboard
5. directory/search
6. profile detail
7. edit profile + privacy controls
8. relationship requests/management
9. family/relationship visualization
10. groups index/detail/create/edit
11. organization detail
12. events index/detail/create/edit
13. RSVP/registration + logistics
14. registration confirmation
15. event attendee view respecting privacy
16. calendar
17. settings/data/privacy
18. admin basics for organization/group/event moderation

### Family/relationship visualization

Use an accessible graph/tree UI that works on desktop and degrades to a readable relationship list on mobile. The textual list is required even if a visual graph exists.

Do not make the graph visualization a blocker for CRUD functionality.

---

## 9. Event page design

The public-within-community event experience should feel like **Evite simplicity + Cvent structure + community context**.

Organize the page around:

- event name
- date/time/timezone
- venue/map
- prominent RSVP button/status
- organizer
- who is coming, only where attendees permit it
- agenda
- transportation
- lodging
- food/dietary
- accessibility/special accommodations
- volunteering
- contacts
- documents/photos
- sponsors
- calendar action

Event organizers see private operational logistics in a separate organizer view. Do not expose attendees’ accessibility or dietary details to other attendees.

---

## 10. Notifications

Build a notification abstraction supporting:

- in-app notification records
- email
- SMS later/when configured
- mobile push later

MVP notification triggers:

- authentication link/OTP
- connection request/acceptance
- group invitation or membership approval
- event invitation
- registration confirmation
- registration cancellation
- waitlist promotion
- event update
- event reminder

Implement notification preferences and unsubscribe rules for non-essential communications.

---

## 11. Security requirements

At minimum:

- TLS-only deployment
- encrypted managed database/storage
- HTTP security headers
- CSRF protection where relevant to the chosen framework/auth method
- secure cookies/session settings
- server-side authorization
- input validation with a schema library such as Zod
- file type/size restrictions and malware-scanning integration point
- private buckets + signed object access
- rate limiting for auth, search, invitations, and enumeration-prone endpoints
- no secrets in source control
- audit logs for admin access, privacy changes, relationship moderation, exports, and deletion actions
- abuse reporting/moderation primitives
- data export workflow
- account deletion workflow
- backup/recovery documentation
- consent records for sensitive/optional data where appropriate

Never log OTPs, magic-link tokens, full street addresses, dietary medical details, document contents, or other sensitive values in application logs.

---

## 12. API design

Create `/api/v1` endpoints or equivalent domain interfaces for mobile-ready capabilities.

At minimum cover:

- `/me`
- `/people`
- `/people/:id`
- `/people/:id/relationships`
- `/relationships`
- `/groups`
- `/groups/:id/members`
- `/organizations`
- `/events`
- `/events/:id`
- `/events/:id/register`
- `/events/:id/registrations/me`
- `/calendar`
- `/notifications`

Use cursor pagination where practical. Define stable request/response schemas. Do not return hidden fields and expect the client to hide them.

Generate OpenAPI documentation if reasonable without adding major complexity.

---

## 13. Development workflow

Before coding:

1. Inspect the repository and preserve any sound existing conventions.
2. Read the product requirements and this prompt fully.
3. Identify the smallest vertical slice that proves auth → profile → directory → relationship → event → RSVP.
4. Produce or update `README.md` with setup instructions.
5. Add `.env.example` without secrets.
6. Create migrations before seed data.

Then work in coherent increments. Prefer completing working vertical slices to creating many disconnected stubs.

### Suggested implementation order

1. project skeleton, lint, typecheck, tests
2. database schema/migrations
3. auth/session
4. onboarding/profile + privacy policies
5. directory/search
6. relationships + family view
7. organizations/groups
8. events/agenda
9. registration/logistics/waitlist
10. calendar/ICS
11. notifications
12. audit/admin basics
13. Ramayana seed importer
14. responsive/PWA polish
15. security/test hardening

---

## 14. Acceptance criteria

The MVP is not complete until the following work in a fresh development environment.

### Authentication

- A new user can request a magic link and sign in.
- Expired/invalid auth flows are handled safely.
- The same authenticated user reaches the same person/profile after returning.

### Profile/privacy

- A member can create/edit their profile.
- Different fields can have different privacy levels.
- A second user cannot retrieve private fields through page HTML, API, server action, or direct URL guessing.

### Directory

- Authenticated members can search and filter permitted profiles.
- Pagination works.
- Sensitive fields are not returned unless authorized.

### Relationships

- A member can create/request a supported relationship.
- Acceptance is required where configured.
- Inverse semantics render correctly.
- A family view can display parent/spouse/child edges from the same relationship table.

### Groups/organizations

- Members can join or be added according to group rules.
- Admin permissions are enforced server-side.
- Group events render on the group page/calendar.

### Events

- An organizer can create, edit, publish, cancel, and update an event.
- Agenda items can be edited independently.
- A member can register/cancel.
- Capacity and waitlist logic behave predictably.
- Guests/family attendees can be represented.
- Logistics are visible to authorized organizers but not ordinary attendees.
- ICS export works.

### Seed data

- The Ramayana seed script imports the workbook idempotently.
- Relationship/event references are validated.
- Synthetic/demo records are clearly marked.

### Quality

- Typecheck passes.
- Lint passes.
- Unit/integration tests pass.
- Playwright covers at least auth mock/dev flow, profile/privacy, directory, relationship, event RSVP.
- Critical mobile screens work at narrow viewport sizes.
- Basic accessibility checks pass for labels, keyboard navigation, dialogs, form errors, and contrast.

---

## 15. Testing priorities

Write tests around authorization and graph/event invariants before visual polish.

High-priority tests:

- field visibility matrix
- owner vs connection vs community member vs anonymous behavior
- child/minor default restrictions
- relationship inverse mapping
- symmetric relationship behavior
- duplicate relationship prevention
- group/org admin boundaries
- event capacity race conditions
- waitlist promotion
- registration cancellation
- event timezone/ICS correctness
- private logistics access
- seed-import referential integrity
- search not leaking hidden fields

---

## 16. 90-day delivery framing

Design the repository so a small product team can deliver in roughly 90 days.

### Days 1–30 — Foundation + Tree trunk

- design system
- auth
- schema/migrations
- privacy/policies
- onboarding/profile
- directory/search
- initial relationship CRUD

### Days 31–60 — Tree branches + Gathering

- family/connection views
- organizations/groups
- events
- agenda
- RSVP/guests/waitlist
- logistics
- transactional notifications

### Days 61–90 — Calendar + hardening + launch

- consolidated calendar/ICS
- dashboard
- Ramayana demo seed
- admin/moderation basics
- mobile/PWA polish
- analytics/observability
- security review
- accessibility
- tests
- backup/recovery/runbook
- launch documentation

Prefer reducing optional visual complexity over compromising authorization, privacy, data integrity, or event registration reliability.

---

## 17. Future “forest” extension points

Document but do not fully implement modules for:

- scholarship/application programs
- mentoring matches
- jobs/careers/business directory
- matrimony with separate consent/privacy domain
- births/weddings/graduations/retirements/bereavement
- community assistance/resources
- language/culture/religion/traditions
- ancestral-place/diaspora projects
- historical archives/oral histories
- philanthropy/volunteering
- AI-powered community search and recommendations

These should attach to the same person/group/organization/event graph through new domain entities rather than forcing a rewrite.

---

## 18. Repository deliverables

Produce a repository containing at minimum:

```text
README.md
.env.example
package.json
src/
  app/
  components/
  domain/
  lib/
  policies/
  services/
  api/ or app/api/
prisma/ or db/
  schema/migrations
scripts/
  import-ramayana-seed.ts
data/
  seed/
    ramayana_tree_in_forest_directory.xlsx   # if supplied/copied locally
tests/
  unit/
  e2e/
docs/
  architecture.md
  privacy-model.md
  data-model.md
  governance.md
```

Adjust layout to the selected framework but preserve clear domain/policy boundaries.

---

## 19. Documentation requirements

The repository README must explain:

- what the product is
- the tree/forest concept
- MVP vs future scope
- architecture
- local setup
- environment variables
- database migration/seed instructions
- Ramayana demo dataset caveat
- testing
- deployment
- security/privacy model
- contribution expectations

Also create concise architecture/data-model/privacy documents if the repository does not already contain equivalent documentation.

---

## 20. Working style for Codex

Do not merely produce an architecture essay. **Implement the repository.**

When existing code is present:

- inspect before changing
- reuse sound patterns
- avoid needless rewrites
- keep migrations safe
- preserve unrelated functionality

When a decision is uncertain, choose the simplest solution consistent with privacy, security, and future mobile/API needs, and record the decision in documentation.

Do not fabricate successful tests, migrations, provider credentials, or deployment results. Run what can be run locally and report exact failures that remain.

At the end, provide:

1. concise summary of what was implemented
2. repository/file changes
3. database migrations created
4. test/lint/typecheck results
5. environment/config still required
6. remaining MVP gaps
7. top five next engineering tasks

The finished MVP should make this statement true:

> **A member can join easily, create a privacy-controlled identity, find people, connect those people through meaningful relationships and groups, gather through events, and see those gatherings on a shared community calendar.**

That is the first tree. Build it exceptionally well before growing the forest.

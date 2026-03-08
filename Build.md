# Project Echo — First Build Roadmap (MVP)

> **Goal**: Deliver a functional MVP where **Seekers** can anonymously access support sessions and journal, and **Volunteers** can onboard and be matched — all built on Lovable Cloud.

---

## Current State (v0.1 — Landing Page)

| Area | Status |
|------|--------|
| Design system (colors, typography, tokens) | ✅ Done |
| Static landing page (Hero, Flywheel, Principles, Footer) | ✅ Done |
| Button variants (hero, hero-outline, echo-pill) | ✅ Done |
| Auth / Database / Routing | 🔴 Not started |
| All 10 PRD modules (M-01 → M-10) | 🔴 Not started |
| Volunteer Value Architecture | 🔴 Not started |
| i18n / RTL | 🔴 Not started |
| Mobile nav / Dark mode toggle | 🟡 Stubbed |

---

## MVP Scope (Phases 1–5)

### Phase 1 — Foundation & Infrastructure
**Priority: P0 · Estimate: 1 session**

| # | Task | PRD Ref | Details |
|---|------|---------|---------|
| 1.1 | Enable Lovable Cloud | — | Database, auth, edge functions |
| 1.2 | Auth system (anonymous + email) | M-01 | Anonymous registration with generated alias; optional email upgrade |
| 1.3 | Role-based routing | M-01 | Seeker vs Volunteer vs Admin roles; `user_roles` table with RLS |
| 1.4 | App shell & navigation | UI-Nav | Bottom tab bar (Seeker: Home, Cocoon, Journal, Community, Profile) · Sidebar (Volunteer/Admin) |
| 1.5 | Mobile hamburger menu | UI-Nav | Landing page responsive nav |

**Deliverable**: Users can register anonymously, log in, and see role-appropriate navigation.

---

### Phase 2 — Seeker Onboarding & Profile
**Priority: P0 · Estimate: 1 session**

| # | Task | PRD Ref | Details |
|---|------|---------|---------|
| 2.1 | Welcome screens | M-02 | 3-step onboarding carousel (safety, anonymity, how it works) |
| 2.2 | Language selection | M-02 | EN, FR, SW, AR, PT — stored in profile; sets UI locale |
| 2.3 | Cultural context capture | M-02 | Optional cultural background for matching |
| 2.4 | Goal setting | M-02 | Select healing goals (coping, grief, anxiety, etc.) |
| 2.5 | Seeker profile (anonymous) | M-01 | Avatar generator, alias, preferences, safety plan link |

**Deliverable**: Complete seeker first-run experience from landing → onboarded home screen.

---

### Phase 3 — Cocoon Sessions (Core Loop)
**Priority: P0 · Estimate: 2 sessions**

| # | Task | PRD Ref | Details |
|---|------|---------|---------|
| 3.1 | Session request flow | M-03 | Seeker submits request: topic, urgency, language, preferences |
| 3.2 | Volunteer matching | M-03 | Algorithm matches by language, specialisation, availability |
| 3.3 | Real-time chat (text) | M-03 | Encrypted 1:1 messaging within a Cocoon session |
| 3.4 | Session lifecycle | M-03 | States: requested → matched → active → wrap-up → closed |
| 3.5 | Post-session feedback | M-03 | Seeker rates session (emotional scale, not stars); volunteer self-reflection |
| 3.6 | Safety guardrails | M-04 | Crisis keyword detection → escalation prompt; emergency resources banner |

**Deliverable**: End-to-end support session from request to completion with basic safety net.

---

### Phase 4 — Healing Journal (M-09)
**Priority: P1 · Estimate: 1 session**

| # | Task | PRD Ref | Details |
|---|------|---------|---------|
| 4.1 | Journal entry CRUD | M-09 | Free-form text entries with timestamps |
| 4.2 | Mood indicators | M-09 | Emoji/color mood selector per entry |
| 4.3 | Tags & categories | M-09 | User-defined tags; suggested tags from goals |
| 4.4 | Milestone tracker | M-09 | Visual progress markers on healing timeline |
| 4.5 | Private by default | M-09 | All entries encrypted at rest; no volunteer/admin access |

**Deliverable**: Seekers have a private, functional journaling space tied to their healing journey.

---

### Phase 5 — Volunteer Onboarding & Hub
**Priority: P1 · Estimate: 1–2 sessions**

| # | Task | PRD Ref | Details |
|---|------|---------|---------|
| 5.1 | Volunteer registration | M-06 | Email sign-up, background info, motivation statement |
| 5.2 | Training module shell | M-06, VVA | Training checklist; mark modules complete (content can be placeholder) |
| 5.3 | Availability scheduler | M-06 | Weekly availability grid stored in DB |
| 5.4 | Volunteer dashboard | M-06 | Upcoming sessions, hours logged, active matches |
| 5.5 | Impact Portfolio (basic) | VVA | Session count, hours, skills endorsed — auto-generated |
| 5.6 | CPD log (basic) | VVA | Log training hours; simple certificate generation |

**Deliverable**: Volunteers can register, set availability, see matched sessions, and track their impact.

---

## Post-MVP (Backlog)

These are **not** in scope for the first build but are documented for planning:

| Module | PRD Ref | Description |
|--------|---------|-------------|
| Community Circles | M-05 | Group support sessions, moderated forums |
| Clinical Oversight Dashboard | M-07 | Supervisor review, session auditing, risk flags |
| Analytics & Reporting | M-08 | Platform-wide metrics, volunteer performance |
| AI Companion (Triage) | M-10 | AI-assisted initial assessment before volunteer matching |
| Revenue Engine | VVA | Freemium tiers, institutional licensing, API access |
| Full i18n + RTL | UI | Arabic RTL layout, dynamic language switching |
| Accessibility audit | UI | WCAG 2.1 AA compliance pass |
| Dark mode | UI | Full dark theme with toggle |
| Push notifications | Infra | Session reminders, journal prompts |
| Offline support | Infra | PWA with offline journal access |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Lovable Cloud (Supabase) | Zero-config; DB + Auth + Edge Functions + Storage |
| Auth | Anonymous-first + email upgrade | PRD M-01 anonymity requirement |
| Realtime | Supabase Realtime | Built-in; needed for Cocoon chat |
| Roles | `user_roles` table + `has_role()` RLS | Security best practice; no client-side role checks |
| State | React Query + Context | Already installed; sufficient for MVP |
| Routing | React Router v6 | Already installed; role-guarded routes |
| Styling | Tailwind + shadcn/ui + Echo tokens | Already configured |

---

## Definition of Done (MVP)

- [ ] Seeker can register anonymously, complete onboarding, and land on home screen
- [ ] Seeker can request and complete a text-based Cocoon session with a matched volunteer
- [ ] Seeker can create, edit, and delete private journal entries with mood tracking
- [ ] Volunteer can register, set availability, and accept session matches
- [ ] Volunteer can view basic Impact Portfolio (hours, sessions, skills)
- [ ] Crisis keywords trigger safety escalation prompt
- [ ] All data access governed by RLS policies
- [ ] Mobile-responsive across all screens
- [ ] Landing page CTAs route to functional auth flows

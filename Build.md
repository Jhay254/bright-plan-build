# Project Echo — First Build Roadmap (MVP)

> **Goal**: Deliver a functional MVP where **Seekers** can anonymously access support sessions and journal, and **Volunteers** can onboard and be matched — all built on Lovable Cloud.

---

## Current State (v0.5 — MVP Feature-Complete)

| Area | Status |
|------|--------|
| Design system (colors, typography, tokens) | ✅ Done |
| Static landing page (Hero, Flywheel, Principles, Footer) | ✅ Done |
| Button variants (hero, hero-outline, echo-pill) | ✅ Done |
| Auth (anonymous + email) | ✅ Done |
| Role-based routing (seeker/volunteer/admin) | ✅ Done |
| Database schema & RLS policies | ✅ Done |
| App shell & bottom tab navigation | ✅ Done |
| Seeker onboarding (welcome, language, goals) | ✅ Done |
| Cocoon sessions (request, matching, chat, feedback) | ✅ Done |
| Safety guardrails (crisis detection, emergency banner) | ✅ Done |
| Healing Journal (CRUD, mood, tags, milestones) | ✅ Done |
| Volunteer registration & dashboard | ✅ Done |
| Training checklist | ✅ Done |
| Availability scheduler | ✅ Done |
| Impact Portfolio & CPD log | ✅ Done |
| Community Circles | 🔴 Post-MVP |
| i18n / RTL | 🔴 Post-MVP |
| Dark mode toggle | 🟡 Stubbed |

---

## MVP Scope (Phases 1–5)

### Phase 1 — Foundation & Infrastructure ✅
**Priority: P0 · Status: COMPLETE**

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 1.1 | Enable Lovable Cloud | — | ✅ Done |
| 1.2 | Auth system (anonymous + email) | M-01 | ✅ Done |
| 1.3 | Role-based routing | M-01 | ✅ Done |
| 1.4 | App shell & navigation | UI-Nav | ✅ Done |
| 1.5 | Mobile hamburger menu | UI-Nav | ✅ Done |

---

### Phase 2 — Seeker Onboarding & Profile ✅
**Priority: P0 · Status: COMPLETE**

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 2.1 | Welcome screens | M-02 | ✅ Done |
| 2.2 | Language selection | M-02 | ✅ Done |
| 2.3 | Cultural context capture | M-02 | ✅ Done |
| 2.4 | Goal setting | M-02 | ✅ Done |
| 2.5 | Seeker profile (anonymous) | M-01 | ✅ Done |

---

### Phase 3 — Cocoon Sessions (Core Loop) ✅
**Priority: P0 · Status: COMPLETE**

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 3.1 | Session request flow | M-03 | ✅ Done |
| 3.2 | Volunteer matching | M-03 | ✅ Done (`volunteer_accept_session` RPC) |
| 3.3 | Real-time chat (text) | M-03 | ✅ Done (Realtime enabled) |
| 3.4 | Session lifecycle | M-03 | ✅ Done (`transition_session` state machine) |
| 3.5 | Post-session feedback | M-03 | ✅ Done (emotional scale + reflection) |
| 3.6 | Safety guardrails | M-04 | ✅ Done (crisis keyword detection + banner) |

---

### Phase 4 — Healing Journal (M-09) ✅
**Priority: P1 · Status: COMPLETE**

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 4.1 | Journal entry CRUD | M-09 | ✅ Done |
| 4.2 | Mood indicators | M-09 | ✅ Done (8 moods with emoji/color) |
| 4.3 | Tags & categories | M-09 | ✅ Done (user-defined + goal-suggested) |
| 4.4 | Milestone tracker | M-09 | ✅ Done (visual markers + filtering) |
| 4.5 | Private by default | M-09 | ✅ Done (RLS: owner-only access) |

---

### Phase 5 — Volunteer Onboarding & Hub ✅
**Priority: P1 · Status: COMPLETE**

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 5.1 | Volunteer registration | M-06 | ✅ Done (motivation, background, specialisations) |
| 5.2 | Training module shell | M-06, VVA | ✅ Done (7 modules with progress tracking) |
| 5.3 | Availability scheduler | M-06 | ✅ Done (2-hour block grid, 6am–10pm) |
| 5.4 | Volunteer dashboard | M-06 | ✅ Done (active sessions, stats, tabs) |
| 5.5 | Impact Portfolio (basic) | VVA | ✅ Done (auto-generated stats + skills) |
| 5.6 | CPD log (basic) | VVA | ✅ Done (hour logging + certificate generation) |

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

- [x] Seeker can register anonymously, complete onboarding, and land on home screen
- [x] Seeker can request and complete a text-based Cocoon session with a matched volunteer
- [x] Seeker can create, edit, and delete private journal entries with mood tracking
- [x] Volunteer can register, set availability, and accept session matches
- [x] Volunteer can view basic Impact Portfolio (hours, sessions, skills)
- [x] Crisis keywords trigger safety escalation prompt
- [x] All data access governed by RLS policies
- [x] Mobile-responsive across all screens
- [x] Landing page CTAs route to functional auth flows

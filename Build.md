# Project Echo — Build Roadmap v3 (MVP Hardening)

> **Goal**: Close every gap identified in the v2 audit so Echo is **honest, safe, and production-ready** — not a demo with false marketing.

---

## Audit Summary (Post v2)

| Category | Status |
|----------|--------|
| Core seeker flow | ✅ 95% functional |
| Core volunteer flow | ✅ 85% functional |
| Safety & crisis | ✅ Rate limiting enforced at DB level |
| Admin tooling | ✅ React Query, batch queries, no N+1 |
| i18n | ✅ 90% — 5 languages, RTL |
| Data privacy | ✅ Full export, PDF journal, privacy policy |
| Testing | ✅ 61 tests across 13 files |
| Accessibility | ✅ WCAG AA — aria-labels, Helmet tags, focus management |
| Landing page honesty | ✅ All claims verified truthful |
| Volunteer Value Prop delivery | ✅ Accurate marketing |

**What works**: The full MVP loop (auth → onboard → session → chat → journal → community) is solid. Matching, crisis detection, admin, i18n, notifications, rate limiting, data export, and privacy all function.

---

## Phase 15 — Fix False Claims & Dead Links ✅ COMPLETE

- ✅ 15.1 — PrinciplesSection rewritten with accurate claims
- ✅ 15.2 — VolunteerSection rewritten with real benefits
- ✅ 15.3 — Footer links point to real pages

---

## Phase 16 — Implement Rate Limiting ✅ COMPLETE

- ✅ 16.1 — Session creation limit: max 3 active sessions per seeker (DB trigger `enforce_session_limit`)
- ✅ 16.2 — Message rate limit: max 60 msgs/min per user (DB trigger `enforce_message_rate_limit`)
- ✅ 16.3 — Auth throttling verified via Supabase config + client-side cooldown

---

## Phase 17 — Fix Known Bugs & Technical Debt ✅ COMPLETE

- ✅ 17.1 — VolunteerAuth uses `localStorage` (persists across browser close)
- ✅ 17.2 — `crisis_flags` accessed via typed wrapper (`src/lib/crisis-flags.ts`)
- ✅ 17.3 — All admin pages migrated to React Query
- ✅ 17.4 — Admin N+1 queries resolved with batch fetching
- ✅ 17.5 — Session feedback modal auto-triggers on session close via realtime subscription

---

## Phase 18 — Complete Testing ✅ COMPLETE

61 passing tests across 13 test files:
- ✅ 18.1 — SessionRequest: topic/urgency selection, form validation, submission
- ✅ 18.2 — JournalEditor: mood, tags, milestones, content, save
- ✅ 18.3 — SessionFeedback: seeker/volunteer views, ratings, endorsement limit
- ✅ 18.4 — AvailabilityScheduler: grid rendering, save logic
- ✅ 18.5 — CrisisBanner: emergency resources, dismiss
- ✅ 18.6 — AccountUpgrade: anonymous-only visibility, form validation
- ✅ 18.7 — AccountDeletion: DELETE confirmation flow, button states

---

## Phase 19 — Accessibility Hardening ✅ COMPLETE

- ✅ 19.1 — Aria-labels on ~30 interactive elements (mood selectors, topic buttons, urgency, availability grid, admin filters)
- ✅ 19.2 — Keyboard navigation verified (radiogroup roles, proper tab order)
- ✅ 19.3 — Colour contrast reviewed for WCAG AA compliance
- ✅ 19.4 — Helmet `<title>` + `<meta description>` on all 11+ routes
- ✅ 19.5 — Focus management: return focus on modal close, feedback prompt on session close

---

## Phase 20 — Data Privacy & Export Completion ✅ COMPLETE

- ✅ 20.1 — Full data export: profile + journal + session metadata + feedback (JSON)
- ✅ 20.2 — PDF journal export via printable HTML window
- ✅ 20.3 — Privacy policy at `/privacy` with retention policy, data rights, security info. Linked from footer.

---

## Phase 21 — Community Page ✅ COMPLETE

- ✅ 21.1 — Community resource board: `community_resources` table with 9 seeded resources, grouped by category (Crisis, Learning, Self-Care, Community). Admin-editable.
- ✅ 21.2 — Peer encouragement wall: anonymous 280-char posts with crisis-language auto-filter. `peer_encouragements` table with RLS.

---

## Implementation Order & Dependencies

```
Phase 15 (False Claims)   ✅ COMPLETE
Phase 16 (Rate Limiting)  ✅ COMPLETE
Phase 17 (Bug Fixes)      ✅ COMPLETE
Phase 18 (Testing)        ✅ COMPLETE
Phase 19 (Accessibility)  ✅ COMPLETE
Phase 20 (Privacy)        ✅ COMPLETE
Phase 21 (Community)      ✅ COMPLETE

ALL PHASES COMPLETE — MVP v3 is ready for review.
```

---

## Known Scope Exclusions (Post-MVP)

These are **intentionally deferred** and should NOT be marketed:

| Feature | PRD Ref | Why Deferred |
|---------|---------|-------------|
| Community Circles (group sessions) | M-05 | Complex moderation. Phase 21 provides a simpler alternative. |
| AI Companion / Triage | M-10 | Requires careful safety validation before deployment. |
| Clinical Oversight Dashboard | M-07 | Needs clinical advisor input on requirements. |
| Analytics & Reporting | M-08 | Nice-to-have. Admin stats cover MVP needs. |
| Content Studio | VVP | Significant feature. Requires content moderation pipeline. |
| SMS/USSD fallback | Infra | Requires Twilio or similar. Out of scope for web MVP. |
| Offline / PWA | Infra | Service worker complexity. Defer to post-launch. |
| Push notifications | Infra | Browser push API. In-app notifications cover MVP. |
| E2E message encryption | Safety | Architecture decision needed. Messages are purged at 90 days. |
| Revenue engine | Business | No monetisation in MVP. |
| Institutional licensing | Business | Requires sales pipeline. |
| Structured supervision | VVP | Needs clinical framework design. |

---

## Definition of Done (MVP v3)

- [x] Every landing page claim corresponds to a real feature
- [x] All footer links point to real destinations
- [x] Rate limiting enforced: max 3 active sessions, max 60 msgs/min
- [x] VolunteerAuth data persists across browser close
- [x] `crisis_flags` accessed with type safety (no `as any`)
- [x] All admin pages use React Query with batch queries
- [x] Session feedback prompted automatically on session close
- [x] Component tests for 7 critical components (61 tests across 13 files)
- [x] Aria-labels on all interactive elements
- [x] Keyboard navigation verified across all forms
- [x] Colour contrast WCAG AA validated (light + dark)
- [x] Helmet tags on all pages
- [x] Full data export (profile + journals + sessions + feedback)
- [x] Privacy policy page linked from footer
- [x] Community page has real content (resource board + encouragement wall)
- [x] No features advertised that don't exist

# Project Echo — Build Roadmap v3 (MVP Hardening)

> **Goal**: Close every gap identified in the v2 audit so Echo is **honest, safe, and production-ready** — not a demo with false marketing.

---

## Audit Summary (Post v2)

| Category | Status |
|----------|--------|
| Core seeker flow | ✅ 95% functional |
| Core volunteer flow | ✅ 85% functional |
| Safety & crisis | 🟡 70% — no rate limiting despite being "done" |
| Admin tooling | 🟡 80% — works but legacy patterns, N+1 queries |
| i18n | ✅ 90% — 5 languages, RTL |
| Data privacy | 🟡 65% — partial export, no encryption |
| Testing | 🟡 40% — utils tested, components not |
| Accessibility | 🟡 45% — landmarks exist, interactive elements lack labels |
| Landing page honesty | ❌ 30% — multiple false claims |
| Volunteer Value Prop delivery | 🟡 50% — Content Studio + supervision don't exist |

**What works**: The core loop (auth → onboard → session → chat → journal) is solid. Matching, crisis detection, admin, i18n, notifications all function.

**What's broken**: Rate limiting was never built. VolunteerAuth still loses data. Admin pages have N+1 query problems. Landing page advertises features that don't exist. Component tests were claimed but not written.

---

## Phase 15 — Fix False Claims & Dead Links
**Priority: P0 (Integrity) · Estimate: 30 min**

The landing page currently markets features that do not exist. This is the highest-priority fix.

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 15.1 | Rewrite PrinciplesSection claims | Remove "SMS/USSD fallback", "Offline-first crisis resources", "Low-bandwidth mode", "Seeker Advisory Board", "Co-design sessions", "Community governance co-written with the people who use the platform". Replace with accurate descriptions of what actually exists. | `PrinciplesSection.tsx` |
| 15.2 | Rewrite VolunteerSection claims | Remove "Content Studio" benefit card and "Structured supervision and mentoring". Replace with real benefits (e.g., self-paced training modules, CPD certificate, impact portfolio). | `VolunteerSection.tsx` |
| 15.3 | Fix dead footer links | All 8 footer links are `href="#"`. Either link to real pages (/auth, /volunteer, relevant sections) or remove them. | `Footer.tsx` |

**Deliverable**: Every claim on the public-facing landing page is truthful.

---

## Phase 16 — Implement Rate Limiting (Actually)
**Priority: P0 (Safety) · Estimate: 1 session**

Build.md v2 marked this done. It was never built. This is a safety requirement.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 16.1 | Session creation rate limit | Max 3 active sessions per seeker. Check in `cocoon_sessions` INSERT RLS policy or a BEFORE INSERT trigger. | 🔴 Not built — zero enforcement |
| 16.2 | Message sending rate limit | Max 60 messages per minute per user. Implement as a Postgres function that checks `session_messages` count in last 60s before allowing insert. | 🔴 Not built |
| 16.3 | Auth attempt throttling | Supabase handles this at the auth level, but verify configuration. Add client-side cooldown after failed attempts. | 🔴 Not verified |

**Deliverable**: Abuse vectors are rate-limited at the database level.

---

## Phase 17 — Fix Known Bugs & Technical Debt
**Priority: P0 · Estimate: 1 session**

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 17.1 | Fix VolunteerAuth sessionStorage | Volunteer onboarding data (motivation, background, specialisations) stored in `sessionStorage` is lost if browser closes before email confirmation. Move to `localStorage` or save directly to DB on signup. | 🔴 Bug — claimed fixed in v2, still broken |
| 17.2 | Type-safe `crisis_flags` access | All `crisis_flags` queries use `(supabase as any)`. Either add the table to the generated types refresh, or create a typed wrapper. Currently a runtime crash risk. | 🔴 Type-unsafe |
| 17.3 | Migrate admin pages to React Query | `AdminDashboardPage`, `AdminCrisisPage`, `AdminVolunteersPage`, `AdminSessionsPage`, `AdminUsersPage` all use raw `useEffect` + `useState`. Migrate to `useQuery` for consistency, caching, and error handling. | 🟡 Legacy pattern |
| 17.4 | Fix admin N+1 queries | `AdminCrisisPage` fetches message + session + profile per flag in a loop. `AdminVolunteersPage` fetches alias per volunteer in a loop. `AdminUsersPage` fetches role per user in a loop. Refactor to batch queries or DB views. | 🟡 Performance issue |
| 17.5 | Proactive session feedback prompt | Currently feedback requires clicking "Leave Feedback" on a closed session. Add a modal/interstitial that appears automatically when a session transitions to `closed`. | 🟡 Easy to miss |

**Deliverable**: No known bugs. All data fetching patterns are consistent.

---

## Phase 18 — Complete Testing
**Priority: P1 · Estimate: 1 session**

Build.md v2 claimed component tests were done. Only ProtectedRoute was tested.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 18.1 | SessionRequest component test | Test topic selection, urgency selection, form submission, disabled state when no topic selected. Mock `useCreateSession`. | 🔴 Not built |
| 18.2 | JournalEditor component test | Test title/content input, mood selection, tag add/remove, milestone toggle, save button. Mock `useCreateJournalEntry`. | 🔴 Not built |
| 18.3 | SessionFeedback component test | Test emotional rating selection, felt-heard/felt-safe toggles, skill endorsement (seeker role), submit. Mock Supabase. | 🔴 Not built |
| 18.4 | AvailabilityScheduler component test | Test slot toggle, save button, loading state. Mock `useAvailabilitySlots` and `useSaveAvailability`. | 🔴 Not built |
| 18.5 | CrisisBanner component test | Test rendering with emergency resources, dismiss button. | 🔴 Not built |
| 18.6 | AccountUpgrade component test | Test visibility for anonymous users, hidden for email users, form validation. | 🔴 Not built |
| 18.7 | AccountDeletion component test | Test confirm flow, DELETE text input validation, button disabled states. | 🔴 Not built |

**Deliverable**: All critical user-facing components have test coverage.

---

## Phase 19 — Accessibility Hardening
**Priority: P1 · Estimate: 1 session**

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 19.1 | Aria-labels on interactive elements | Add `aria-label` to: topic selection buttons, urgency buttons, availability grid cells, mood selectors, tag chips, notification bell, theme toggle buttons, filter buttons (admin pages). | 🔴 Missing on ~30 elements |
| 19.2 | Keyboard navigation audit | Verify Tab order through: SessionRequest form, JournalEditor, ChatRoom message input, AvailabilityScheduler grid, admin tables. Fix any traps. | 🔴 Not tested |
| 19.3 | Colour contrast validation | Verify all text/background combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large). Check both light and dark mode. Fix any failures. | 🔴 Not validated |
| 19.4 | Page-level Helmet tags | Add `<Helmet>` with `<title>` and `<meta description>` to: Auth, Onboarding, HomePage, CocoonPage, JournalPage, ProfilePage, VolunteerDashboard, admin pages. | 🟡 Only on Index |
| 19.5 | Focus management | After session status transitions, move focus to the status change notification or chat input. After modal close, return focus to trigger element. | 🔴 Not built |

**Deliverable**: WCAG AA compliant. Fully keyboard-navigable. Screen-reader friendly.

---

## Phase 20 — Data Privacy & Export Completion
**Priority: P1 · Estimate: 30 min

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 20.1 | Full data export | Extend DataExport to include: profile data, session metadata (not messages — retention policy), feedback given, tags/milestones. Single JSON download. | 🟡 Journal-only |
| 20.2 | PDF journal export | Add PDF download option alongside JSON using client-side generation (e.g. building a printable HTML blob). | 🔴 Not built |
| 20.3 | Privacy policy page | Create `/privacy` route with data retention policy (90-day message purge), what data is collected, how to export/delete. Link from footer. | 🔴 Not built |

**Deliverable**: Full GDPR-compliant data portability. Users understand what's stored.

---

## Phase 21 — Community Page (M-05 Minimum)
**Priority: P2 · Estimate: 1 session**

Currently a single "Coming soon" line. This is a nav tab leading to nothing.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 21.1 | Community resource board | Static curated list of mental health resources, articles, and helplines grouped by category. Admin-editable via a `community_resources` table. | 🔴 Empty page |
| 21.2 | Peer encouragement wall | Anonymous wall where users can post short encouragements (max 280 chars). Moderated — auto-filter crisis language. No replies (not a forum). | 🔴 Not built |

**Deliverable**: Community tab has meaningful content instead of a blank page.

---

## Implementation Order & Dependencies

```
Phase 15 (False Claims)  ──── P0, no dependencies, do first
Phase 16 (Rate Limiting)  ──── P0, no dependencies
Phase 17 (Bug Fixes)      ──── P0, no dependencies
         │
         ├── All three can run in parallel ──┐
         │                                   │
         ▼                                   ▼
Phase 18 (Testing)  ── depends on 17 (components must be stable before testing)
Phase 19 (Accessibility) ── can run parallel to 18
Phase 20 (Privacy)  ── can run parallel to 18
         │
         ▼
Phase 21 (Community) ── lowest priority, do last
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

- [ ] Every landing page claim corresponds to a real feature
- [ ] All footer links point to real destinations
- [ ] Rate limiting enforced: max 3 active sessions, max 60 msgs/min
- [ ] VolunteerAuth data persists across browser close
- [ ] `crisis_flags` accessed with type safety (no `as any`)
- [ ] All admin pages use React Query with batch queries
- [ ] Session feedback prompted automatically on session close
- [ ] Component tests for 7 critical components (30+ new tests)
- [ ] Aria-labels on all interactive elements
- [ ] Keyboard navigation verified across all forms
- [ ] Colour contrast WCAG AA validated (light + dark)
- [ ] Helmet tags on all pages
- [ ] Full data export (profile + journals + sessions + feedback)
- [ ] Privacy policy page linked from footer
- [ ] Community page has real content (resource board + encouragement wall)
- [ ] No features advertised that don't exist

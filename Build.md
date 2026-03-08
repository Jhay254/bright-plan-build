# Project Echo — Build Roadmap v2 (MVP Completion)

> **Goal**: Close all gaps identified in the v1 audit so Echo is a **deployable, trustworthy MVP** — not just a feature demo.

---

## Audit Summary (Where We Are)

| Category | Count |
|---|---|
| Fully built & functional | ~25 features |
| Stubbed / placeholder | 7 features |
| Not built at all | 15+ features |
| Architectural concerns | 5 issues |

**Core happy path works**: Seekers can register → onboard → request sessions → chat → journal. Volunteers can register → set availability → accept sessions → track CPD.

**Critical gaps**: No matching algorithm, no encryption, no i18n, no admin tooling, no safety escalation, no tests, architectural debt.

---

## Phase 6 — Architectural Fixes & Code Quality
**Priority: P0 · Estimate: 1 session**

These are foundational issues that will compound if left unresolved.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 6.1 | Replace `window.location.reload()` | ProfilePage uses reload after alias/avatar/language updates. Refactor to use `refreshProfile()` from AuthContext and local state updates. | 🔴 Broken pattern |
| 6.2 | Migrate data fetching to React Query | All pages use raw `useEffect` + `useState`. Migrate to `useQuery`/`useMutation` for caching, deduplication, background refresh, and error handling. | 🔴 Not used despite being installed |
| 6.3 | Add React error boundaries | No error boundaries exist. Add a top-level `ErrorBoundary` and per-route boundaries so crashes don't white-screen the app. | 🔴 Missing |
| 6.4 | Fix RLS policy logic | All RLS policies are RESTRICTIVE (AND logic). Multiple SELECT policies on `cocoon_sessions` may silently block access. Audit and convert to PERMISSIVE where appropriate. | ⚠️ Potential bugs |
| 6.5 | Fix `sessionStorage` volunteer flow | Volunteer onboarding data stored in `sessionStorage` is lost if user closes browser before email confirmation. Store pending data in the DB or use `localStorage`. | ⚠️ Data loss risk |
| 6.6 | Add loading skeletons | Replace all "Loading…" text placeholders with proper skeleton UI components for a polished experience. | 🟡 Cosmetic |

**Deliverable**: Clean, resilient codebase with proper data fetching patterns and error handling.

---

## Phase 7 — Volunteer Matching Algorithm
**Priority: P0 · Estimate: 1 session**

Currently first-come-first-served. PRD M-03 requires intelligent matching.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 7.1 | Build matching score function | Postgres function that scores volunteers against a session request by: language match (weight: high), specialisation overlap (weight: medium), current availability (weight: medium), total sessions (weight: low — prefer less-loaded volunteers). | 🔴 Not built |
| 7.2 | Auto-match on session creation | Edge function or DB trigger that runs when a session is created: finds best-match volunteer, sends notification (in-app), auto-assigns if score exceeds threshold. | 🔴 Not built |
| 7.3 | Fallback to manual browse | If no auto-match within N minutes, session remains in "requested" pool for manual volunteer acceptance (current behaviour). | ✅ Already works |
| 7.4 | Volunteer language/specialisation filtering | Volunteers browsing available sessions should be able to filter by language and topic area. | 🔴 Not built |
| 7.5 | Volunteer approval gate | Check `is_approved` before allowing volunteers to accept sessions. Currently the column exists but is never enforced. | 🔴 Not enforced |

**Deliverable**: Sessions are auto-matched to the best-fit volunteer; unapproved volunteers are blocked.

---

## Phase 8 — Safety & Escalation
**Priority: P0 · Estimate: 1 session**

Crisis detection exists but has no backend escalation path.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 8.1 | Flag crisis messages in DB | When `detectCrisisLanguage()` fires, write a `crisis_flags` record (session_id, message_id, timestamp, resolved boolean). | 🔴 Not built |
| 8.2 | Notify volunteer of crisis | Show a prominent in-chat alert to the volunteer when a seeker's message contains crisis language (currently only the sender sees the banner). | 🔴 Not built |
| 8.3 | Admin crisis dashboard | Surface all unresolved crisis flags for admin/clinical oversight review. | 🔴 Not built |
| 8.4 | Rate limiting | Add rate limits to session creation (max 3 active per seeker), message sending (max 60/min), and auth attempts (max 5/min). | 🔴 Not built |
| 8.5 | Auto-close stale sessions | DB function or cron to close sessions stuck in `requested` for >24h or `active` for >4h with no messages. | 🔴 Not built |

**Deliverable**: Crisis situations are flagged, escalated, and visible to oversight. Abuse vectors are rate-limited.

---

## Phase 9 — Admin Foundation
**Priority: P1 · Estimate: 1–2 sessions**

No admin tooling exists despite RLS policies granting admin SELECT access.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 9.1 | Admin layout & sidebar | Separate layout with sidebar navigation (Dashboard, Users, Sessions, Volunteers, Crisis Flags). Role-gated route. | 🔴 Not built |
| 9.2 | Admin dashboard | Overview stats: active sessions, registered seekers, approved volunteers, pending approvals, unresolved crisis flags. | 🔴 Not built |
| 9.3 | Volunteer approval UI | List pending volunteers (`is_approved = false`), view their motivation/background, approve/reject. | 🔴 Not built |
| 9.4 | Session oversight | List all sessions with status filters, view session metadata (not message content for privacy). Flag/unflag sessions. | 🔴 Not built |
| 9.5 | User management | View all profiles, assign/remove roles, deactivate accounts. | 🔴 Not built |

**Deliverable**: Admins can approve volunteers, monitor sessions, and respond to crisis flags.

---

## Phase 10 — Internationalisation (i18n)
**Priority: P1 · Estimate: 1–2 sessions**

Language selector exists but changes nothing in the UI.

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 10.1 | Install & configure `react-i18next` | Set up i18n provider, language detector (from profile), namespace structure. | 🔴 Not started |
| 10.2 | Extract all UI strings | Replace every hardcoded English string with `t()` calls across all components. | 🔴 Not started |
| 10.3 | English translation file | Create `en.json` as the base translation file. | 🔴 Not started |
| 10.4 | French translation | `fr.json` — full translation of all UI strings. | 🔴 Not started |
| 10.5 | Swahili, Arabic, Portuguese | `sw.json`, `ar.json`, `pt.json` — at minimum, onboarding + core app screens. | 🔴 Not started |
| 10.6 | RTL support for Arabic | Tailwind RTL plugin, `dir="rtl"` on root element when Arabic is selected. | 🔴 Not started |

**Deliverable**: App fully usable in 5 languages; Arabic displays RTL.

---

## Phase 11 — Anonymous Account Upgrade & Data Privacy
**Priority: P1 · Estimate: 1 session**

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 11.1 | Anonymous → email upgrade flow | Add "Secure your account" prompt in Profile. Use Supabase `updateUser()` to link email/password to anonymous account, preserving all data. | 🔴 Not built |
| 11.2 | Data export | Allow seekers to export their journal entries as JSON or PDF from Profile. | 🔴 Not built |
| 11.3 | Account deletion | Allow users to delete their account and all associated data (GDPR compliance). Cascade delete via DB. | 🔴 Not built |
| 11.4 | Session data retention policy | Auto-delete message content N days after session closes (keep metadata for stats). Document policy. | 🔴 Not built |

**Deliverable**: Users control their data — upgrade, export, or delete.

---

## Phase 12 — Completing Stubbed Features
**Priority: P1 · Estimate: 1–2 sessions**

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 12.1 | Skills endorsement mechanism | After a session closes, prompt the seeker to endorse 1-3 skills for the volunteer (e.g., "Good listener", "Empathetic", "Patient"). Write to `skills_endorsed` array. | 🟡 Column exists, no UI |
| 12.2 | Healing timeline visualisation | Add a visual timeline view to the journal showing mood trends over time (line/area chart) and milestone markers using `recharts` (already installed). | 🟡 Milestones exist, no timeline |
| 12.3 | Training module content | Add expandable content panels to each training module with reading material, key takeaways, and a brief self-assessment question before marking complete. | 🟡 Checklist only |
| 12.4 | CPD certificate as PDF | Generate proper PDF certificates with volunteer name, hours, date, and a verification URL. Store in Supabase Storage. | 🟡 window.print() hack |
| 12.5 | Dark mode | Define dark mode colour tokens in `index.css`, add toggle in Profile, wire up `next-themes` (already installed). | 🟡 Stubbed |
| 12.6 | Landing page mobile nav | Verify and fix responsive hamburger menu on landing page navbar. | 🟡 Needs verification |

**Deliverable**: All placeholder/stubbed features replaced with real implementations.

---

## Phase 13 — Notifications & Real-time UX
**Priority: P2 · Estimate: 1 session**

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 13.1 | In-app notification system | Create `notifications` table. Show bell icon with unread count in nav. Notify on: session matched, new message (when off-page), session status change, volunteer approved. | 🔴 Not built |
| 13.2 | Unread message indicators | Show unread badge on Cocoon tab and per-session in session list. | 🔴 Not built |
| 13.3 | Session status toasts | Show toast when session status changes in real-time (already subscribed, just need the toast trigger). | 🟡 Subscription exists |

**Deliverable**: Users are aware of activity without constantly checking pages.

---

## Phase 14 — Testing & Accessibility
**Priority: P2 · Estimate: 1–2 sessions**

| # | Task | Details | Current State |
|---|------|---------|---------------|
| 14.1 | Unit tests for utility functions | Test `detectCrisisLanguage`, `generateAvatarSvg`, `getMoodOption`, `generateAlias`. | 🔴 Only placeholder test exists |
| 14.2 | Component tests | Test key flows: SessionRequest form, JournalEditor, SessionFeedback, AvailabilityScheduler. | 🔴 Not built |
| 14.3 | Auth flow integration tests | Test anonymous signup, email signup, login, protected route redirect, onboarding redirect. | 🔴 Not built |
| 14.4 | Accessibility audit | Add `aria-labels` to all interactive elements, test keyboard navigation, validate colour contrast ratios, add skip-to-content link. | 🔴 Not done |
| 14.5 | SEO & meta tags | Add page-level `<title>` and `<meta description>` tags. Add JSON-LD for the landing page. Ensure single `<h1>` per page. | 🟡 Partial |

**Deliverable**: Confidence in code correctness, usable by assistive technology users.

---

## Post-MVP (Backlog — Unchanged)

| Module | PRD Ref | Description |
|--------|---------|-------------|
| Community Circles | M-05 | Group support sessions, moderated forums |
| Clinical Oversight Dashboard | M-07 | Full supervisor review, session auditing beyond basic admin |
| Analytics & Reporting | M-08 | Platform-wide metrics, volunteer performance dashboards |
| AI Companion (Triage) | M-10 | AI-assisted initial assessment before volunteer matching |
| Revenue Engine | VVA | Freemium tiers, institutional licensing, API access |
| Push notifications | Infra | Browser push for session reminders, journal prompts |
| Offline support / PWA | Infra | Service worker, offline journal access |

---

## Implementation Order & Dependencies

```
Phase 6 (Arch Fixes) ──────────────────────┐
                                            ├── Can run in parallel
Phase 8 (Safety) ──────────────────────────┘
         │
         ▼
Phase 7 (Matching) ── depends on 6.4 (RLS fix) + 8.4 (rate limiting)
         │
         ▼
Phase 9 (Admin) ── depends on 7.5 (approval gate) + 8.3 (crisis dashboard)
         │
         ▼
Phase 10 (i18n) ── can start after Phase 6 (needs clean component structure)
Phase 11 (Privacy) ── can start after Phase 6
Phase 12 (Stubs) ── can start after Phase 6
         │
         ▼
Phase 13 (Notifications) ── depends on 9 (admin needs notifications too)
Phase 14 (Testing) ── runs last, covers everything above
```

---

## Definition of Done (MVP v2)

- [ ] All data fetching uses React Query; no raw useEffect fetch patterns
- [ ] Error boundaries on all route segments
- [ ] Volunteer matching algorithm scores and auto-assigns
- [ ] Unapproved volunteers cannot accept sessions
- [ ] Crisis messages flagged in DB and escalated to volunteer + admin
- [ ] Rate limiting on session creation, messaging, and auth
- [ ] Admin can approve volunteers, view sessions, see crisis flags
- [ ] App fully translated into 5 languages with RTL Arabic support
- [ ] Anonymous users can upgrade to email accounts
- [ ] Users can export and delete their data
- [ ] Skills endorsed after sessions; healing timeline chart in journal
- [ ] Training modules have actual content
- [ ] Dark mode toggle works
- [ ] In-app notifications for key events
- [ ] Unit + component tests for critical paths
- [ ] Accessibility audit passed (aria-labels, keyboard nav, contrast)
- [ ] All "Loading…" text replaced with skeleton UI

# Project Echo — MVP Completion Roadmap v4

> **Context**: Post-v3 audit revealed the core loop is solid (95%) but the landing page still has false claims, community features are shallow, and several PRD requirements are missing. This roadmap closes every gap to reach a **truthful, tested, production-ready MVP**.

---

## Current State Summary

| Category | Score | Key Gap |
|----------|-------|---------|
| Core seeker flow | 95% | — |
| Core volunteer flow | 85% | Portfolio not shareable, certs decorative |
| Safety & crisis | 90% | — |
| Admin tooling | 85% | No community moderation UI |
| Data privacy | 85% | No GDPR consent collection |
| Testing | 70% | No E2E tests |
| Landing page honesty | 75% | FlywheelSection has 4 false claims |
| Community | 40% | No circles/stories/sharing |

---

## Phase 22 — Fix Remaining False Claims (P0 · Integrity)
**Estimate: 30 min · No dependencies · Do first**

The FlywheelSection (landing page) still describes features that don't exist.

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 22.1 | Rewrite FlywheelSection stages 5-8 | Stage 5 "Connect" claims "Join anonymous peer communities" — no community circles exist. Replace with: "Find curated mental health resources and share encouragements with others on the same journey." | `FlywheelSection.tsx` |
| 22.2 | Rewrite FlywheelSection stage 6 | "Choose to share your story with full editorial control" — no story-sharing exists. Replace with: "Reflect privately in your Healing Journal. Track your moods, milestones, and growth over time." | `FlywheelSection.tsx` |
| 22.3 | Rewrite FlywheelSection stage 7 | "Your story reaches someone who needs it" — no story propagation. Replace with: "Your encouragements on the community wall reach someone who needs to hear them today." | `FlywheelSection.tsx` |
| 22.4 | Rewrite FlywheelSection stage 8 | "Become a volunteer yourself. Lived experience becomes power." — implies a seeker→volunteer transition flow that doesn't exist as described. Replace with: "When you're ready, apply to become a volunteer. Your lived experience becomes the foundation for helping others." | `FlywheelSection.tsx` |
| 22.5 | Fix VolunteerSection benefit 4 | "Community of Purpose — Join a global network of professionals" — no volunteer networking feature. Replace with: "Purposeful Impact — Every session you give is tracked, endorsed, and contributes to your verified impact portfolio." | `VolunteerSection.tsx` |

**Acceptance criteria**: Every claim on the public-facing site corresponds to a real, shipped feature.

---

## Phase 23 — Fix Stale Copy & Translations (P0 · Integrity)
**Estimate: 15 min · No dependencies**

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 23.1 | Update export description in all locales | `en.json` says "Download your journal entries as a JSON file" — export now includes profile, sessions, feedback. Change to "Download all your data (profile, journal, sessions, feedback) as a JSON file." | `src/locales/*.json` |
| 23.2 | Update community coming-soon text | `en.json` `community.comingSoon` still says "Community circles and group support coming soon" — but the community page now has resources and encouragements. Remove or update this string. | `src/locales/*.json` |
| 23.3 | Audit all 5 locale files | Ensure `fr.json`, `sw.json`, `ar.json`, `pt.json` have translations for all keys added in v3 (community, encouragements, PDF export, privacy). Missing keys will fall back to English — document which are missing. | `src/locales/*.json` |

**Acceptance criteria**: No stale copy anywhere in the app. All locale files audited.

---

## Phase 24 — GDPR Consent & Cookie Notice (P1 · Compliance)
**Estimate: 1 session · Depends on: nothing**

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 24.1 | Add consent checkbox to Auth signup | Before creating an account (email or anonymous), user must check "I agree to the Privacy Policy" with a link to `/privacy`. Store consent timestamp in `profiles` table (add `consent_given_at` column). | `Auth.tsx`, `VolunteerAuth.tsx`, DB migration |
| 24.2 | Add consent to anonymous flow | Anonymous users also need consent. Show a brief "By continuing, you agree to our Privacy Policy" with a link before `signInAnonymously()` executes. | `Auth.tsx` |
| 24.3 | Cookie notice banner | Simple dismissible banner: "Echo uses essential cookies only for authentication. No tracking. [OK]". Store dismissal in `localStorage`. Show on landing page and auth pages. | New: `components/CookieBanner.tsx` |
| 24.4 | Update privacy policy | Add section on cookies (essential only, no tracking), and consent collection. | `PrivacyPolicy.tsx` |

**Acceptance criteria**: No user can create data without acknowledging the privacy policy. Cookie use is disclosed.

---

## Phase 25 — Admin Community Moderation (P1 · Safety)
**Estimate: 30 min · Depends on: Phase 21 (done)**

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 25.1 | Add admin encouragement moderation page | New admin route `/admin/community` showing all encouragements (visible + hidden). Admin can toggle `is_visible` and see post content, timestamp, and user_id (hashed/aliased). | New: `pages/admin/AdminCommunityPage.tsx` |
| 25.2 | Add admin resource management | Allow admins to add/edit/deactivate community resources from the admin UI (CRUD on `community_resources` table). Currently requires direct DB access. | New: `pages/admin/AdminResourcesPage.tsx` or tab within community admin |
| 25.3 | Add nav link in AdminLayout | Add "Community" link to the admin sidebar/nav. | `AdminLayout.tsx` |
| 25.4 | Add route | Register `/admin/community` in `App.tsx`. | `App.tsx` |

**Acceptance criteria**: Admins can moderate encouragements and manage resources without DB access.

---

## Phase 26 — Volunteer Portfolio Enhancement (P1 · VVP)
**Estimate: 1 session · Depends on: nothing**

The PRD promises a "verified impact portfolio" but the current implementation is a private stats page.

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 26.1 | Shareable portfolio page | Create a public route `/portfolio/:volunteerId` that displays a volunteer's stats, specialisations, endorsed skills, training completion %, and CPD hours. No personally identifiable info — use alias and avatar only. | New: `pages/PortfolioPublic.tsx` |
| 26.2 | Portfolio RLS policy | Add a SELECT policy on `volunteer_profiles` for public portfolio access (read-only, approved volunteers only). Alternatively, use an edge function to serve sanitised data. | DB migration |
| 26.3 | Share button on ImpactPortfolio | Add a "Share Portfolio" button that copies the public URL to clipboard. | `ImpactPortfolio.tsx` |
| 26.4 | Verifiable CPD certificates | Add a unique certificate ID to each CPD certificate. Create a `/verify/:certId` route that confirms the certificate is authentic. Store cert IDs in a `cpd_certificates` table. | DB migration, new page |

**Acceptance criteria**: Volunteers can share a public link to their anonymised portfolio. CPD certificates have verifiable IDs.

---

## Phase 27 — Guided Journal Prompts (P2 · Feature)
**Estimate: 1 session · Depends on: nothing**

The journal currently has a blank textarea. PRD implies guided reflection.

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 27.1 | Prompt library | Create a static set of 20+ guided prompts, categorised (gratitude, processing, coping, growth). Stored in `lib/journal-prompts.ts`. | New file |
| 27.2 | Prompt suggestion UI | On the JournalEditor page, show 3 random prompts the user can tap to pre-fill the content textarea. "Need inspiration?" section above the editor. | `JournalEditor.tsx` |
| 27.3 | Post-session prompt | After completing a session and feedback, offer a journal prompt related to their session topic. "Would you like to reflect on this session?" button that navigates to `/app/journal/new?prompt=post-session`. | `SessionFeedback.tsx`, `JournalEditor.tsx` |

**Acceptance criteria**: Users never face a blank page without inspiration. Post-session reflection is encouraged.

---

## Phase 28 — E2E Testing (P1 · Quality)
**Estimate: 1-2 sessions · Depends on: Phases 22-25 (stabilised UI)**

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 28.1 | Set up Playwright | Install Playwright, configure `playwright.config.ts` for the Vite dev server. Create test helpers for auth (seeder user). | Config files |
| 28.2 | Seeker happy path | Test: Landing → Auth (anonymous) → Onboarding → Home → Request Session → View Session → Journal → New Entry → Profile → Export → Sign Out. | `e2e/seeker-flow.spec.ts` |
| 28.3 | Volunteer happy path | Test: Volunteer Auth → Sign Up → Confirm → Training → Complete Module → Availability → Accept Session → Chat → End Session → Feedback → Portfolio. | `e2e/volunteer-flow.spec.ts` |
| 28.4 | Admin happy path | Test: Admin Auth → Dashboard → Users → Change Role → Volunteers → Approve → Sessions → Crisis Flags → Resolve. | `e2e/admin-flow.spec.ts` |
| 28.5 | Crisis detection flow | Test: Seeker sends crisis-keyword message → CrisisBanner appears → Crisis flag created → Admin sees flag → Resolves. | `e2e/crisis-flow.spec.ts` |
| 28.6 | Edge cases | Test: Rate limit error (4th session), message rate limit, account deletion, anonymous→email upgrade, RTL layout (Arabic). | `e2e/edge-cases.spec.ts` |

**Acceptance criteria**: All happy paths pass. CI runs E2E on every PR.

---

## Phase 29 — Performance & Polish (P2 · Quality)
**Estimate: 1 session · Depends on: all prior phases**

| # | Task | Details | File(s) |
|---|------|---------|---------|
| 29.1 | Lazy load routes | Code-split all page components with `React.lazy()` + `Suspense`. Currently all 20+ pages are in the main bundle. | `App.tsx` |
| 29.2 | Image optimisation | Compress `hero-illustration.jpg` and `echo-logo.png`. Add `loading="lazy"` to non-critical images. | Asset files |
| 29.3 | Loading skeletons everywhere | Verify every data-fetching page shows a skeleton (not a blank screen) while loading. Add where missing. | Various pages |
| 29.4 | Error states | Verify every `useQuery` failure shows a user-friendly error (not a blank screen). Add error states where missing. | Various pages |
| 29.5 | Bundle analysis | Run `npx vite-bundle-visualizer` and identify any oversized dependencies. Target < 300KB gzipped initial load. | Config |
| 29.6 | Lighthouse audit | Run Lighthouse on landing page. Target: Performance > 90, Accessibility > 95, SEO > 95, Best Practices > 90. Fix any failures. | Various |

**Acceptance criteria**: Initial load < 300KB gzipped. Lighthouse scores meet targets. No blank loading states.

---

## Implementation Order & Dependencies

```
Phase 22 (False Claims)         ─── P0, 30 min, do FIRST
Phase 23 (Stale Copy)           ─── P0, 15 min, parallel with 22
         │
         ├── Both are < 1 hour, unblock everything ──┐
         │                                           │
Phase 24 (GDPR Consent)         ─── P1, 1 session   │
Phase 25 (Admin Moderation)     ─── P1, 30 min       │  All parallel
Phase 26 (Portfolio)            ─── P1, 1 session    │
Phase 27 (Journal Prompts)      ─── P2, 1 session   │
         │                                           │
         ▼                                           ▼
Phase 28 (E2E Tests)            ─── P1, depends on 22-25 (UI stable)
         │
         ▼
Phase 29 (Performance & Polish) ─── P2, do last
```

**Critical path**: 22 → 23 → 24/25/26 (parallel) → 28 → 29

**Estimated total effort**: 5-7 sessions

---

## Known Scope Exclusions (Post-MVP)

These are **intentionally deferred** and must NOT be marketed:

| Feature | Why Deferred |
|---------|-------------|
| Community Circles (group sessions) | Complex moderation, requires real-time multi-party chat |
| AI Companion / Triage | Requires safety validation pipeline |
| Clinical Oversight Dashboard | Needs clinical advisor input |
| Content Studio | Requires content moderation pipeline |
| SMS/USSD fallback | Requires Twilio, out of scope for web MVP |
| Offline / PWA | Service worker complexity |
| Push notifications | Browser push API; in-app notifications cover MVP |
| E2E message encryption | Architecture decision pending; 90-day purge mitigates |
| Revenue engine / institutional licensing | No monetisation in MVP |
| Structured supervision | Needs clinical framework design |
| Story sharing / editorial platform | Significant feature; encouragement wall is the MVP alternative |
| Seeker→Volunteer automated transition | Manual volunteer application covers MVP |

---

## Definition of Done (MVP v4)

### Integrity
- [ ] Every landing page claim corresponds to a real, shipped feature
- [ ] Every locale file is audited for stale/missing keys
- [ ] FlywheelSection stages 5-8 accurately describe what exists

### Compliance
- [ ] GDPR consent collected before any account creation
- [ ] Cookie notice displayed and dismissible
- [ ] Privacy policy covers cookies and consent

### Safety
- [ ] Admin can moderate community encouragements via UI
- [ ] Admin can manage community resources via UI
- [ ] Rate limiting enforced: max 3 sessions, 60 msgs/min

### Volunteer Value
- [ ] Public shareable portfolio URL (anonymised)
- [ ] Verifiable CPD certificates with unique IDs
- [ ] Training content with self-assessments

### Quality
- [ ] E2E tests for seeker, volunteer, admin, and crisis flows
- [ ] All routes lazy-loaded
- [ ] Lighthouse: Perf > 90, A11y > 95, SEO > 95
- [ ] No blank loading/error states

### Feature Completeness
- [ ] Guided journal prompts (20+ prompts, post-session prompt)
- [ ] Full data export (profile + journal + sessions + feedback)
- [ ] PDF journal export
- [ ] Community resource board + encouragement wall
- [ ] 5-language i18n with RTL support

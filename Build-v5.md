# Project Echo — MVP Completion Roadmap v5

> **Context**: Post-v4 audit (March 2026) confirmed the app is ~93% complete. This roadmap covers the **remaining gaps** to reach a fully truthful, tested, production-ready MVP. All phases from Build.md v4 that are already complete are omitted.

---

## Current State Summary

| Category | Score | Remaining Gap |
|----------|-------|---------------|
| Core seeker flow | 98% | — |
| Core volunteer flow | 95% | — |
| Safety & crisis | 95% | — |
| Admin tooling | 95% | — |
| Data privacy / GDPR | 95% | — |
| Testing | 75% | E2E tests exist but no CI; not verified against real DB |
| Landing page honesty | 95% | 1 dead CTA button |
| Community | 80% | No circles (post-MVP), but current features functional |
| i18n completeness | 85% | Non-English locales likely missing recent keys |
| Performance & polish | 70% | No Lighthouse audit done; no bundle analysis |

---

## What Is Already Done (Do NOT Rebuild)

These features are **fully built and functional** — do not re-implement:

- ✅ Anonymous & email auth with consent collection
- ✅ Forgot/reset password flow
- ✅ 6-step seeker onboarding
- ✅ RBAC (seeker / volunteer / admin) via `user_roles` table + `has_role()` function
- ✅ Cocoon sessions: request → auto-match → chat → wrap-up → close
- ✅ Real-time messaging with crisis language detection
- ✅ Crisis banner + crisis flags for admin review
- ✅ Healing Journal with moods, milestones, tags, 24 guided prompts
- ✅ Post-session journal reflection prompt
- ✅ Session feedback with emotional rating, felt heard/safe, skill endorsement
- ✅ Encouragement Wall with crisis-language guard
- ✅ Community Resource Board (categorised, admin-managed)
- ✅ GDPR consent checkbox (auth + anonymous flows)
- ✅ Cookie banner (essential-only disclosure)
- ✅ Privacy policy page
- ✅ Volunteer application (motivation, background, specialisations)
- ✅ Volunteer approval gate (pending / rejected + re-apply / approved)
- ✅ 5 training modules with content + self-assessment quizzes
- ✅ Availability scheduler
- ✅ Impact Portfolio (private + public shareable at `/portfolio/:id`)
- ✅ CPD log + verifiable certificates at `/verify/:certCode`
- ✅ Admin: dashboard stats, volunteer approval/rejection, user role management, session overview, crisis flags, community moderation (encouragements + resources)
- ✅ Data export: full JSON (profile + journal + sessions + feedback) + PDF journal
- ✅ Account deletion + anonymous-to-email upgrade
- ✅ 5-language i18n (en/fr/ar/sw/pt) with RTL support
- ✅ Lazy-loaded routes, error boundaries, notification system
- ✅ Email notification on volunteer approval/rejection (edge function)
- ✅ Rate limiting: 3 sessions max, 60 msgs/min
- ✅ 90-day message content purge
- ✅ Stale session auto-close (24h unmatched, 4h inactive)
- ✅ Flywheel + Volunteer section copy corrected to match shipped features

---

## Phase 30 — Fix Remaining Landing Page Issue (P0 · 5 min)

**Priority**: Do first — it's a 1-line fix.

| # | Task | Details | File |
|---|------|---------|------|
| 30.1 | Fix dead "Become a Volunteer" button | The `<Button>` on line 28 of `VolunteerSection.tsx` has no navigation. Wrap it in `<Link to="/volunteer">` (same pattern as `HeroSection.tsx`). | `src/components/landing/VolunteerSection.tsx` |

**Acceptance criteria**: Clicking "Become a Volunteer" on the landing page navigates to `/volunteer`.

---

## Phase 31 — Locale Audit & Completion (P1 · 1-2 hours)

| # | Task | Details | Files |
|---|------|---------|-------|
| 31.1 | Extract all i18n keys from codebase | Run a script or manual grep for all `t("...")` calls across the codebase. Produce a master key list. | All `*.tsx` files |
| 31.2 | Audit `en.json` | Ensure every key used in code exists in `en.json`. Add any missing keys. | `src/locales/en.json` |
| 31.3 | Audit `fr.json` | Compare against `en.json`. Add missing keys with French translations. Flag any stale keys. | `src/locales/fr.json` |
| 31.4 | Audit `ar.json` | Compare against `en.json`. Add missing keys with Arabic translations. Verify RTL rendering. | `src/locales/ar.json` |
| 31.5 | Audit `sw.json` | Compare against `en.json`. Add missing keys with Swahili translations. | `src/locales/sw.json` |
| 31.6 | Audit `pt.json` | Compare against `en.json`. Add missing keys with Portuguese translations. | `src/locales/pt.json` |
| 31.7 | Remove stale keys | Delete any keys in locale files that are no longer referenced in code (e.g., old `community.comingSoon` if still present). | `src/locales/*.json` |

**Acceptance criteria**: Every `t()` call in the codebase has a corresponding key in all 5 locale files. No stale keys remain.

---

## Phase 32 — E2E Test Reliability & CI (P1 · 2-3 hours)

The E2E test files exist but are not verified to run reliably.

| # | Task | Details | Files |
|---|------|---------|-------|
| 32.1 | Verify Playwright config | Ensure `playwright.config.ts` correctly targets the Vite dev server. Run `npx playwright test` locally and fix any config issues. | `playwright.config.ts` |
| 32.2 | Create test seed helpers | The auth helper in `e2e/helpers/auth.ts` needs a reliable way to create test users. Options: (a) use Supabase service role key to create users via API, or (b) use the UI sign-up flow. Document the chosen approach. | `e2e/helpers/auth.ts` |
| 32.3 | Fix seeker flow test | Run `e2e/seeker-flow.spec.ts` end-to-end. Fix any selector issues, timing problems, or auth flow failures. | `e2e/seeker-flow.spec.ts` |
| 32.4 | Fix volunteer flow test | Run `e2e/volunteer-flow.spec.ts`. This requires email verification — either enable auto-confirm for test env or mock the verification step. | `e2e/volunteer-flow.spec.ts` |
| 32.5 | Fix admin flow test | Run `e2e/admin-flow.spec.ts`. Requires an admin-seeded user. | `e2e/admin-flow.spec.ts` |
| 32.6 | Fix crisis flow test | Run `e2e/crisis-flow.spec.ts`. Verify crisis keyword detection triggers the banner. | `e2e/crisis-flow.spec.ts` |
| 32.7 | Fix edge case tests | Run `e2e/edge-cases.spec.ts`. Covers rate limits, account deletion, anonymous upgrade, RTL. | `e2e/edge-cases.spec.ts` |
| 32.8 | Add CI pipeline | Create a GitHub Actions workflow (`.github/workflows/e2e.yml`) that runs Playwright tests on every PR. Use the Vite dev server as the test target. | New: `.github/workflows/e2e.yml` |

**Acceptance criteria**: All 5 E2E test files pass locally. CI runs tests on every PR and blocks merge on failure.

---

## Phase 33 — Performance & Lighthouse (P2 · 1-2 hours)

| # | Task | Details | Files |
|---|------|---------|-------|
| 33.1 | Run Lighthouse on landing page | Use Chrome DevTools or `npx lighthouse`. Record baseline scores for Performance, Accessibility, SEO, Best Practices. | — |
| 33.2 | Compress images | Optimise `src/assets/hero-illustration.jpg` (likely oversized) and `src/assets/echo-logo.png`. Use WebP format if possible. Add `loading="lazy"` and `decoding="async"` to all non-critical `<img>` tags. | Asset files, component files |
| 33.3 | Bundle analysis | Run `npx vite-bundle-visualizer`. Identify any oversized dependencies. Target < 300KB gzipped initial load. | `vite.config.ts` |
| 33.4 | Fix accessibility issues | Address any Lighthouse accessibility findings — likely missing ARIA labels, colour contrast issues, or focus management gaps. | Various |
| 33.5 | Add SEO meta tags | Ensure all public pages (landing, privacy, portfolio, verify) have proper `<title>`, `<meta description>`, Open Graph tags. | Various page files |
| 33.6 | Verify loading skeletons | Check every data-fetching page shows a skeleton while loading (not a blank screen). Pages to check: `CocoonPage`, `JournalPage`, `CommunityPage`, `ProfilePage`, `AdminDashboardPage`. Add skeletons where missing. | Various |
| 33.7 | Verify error states | Check every `useQuery` failure shows a user-friendly error message. Use the existing `QueryError` component (`src/components/ui/query-error.tsx`) where applicable. | Various |

**Acceptance criteria**: 
- Lighthouse: Performance > 90, Accessibility > 95, SEO > 95, Best Practices > 90
- Initial bundle < 300KB gzipped
- No blank loading or error states anywhere in the app

---

## Phase 34 — Minor UX Fixes (P2 · 30 min)

| # | Task | Details | Files |
|---|------|---------|-------|
| 34.1 | Verify PDF export quality | The current PDF export uses `window.open()` + `window.print()`. Test across Chrome, Firefox, Safari. If print dialog is confusing for users, consider adding a brief instruction tooltip. | `src/components/profile/DataExport.tsx` |
| 34.2 | Verify realtime publication | Confirm that `session_messages` and `cocoon_sessions` tables are added to the `supabase_realtime` publication. If not, create a migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages, public.cocoon_sessions;` | DB migration |
| 34.3 | Add JSON-LD to landing page | Add Organisation structured data for SEO. | `src/pages/Index.tsx` |
| 34.4 | Verify dark mode | The app uses semantic tokens (`--background`, `--foreground`, etc.) but verify dark mode actually works end-to-end. If not supported, either add it or explicitly set `class="light"` on `<html>`. | `index.html`, `src/index.css` |

**Acceptance criteria**: All UX edge cases handled gracefully.

---

## Implementation Order & Dependencies

```
Phase 30 (Dead button fix)          ─── P0, 5 min, do FIRST
         │
Phase 31 (Locale audit)             ─── P1, 1-2 hours, parallel
Phase 32 (E2E + CI)                 ─── P1, 2-3 hours, parallel
         │
         ├── Both unblock final polish ──┐
         │                               │
Phase 33 (Performance & Lighthouse)  ─── P2, 1-2 hours
Phase 34 (Minor UX fixes)           ─── P2, 30 min, parallel with 33
```

**Critical path**: 30 → 31 + 32 (parallel) → 33 + 34 (parallel)

**Estimated total effort**: 5-8 hours (1-2 working sessions)

---

## Known Post-MVP Exclusions (Do NOT Build)

These are **intentionally deferred** and must NOT be marketed or promised:

| Feature | Why Deferred |
|---------|-------------|
| Community Circles (group sessions) | Complex moderation, multi-party real-time chat |
| AI Companion / Triage | Requires safety validation pipeline |
| Clinical Oversight Dashboard | Needs clinical advisor input |
| Content Studio | Requires content moderation pipeline |
| SMS/USSD fallback | Requires Twilio integration |
| Offline / PWA | Service worker complexity |
| Push notifications (browser) | In-app notifications cover MVP |
| E2E message encryption | Architecture decision pending; 90-day purge mitigates |
| Revenue engine / institutional licensing | No monetisation in MVP |
| Structured supervision | Needs clinical framework design |
| Story sharing / editorial platform | Encouragement wall is the MVP alternative |
| Seeker→Volunteer automated transition | Manual volunteer application covers MVP |
| Dark mode | Not required for MVP; semantic tokens are in place for future |

---

## Definition of Done (MVP v5)

### Integrity
- [ ] Every landing page claim corresponds to a real, shipped feature
- [ ] All CTA buttons navigate to correct destinations
- [ ] Every locale file has complete translations for all keys

### Compliance
- [ ] GDPR consent collected before any account creation *(done)*
- [ ] Cookie notice displayed and dismissible *(done)*
- [ ] Privacy policy covers cookies and consent *(done)*

### Safety
- [ ] Admin can moderate community encouragements via UI *(done)*
- [ ] Admin can manage community resources via UI *(done)*
- [ ] Rate limiting enforced: max 3 sessions, 60 msgs/min *(done)*
- [ ] Crisis language detection triggers banner + flag *(done)*

### Volunteer Value
- [ ] Public shareable portfolio URL (anonymised) *(done)*
- [ ] Verifiable CPD certificates with unique IDs *(done)*
- [ ] Training content with self-assessments *(done)*

### Quality
- [ ] E2E tests for seeker, volunteer, admin, and crisis flows — **all passing**
- [ ] CI pipeline runs E2E tests on every PR
- [ ] All routes lazy-loaded *(done)*
- [ ] Lighthouse: Performance > 90, Accessibility > 95, SEO > 95
- [ ] Initial bundle < 300KB gzipped
- [ ] No blank loading/error states
- [ ] Realtime publication confirmed for chat tables

### Feature Completeness
- [ ] Guided journal prompts (24 prompts, post-session prompt) *(done)*
- [ ] Full data export (profile + journal + sessions + feedback) *(done)*
- [ ] PDF journal export *(done)*
- [ ] Community resource board + encouragement wall *(done)*
- [ ] 5-language i18n with RTL support — **all keys complete**
- [ ] Forgot/reset password flow *(done)*

---

## File Reference

Key files the dev team will need to touch:

| File | Phase | Action |
|------|-------|--------|
| `src/components/landing/VolunteerSection.tsx` | 30 | Add `Link` to volunteer CTA |
| `src/locales/en.json` | 31 | Audit + add missing keys |
| `src/locales/fr.json` | 31 | Audit + translate |
| `src/locales/ar.json` | 31 | Audit + translate |
| `src/locales/sw.json` | 31 | Audit + translate |
| `src/locales/pt.json` | 31 | Audit + translate |
| `playwright.config.ts` | 32 | Verify config |
| `e2e/helpers/auth.ts` | 32 | Fix test seeding |
| `e2e/*.spec.ts` (5 files) | 32 | Fix and verify all pass |
| `.github/workflows/e2e.yml` | 32 | Create CI pipeline |
| `src/assets/hero-illustration.jpg` | 33 | Compress / convert to WebP |
| `src/assets/echo-logo.png` | 33 | Compress |
| Various page components | 33 | Add skeletons / error states where missing |
| `src/pages/Index.tsx` | 34 | Add JSON-LD |
| `src/index.css` / `index.html` | 34 | Verify dark mode or lock to light |

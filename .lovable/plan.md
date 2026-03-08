

## Plan: Fix Volunteer Auth Flow

### Problems Identified

1. **Volunteers get stuck in seeker onboarding.** The `handle_new_user` DB trigger always assigns the `seeker` role and creates a profile with `onboarding_complete: false`. `ProtectedRoute` then forces them to `/onboarding` (the 6-step seeker flow) before they can reach `/app/volunteer`.

2. **Volunteer sign-in navigates to `/app` not `/app/volunteer`.** In `VolunteerAuth.tsx` line 60, sign-in sends volunteers to `/app` (the seeker home page).

3. **Volunteer profile + role created too late.** The volunteer profile and `volunteer` role are only created when the user reaches `VolunteerDashboard` (via `useEffect`), but they can never get there because onboarding blocks them.

4. **No volunteer tab in navigation.** The `BottomTabBar` has no link to the volunteer dashboard.

### Solution

#### 1. `VolunteerAuth.tsx` — Fix sign-in redirect
- Change sign-in navigation from `/app` to `/app/volunteer`.

#### 2. `ProtectedRoute.tsx` — Skip seeker onboarding for volunteers
- After loading, check the user's role. If `role === 'volunteer'`, skip the onboarding redirect (volunteers complete their own onboarding in the volunteer auth flow).
- This requires pulling `role` from `useAuth()`.

#### 3. `VolunteerDashboard.tsx` — Auto-complete seeker onboarding
- When a volunteer lands on the dashboard and their profile has `onboarding_complete: false`, auto-set it to `true` (alongside the existing volunteer profile creation logic). This prevents the onboarding gate from blocking them on future visits.

#### 4. `VolunteerAuth.tsx` — Handle post-confirmation sign-in properly
- When a volunteer signs in (after confirming email), navigate to `/app/volunteer` so they reach the dashboard where their volunteer profile gets auto-created.

#### 5. `BottomTabBar.tsx` — Show volunteer tab conditionally
- When the user's role is `volunteer`, replace one of the nav items (or add a 6th) with a link to `/app/volunteer` (e.g., replace Home with a "Hub" tab, or add it alongside Profile).

#### 6. `src/contexts/AuthContext.tsx` — No changes needed
- Already exposes `role` which will be `volunteer` once the role is upserted.

### Files to Change

| File | Change |
|------|--------|
| `src/components/app/ProtectedRoute.tsx` | Add `role` from `useAuth()`, skip onboarding redirect when `role === 'volunteer'` |
| `src/pages/VolunteerAuth.tsx` | Change sign-in redirect to `/app/volunteer` |
| `src/pages/app/VolunteerDashboard.tsx` | Also set `onboarding_complete: true` during auto-profile creation |
| `src/components/app/BottomTabBar.tsx` | Conditionally show volunteer dashboard link when role is `volunteer` |


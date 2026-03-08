

## Plan: Fix Volunteer Onboarding & Approval Gate

### Current Problems

1. **No approval gate**: After sign-in, volunteers land directly on the full dashboard regardless of approval status. They should see a "pending review" screen until approved.
2. **No rejection reason**: The `volunteer_profiles` table has no `rejection_reason` column, and the admin UI has no way to provide one.
3. **No rejection notification**: When an admin rejects a volunteer, there's no notification sent.
4. **Volunteer sees seeker onboarding** (the screenshot): The "You are safe here" screen is the seeker onboarding flow bleeding through — this was partially fixed but may still occur on first login before the role is claimed.

### Desired Flow

```text
Register (/volunteer) → Confirm email → Sign in → Profile auto-created + role claimed
  → Dashboard shows "Application Under Review" screen (is_approved = false)
  → Admin approves or rejects
    → Approved: in-app notification → volunteer refreshes/revisits → full dashboard
    → Rejected: in-app notification with reason → "Application Denied" screen
```

### Changes

#### 1. Database: Add `rejection_reason` column to `volunteer_profiles`
- Add nullable `rejection_reason TEXT` column.
- Update `admin_set_volunteer_approval` RPC to accept an optional rejection reason and store it when denying.

#### 2. Database: Add rejection notification trigger
- Extend the existing `notify_volunteer_approved` trigger function to also fire on rejection, including the reason in the notification body.

#### 3. `VolunteerDashboard.tsx` — Add approval gate UI
- After loading, check `volProfile.is_approved`:
  - If `false` and no `rejection_reason`: show "Application Under Review" pending screen with a message like "Your application is being reviewed by our team."
  - If `false` and has `rejection_reason`: show "Application Not Approved" screen with the reason displayed.
  - If `true`: show the full dashboard (current behavior).

#### 4. `AdminVolunteersPage.tsx` — Add rejection reason input
- When admin clicks "Reject" (currently "Revoke"), show a text input/dialog for the rejection reason.
- Pass the reason to the updated RPC.
- Add a dedicated "Reject" button for pending volunteers (separate from "Revoke" for approved ones).

#### 5. `VolunteerAuth.tsx` — Show confirmation message after signup
- After signup + onboarding info submitted, show a clear "Application Submitted" message instead of navigating to the dashboard.
- On sign-in, navigate to `/app/volunteer` where the approval gate will handle the display.

#### 6. `ProtectedRoute.tsx` — No changes needed
- Already skips seeker onboarding for volunteers.

### Files to Change

| File | Change |
|------|--------|
| **DB migration** | Add `rejection_reason` column; update `admin_set_volunteer_approval` RPC to accept reason; update `notify_volunteer_approved` trigger to handle rejections |
| `src/pages/app/VolunteerDashboard.tsx` | Add approval gate: pending screen, rejected screen, or full dashboard based on `is_approved` and `rejection_reason` |
| `src/pages/admin/AdminVolunteersPage.tsx` | Add rejection reason input dialog; add "Reject" button for pending volunteers |
| `src/pages/VolunteerAuth.tsx` | Show "Application Submitted" confirmation after signup completes |


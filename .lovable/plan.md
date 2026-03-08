

## Problem Analysis

The anonymous sign-in flow is routing seekers to the **Volunteer Dashboard** ("Application Under Review" screen). The screenshot confirms `role === "volunteer"` because the bottom nav shows "Hub" instead of "Journal".

**Root causes:**

1. **No session cleanup before anonymous sign-in**: `Auth.tsx` calls `signInAnonymously()` without first signing out any existing session. If the user previously signed in as a volunteer, Supabase may reuse or conflict with that session.

2. **No auth guard on the Auth page**: The `/auth` page doesn't redirect already-authenticated users. A user who is already signed in (from a previous volunteer session) can interact with the auth page while their old session persists.

3. **Race condition in ProtectedRoute**: After anonymous sign-in, the user navigates to `/onboarding`. If the old session's role (`volunteer`) is still cached in AuthContext, `ProtectedRoute` allows access to volunteer paths and `BottomTabBar` renders the "Hub" tab.

## Plan

### 1. Add sign-out before anonymous sign-in (`Auth.tsx`)
- In `handleAnonymous`, call `supabase.auth.signOut()` before `signInAnonymously()` to ensure any stale session (volunteer or otherwise) is fully cleared.
- This guarantees a fresh anonymous user is created every time.

### 2. Add authenticated-user redirect on Auth page (`Auth.tsx`)
- At the top of the component, check if `user` is already set (from AuthContext). If so, redirect to `/app` (or `/app/volunteer` if role is volunteer) instead of showing the auth form. This prevents interaction with the form while a session exists.

### 3. Clear auth state before sign-out in `handleAnonymous`
- Also clear `localStorage` items (`echo_volunteer_pending`) and reset AuthContext state to prevent role bleed-through.

### Technical details

**File: `src/pages/Auth.tsx`**

```typescript
// Add redirect for already-authenticated users
const { user: existingUser } = useAuth();
if (existingUser) {
  return <Navigate to="/app" replace />;
}

// In handleAnonymous, sign out first:
const handleAnonymous = async () => {
  if (!consent) { ... }
  setSubmitting(true);
  try {
    localStorage.removeItem("echo_volunteer_pending");
    // Sign out any existing session first
    await supabase.auth.signOut();
    await signInAnonymously();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await recordConsent(user.id);
    navigate("/onboarding");
  } catch ...
};
```

This ensures:
- Stale volunteer sessions can't bleed into anonymous sign-in
- Already-authenticated users are redirected away from the auth page
- Each anonymous entry creates a genuinely new user


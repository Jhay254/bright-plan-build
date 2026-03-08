

## Problem

Chicken-and-egg situation: `akivaga.jf@gmail.com` (user ID `aca4a504-aee6-4997-af76-94092c81144c`) has signed up but needs email verification. However, this is the designated admin account — it can't verify itself through normal flow.

## Plan

Two database operations via migrations:

1. **Confirm the email directly** — Update `auth.users` to set `email_confirmed_at = now()` for this specific user so they can sign in immediately.

2. **Assign the admin role** — Insert the `admin` role into `user_roles` for this user.

### SQL Migration

```sql
-- Confirm email for the admin account
UPDATE auth.users
SET email_confirmed_at = now(),
    updated_at = now()
WHERE id = 'aca4a504-aee6-4997-af76-94092c81144c';

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('aca4a504-aee6-4997-af76-94092c81144c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

After this, `akivaga.jf@gmail.com` can sign in at `/auth` and access the admin panel at `/admin`.


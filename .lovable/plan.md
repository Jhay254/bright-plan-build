

## Plan: Remove Dark Theme

Five files to touch:

1. **`src/index.css`** — Delete the `.dark { ... }` block (~lines 68-88)
2. **`tailwind.config.ts`** — Remove `darkMode: ["class"]` (line 5)
3. **`src/main.tsx`** — Remove `ThemeProvider` wrapper entirely (or force light-only)
4. **`src/components/profile/ThemeToggle.tsx`** — Delete file
5. **`src/pages/app/ProfilePage.tsx`** — Remove `ThemeToggle` import and usage


/**
 * Test User Seeding
 *
 * This module seeds test users via the Supabase Admin API using the
 * service role key. It's called from `global-setup.ts` before tests run.
 *
 * Requirements:
 * - SUPABASE_URL env var (or falls back to VITE_SUPABASE_URL in .env)
 * - SUPABASE_SERVICE_ROLE_KEY env var (required for admin operations)
 *
 * If service role key is not available, tests will skip seeding and
 * assume users already exist (manual setup).
 */

import { TEST_SEEKER, TEST_VOLUNTEER, TEST_ADMIN } from "./auth";

interface SeedUser {
  email: string;
  password: string;
  role?: "seeker" | "volunteer" | "admin";
}

const SEED_USERS: SeedUser[] = [
  { ...TEST_SEEKER, role: "seeker" },
  { ...TEST_VOLUNTEER, role: "volunteer" },
  { ...TEST_ADMIN, role: "admin" },
];

export async function seedTestUsers() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://redbpniknprlcyxohysn.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      "⚠️  SUPABASE_SERVICE_ROLE_KEY not set — skipping test user seeding.\n" +
        "   Create test users manually or set the env var for CI."
    );
    return;
  }

  for (const user of SEED_USERS) {
    try {
      // Try to create the user via Supabase Admin API
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          email_confirm: true, // auto-confirm for test users
        }),
      });

      const data = await createRes.json();

      if (createRes.ok) {
        console.log(`✅ Created test user: ${user.email} (${user.role})`);

        // Set role if not seeker (seeker is default)
        if (user.role && user.role !== "seeker" && data.id) {
          await setUserRole(supabaseUrl, serviceRoleKey, data.id, user.role);
        }

        // Mark onboarding complete for non-anonymous test users
        if (data.id) {
          await markOnboardingComplete(supabaseUrl, serviceRoleKey, data.id);
        }
      } else if (data?.msg?.includes("already been registered") || data?.message?.includes("already been registered")) {
        console.log(`ℹ️  Test user already exists: ${user.email}`);
      } else {
        console.warn(`⚠️  Failed to create ${user.email}:`, data);
      }
    } catch (err) {
      console.warn(`⚠️  Error seeding ${user.email}:`, err);
    }
  }
}

async function setUserRole(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  role: string
) {
  // Use the REST API to insert into user_roles
  const res = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ user_id: userId, role }),
  });

  if (res.ok) {
    console.log(`   → Set role '${role}' for ${userId}`);
  }

  // For volunteers, also create a volunteer_profiles entry
  if (role === "volunteer") {
    await fetch(`${supabaseUrl}/rest/v1/volunteer_profiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id: userId,
        is_approved: true,
        motivation: "E2E test volunteer",
        languages: ["en"],
        specialisations: ["Anxiety", "Stress"],
      }),
    });
  }
}

async function markOnboardingComplete(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string
) {
  await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ onboarding_complete: true }),
  });
}

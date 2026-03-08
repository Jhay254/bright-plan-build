import { seedTestUsers } from "./helpers/seed";

export default async function globalSetup() {
  console.log("\n🌱 Seeding test users...\n");
  await seedTestUsers();
  console.log("\n✅ Global setup complete.\n");
}

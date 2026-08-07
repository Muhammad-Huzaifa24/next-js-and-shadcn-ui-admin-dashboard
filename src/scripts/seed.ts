/**
 * seed.ts — Inserts the admin user for local development.
 *
 * Can be run two ways:
 *  1. Standalone:  ts-node src/scripts/seed.ts
 *  2. On startup:  imported and called by instrumentation.ts automatically
 *
 * Security: skips silently in production so it can never touch live data.
 */

import User from '@/models/User';

/**
 * Creates the default admin user if one doesn't already exist.
 * Safe to call on every startup — exits early if user is found.
 */
export async function seedAdminUser() {
  // Never seed in production
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const email = 'admin@studio.local';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('ℹ  Admin user already exists — skipping seed');
    return;
  }

  await User.create({
    name: 'Admin',
    email,
    passwordHash: 'Admin123!', // plaintext — pre-save hook hashes with bcrypt cost 12
    role: 'administrator',
    isActive: true,
  });

  console.log('✓ Admin user seeded');
  console.log('  email   : admin@studio.local');
  console.log('  password: Admin123!');
  console.log('  ⚠  Change this password after first login.');
}

// ─── Standalone execution ─────────────────────────────────────────────────────
// Only runs when called directly: ts-node src/scripts/seed.ts
if (require.main === module) {
  (async () => {
    // Dynamically import since we're in a .ts file
    const { config } = await import('dotenv');
    const mongoose = await import('mongoose');
    const { connectDB } = await import('@/lib/db');

    config(); // Load .env.local

    if (process.env.NODE_ENV === 'production') {
      console.error('[SEED BLOCKED] Cannot seed in production.');
      process.exit(1);
    }

    try {
      await connectDB();
      console.log('✓ MongoDB connected');

      await seedAdminUser();

      await mongoose.connection.close();
      console.log('✓ Seed complete');
      process.exit(0);
    } catch (err) {
      console.error('Seed error:', (err as Error).message);
      process.exit(1);
    }
  })();
}

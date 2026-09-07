require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured in .env');
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@messmate.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_NAME || 'MessMate Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '9876543210';

  console.log(`[Admin Seeder] Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);

  let admin = await User.findOne({ email: adminEmail }).select('+password');

  if (admin) {
    console.log(`[Admin Seeder] Found existing user for ${adminEmail}. Updating to Admin role...`);
    admin.name = adminName;
    admin.phone = adminPhone;
    admin.role = 'admin';
    admin.status = 'active';
    admin.isActive = true;
    admin.isEmailVerified = true;
    admin.password = adminPassword; // Triggers pre-save bcrypt hash
    await admin.save();
    console.log(`[Admin Seeder] ✅ Admin user updated successfully: ${adminEmail}`);
  } else {
    console.log(`[Admin Seeder] Creating new Admin user: ${adminEmail}...`);
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phone: adminPhone,
      role: 'admin',
      status: 'active',
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`[Admin Seeder] ✅ Admin user created successfully: ${adminEmail}`);
  }

  console.log('----------------------------------------------------');
  console.log(`🔑 Admin Credentials:`);
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('----------------------------------------------------');
}

seedAdmin()
  .catch((error) => {
    console.error(`[Admin Seeder Error]: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log(`[Admin Seeder] Disconnected from database.`);
  });

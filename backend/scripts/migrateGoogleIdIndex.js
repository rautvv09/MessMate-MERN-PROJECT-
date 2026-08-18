require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

async function migrateGoogleIdIndex() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Sparse indexes include documents where the field is explicitly null. Remove
  // legacy nulls so local email/password accounts are not added to this index.
  const result = await User.updateMany({ googleId: null }, { $unset: { googleId: 1 } });

  const indexes = await User.collection.indexes();
  const googleIdIndexes = indexes.filter((index) => index.key.googleId === 1);
  await Promise.all(googleIdIndexes.map((index) => User.collection.dropIndex(index.name)));

  await User.collection.createIndex(
    { googleId: 1 },
    { unique: true, sparse: true, name: 'googleId_1' }
  );

  console.log(`Removed googleId from ${result.modifiedCount} local account(s) and rebuilt the sparse unique index.`);
}

migrateGoogleIdIndex()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

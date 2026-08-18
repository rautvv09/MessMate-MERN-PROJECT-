const mongoose = require('mongoose');
const dns = require('dns');

const dnsServers = (process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8')
  ?.split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers?.length) {
  dns.setServers(dnsServers);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Fix googleId sparse unique index
    try {
      const User = require('../models/User');
      await User.updateMany({ googleId: null }, { $unset: { googleId: 1 } });
      const indexes = await User.collection.indexes().catch(() => []);
      const googleIdIndexes = indexes.filter((index) => index.key.googleId === 1);
      
      const needsRebuild = googleIdIndexes.length === 0 || !googleIdIndexes.some(i => i.sparse);
      
      if (needsRebuild) {
        if (googleIdIndexes.length > 0) {
          await Promise.all(googleIdIndexes.map((index) => User.collection.dropIndex(index.name)));
        }
        await User.collection.createIndex(
          { googleId: 1 },
          { unique: true, sparse: true, name: 'googleId_1' }
        );
        console.log('Fixed googleId index successfully');
      }
    } catch (indexErr) {
      console.error('Error fixing googleId index:', indexErr.message);
    }

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error after initial connect: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error(`MongoDB Initial Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

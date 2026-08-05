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

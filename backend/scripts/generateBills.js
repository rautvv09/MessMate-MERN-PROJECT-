require('dotenv').config();

const mongoose = require('mongoose');
const { generateAllMonthlyBills } = require('../jobs/monthlyBillingJob');

async function triggerMonthlyBilling() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured in .env');
  }

  const now = new Date();
  const year = parseInt(process.env.BILL_YEAR, 10) || now.getFullYear();
  const month = parseInt(process.env.BILL_MONTH, 10) || (now.getMonth() + 1);

  console.log(`[Manual Billing Trigger] Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);

  console.log(`[Manual Billing Trigger] Generating monthly bills for ${year}/${month}...`);
  const summary = await generateAllMonthlyBills(year, month);

  console.log('----------------------------------------------------');
  console.log(`📊 Bill Generation Results (${year}/${month}):`);
  console.log(`   Generated: ${summary.successCount}`);
  console.log(`   Skipped:   ${summary.skippedCount} (already existing)`);
  console.log(`   Errors:    ${summary.errorCount}`);
  console.log('----------------------------------------------------');
}

triggerMonthlyBilling()
  .catch((error) => {
    console.error(`[Manual Billing Trigger Error]:`, error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log(`[Manual Billing Trigger] Disconnected from database.`);
  });

require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");
const scheduleAttendanceReminder = require('./jobs/attendanceReminderJob');
const { scheduleMonthlyBilling } = require('./jobs/monthlyBillingJob');

connectDB();

// Initialize cron jobs
scheduleAttendanceReminder();
scheduleMonthlyBilling();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

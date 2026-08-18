const transporter = require('../config/mailer');
const config = require('../config/env');
const { attendanceReminderTemplate } = require('./emailTemplates');

const sendAttendanceReminder = async (ownerEmail, ownerName, messName, messId) => {
  const baseUrl = config.frontendUrl || config.clientUrl;
  const dashboardUrl = `${baseUrl}/owner/messes/${messId}/attendance`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: ownerEmail,
    subject: `Reminder: Mark Today's Attendance - ${messName}`,
    html: attendanceReminderTemplate(ownerName, messName, dashboardUrl),
  });
};

module.exports = sendAttendanceReminder;

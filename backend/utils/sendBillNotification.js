const transporter = require('../config/mailer');
const config = require('../config/env');
const { billNotificationTemplate, ownerBillNotificationTemplate } = require('./emailTemplates');

const sendBillNotification = async (
  studentEmail,
  studentName,
  messName,
  billNumber,
  totalAmount,
  dueDate,
  ownerEmail = null,
  ownerName = null
) => {
  const baseUrl = config.frontendUrl || config.clientUrl;
  const studentDashboardUrl = `${baseUrl}/my-bills`;
  const ownerDashboardUrl = `${baseUrl}/owner/billing`;

  // 1. Send email to Student
  await transporter.sendMail({
    from: config.smtp.from,
    to: studentEmail,
    subject: `New Bill Generated - ${messName}`,
    html: billNotificationTemplate(studentName, messName, billNumber, totalAmount, dueDate, studentDashboardUrl),
  });

  // 2. Send email to Mess Owner (if details provided)
  if (ownerEmail && ownerName) {
    try {
      await transporter.sendMail({
        from: config.smtp.from,
        to: ownerEmail,
        subject: `Monthly Bill Generated (${billNumber}) - ${studentName}`,
        html: ownerBillNotificationTemplate(ownerName, studentName, messName, billNumber, totalAmount, dueDate, ownerDashboardUrl),
      });
    } catch (err) {
      console.error('Failed to send bill email to mess owner:', err.message);
    }
  }
};

module.exports = sendBillNotification;

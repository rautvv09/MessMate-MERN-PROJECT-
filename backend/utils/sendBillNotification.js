const transporter = require('../config/mailer');
const config = require('../config/env');
const { billNotificationTemplate } = require('./emailTemplates');

const sendBillNotification = async (studentEmail, studentName, messName, billNumber, totalAmount, dueDate) => {
  const baseUrl = config.frontendUrl || config.clientUrl;
  const dashboardUrl = `${baseUrl}/my-bills`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: studentEmail,
    subject: `New Bill Generated - ${messName}`,
    html: billNotificationTemplate(studentName, messName, billNumber, totalAmount, dueDate, dashboardUrl),
  });
};

module.exports = sendBillNotification;

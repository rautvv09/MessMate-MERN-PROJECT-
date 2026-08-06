const transporter = require('../config/mailer');
const config = require('../config/env');
const { accountLockedEmailTemplate } = require('./emailTemplates');

const sendAccountLockedEmail = async (toEmail, name) => {
  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: 'Security alert: MessMate account temporarily locked',
    html: accountLockedEmailTemplate(name),
  });
};

module.exports = sendAccountLockedEmail;
const transporter = require('../config/mailer');
const config = require('../config/env');
const { passwordResetEmailTemplate } = require('./emailTemplates');

const sendPasswordResetEmail = async (toEmail, name, rawToken) => {
  const baseUrl = config.frontendUrl || config.clientUrl;
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: 'Reset your MessMate password',
    html: passwordResetEmailTemplate(name, resetUrl),
  });
};

module.exports = sendPasswordResetEmail;
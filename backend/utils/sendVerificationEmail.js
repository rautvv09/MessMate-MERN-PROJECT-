const transporter = require('../config/mailer');
const config = require('../config/env');
const { verificationEmailTemplate } = require('./emailTemplates');

const sendVerificationEmail = async (toEmail, name, rawToken) => {
  const baseUrl = config.frontendUrl || config.clientUrl;
  const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: 'Verify your MessMate email',
    html: verificationEmailTemplate(name, verifyUrl),
  });
};

module.exports = sendVerificationEmail;
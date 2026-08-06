const nodemailer = require('nodemailer');
const config = require('./env');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure, // true for port 465, false for port 587 (STARTTLS)
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

// Verify the SMTP connection once, at server startup — fail loudly and immediately
// if credentials are wrong, rather than only discovering it the first time a real
// student tries to register and the verification email silently never arrives
transporter.verify((error) => {
  if (error) {
    console.error('SMTP configuration error — emails will not send:', error.message);
  } else {
    console.log('SMTP transporter ready to send emails');
  }
});

module.exports = transporter;
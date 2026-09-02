const baseTemplate = (title, bodyHtml, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family: -apple-system, Segoe UI, Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:#10b981; padding:24px 32px;">
              <span style="color:#ffffff; font-size:20px; font-weight:700;">MessMate</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:18px; color:#111827; margin:0 0 16px;">${title}</h1>
              <div style="font-size:14px; color:#4b5563; line-height:1.6;">${bodyHtml}</div>
              ${buttonText ? `
              <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="border-radius:8px; background:#10b981;">
                    <a href="${buttonUrl}" style="display:inline-block; padding:12px 24px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600;">${buttonText}</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:12px; color:#9ca3af; margin-top:16px;">
                Or copy this link into your browser:<br/>
                <span style="word-break:break-all;">${buttonUrl}</span>
              </p>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; background:#f9fafb; border-top:1px solid #f3f4f6;">
              <p style="font-size:12px; color:#9ca3af; margin:0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

exports.verificationEmailTemplate = (name, verifyUrl) =>
  baseTemplate(
    `Hi ${name}, verify your email`,
    `Thanks for signing up for MessMate! Please confirm your email address to activate your account. This link expires in 24 hours.`,
    'Verify Email',
    verifyUrl
  );

exports.passwordResetEmailTemplate = (name, resetUrl) =>
  baseTemplate(
    `Hi ${name}, reset your password`,
    `We received a request to reset your MessMate password. This link expires in 1 hour. If you didn't request this, your account is still secure — no action is needed.`,
    'Reset Password',
    resetUrl
  );

exports.accountLockedEmailTemplate = (name) =>
  baseTemplate(
    `Security alert for your account`,
    `Hi ${name}, we noticed several failed login attempts on your MessMate account and have temporarily locked it as a precaution. If this wasn't you, consider resetting your password once the lock expires.`,
    null,
    null
  );

exports.billNotificationTemplate = (studentName, messName, billNumber, totalAmount, dueDate, dashboardUrl) =>
  baseTemplate(
    `New Bill Generated`,
    `
    <p>Hi ${studentName},</p>
    <p>A new monthly bill (<strong>${billNumber}</strong>) has been generated for you by <strong>${messName}</strong>.</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
      <p style="margin: 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
    </div>
    <p>You can view the detailed breakdown and download the PDF invoice from your dashboard.</p>
    `,
    'View My Bills',
    dashboardUrl
  );

exports.ownerBillNotificationTemplate = (ownerName, studentName, messName, billNumber, totalAmount, dueDate, dashboardUrl) =>
  baseTemplate(
    `Monthly Bill Generated - ${billNumber}`,
    `
    <p>Hi ${ownerName},</p>
    <p>A new monthly bill (<strong>${billNumber}</strong>) of <strong>₹${totalAmount.toFixed(2)}</strong> has been generated for student <strong>${studentName}</strong> at <strong>${messName}</strong>.</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Student:</strong> ${studentName}</p>
      <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
      <p style="margin: 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
    </div>
    <p>You can manage and track payments for all generated bills in your owner billing dashboard.</p>
    `,
    'View Billing Dashboard',
    dashboardUrl
  );

exports.attendanceReminderTemplate = (ownerName, messName, dashboardUrl) =>
  baseTemplate(
    `Attendance Reminder`,
    `
    <p>Hi ${ownerName},</p>
    <p>This is an automated reminder to mark today's attendance for <strong>${messName}</strong>.</p>
    <p>Keeping attendance updated daily ensures accurate billing for your students at the end of the month.</p>
    `,
    'Mark Attendance Now',
    dashboardUrl
  );
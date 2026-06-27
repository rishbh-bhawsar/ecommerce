const { EmailTemplate } = require('../models');
const { sendEmail } = require('../utils/mailer');

const baseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#3f51b5;padding:20px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">E-Commerce Store</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f4f4f4;padding:15px;text-align:center;font-size:12px;color:#999;">
              <p style="margin:0;">This is an automated email. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const replaceVariables = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value !== null && value !== undefined ? value : '');
  }
  return result;
};

const sendTemplatedEmail = async (event, recipientEmail, variables = {}) => {
  try {
    console.log(`Attempting to send email: event=${event}, to=${recipientEmail}`);

    if (!recipientEmail) {
      console.error('Email error: No recipient email provided');
      return false;
    }

    const template = await EmailTemplate.findOne({
      where: { event, isActive: true },
    });

    if (!template) {
      console.error(`No active email template found for event: ${event}`);
      return false;
    }

    console.log(`Template found: ${template.name} (ID: ${template.id})`);

    const subject = replaceVariables(template.subject, variables);
    const htmlContent = replaceVariables(template.htmlTemplate, variables);
    const html = baseLayout(htmlContent);

    const result = await sendEmail(recipientEmail, subject, html);

    if (result) {
      console.log(`Templated email sent successfully: ${event} to ${recipientEmail}`);
    } else {
      console.error(`Failed to send templated email: ${event} to ${recipientEmail}`);
    }

    return result;
  } catch (error) {
    console.error('Send templated email error:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

module.exports = {
  sendTemplatedEmail,
  replaceVariables,
  baseLayout,
};

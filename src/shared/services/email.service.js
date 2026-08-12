// *************** IMPORT LIBRARY ***************
const NodeMailer = require('nodemailer');

// *************** IMPORT MODULE ***************
const config = require('../../core/config');

// *************** GLOBAL VARIABLES ***************
const transporter = NodeMailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

/**
 * Sends an HTML email through the configured SMTP transport.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} htmlBody - HTML content of the email.
 * @returns {Promise<Object>} Nodemailer send result.
 */
async function SendEmail(to, subject, htmlBody) {
  try {
    const mailOptions = {
      from: `'My Application' <${config.smtp.user}>`,
      to,
      subject,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  SendEmail,
};

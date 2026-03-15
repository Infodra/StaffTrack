const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendPasswordEmail = async (toEmail, employeeName, newPassword) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"StaffTrack" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'StaffTrack - Your Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">StaffTrack</h1>
          <p style="color: #6B7280; margin: 5px 0 0;">GPS Attendance System</p>
        </div>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 24px; border: 1px solid #E5E7EB;">
          <h2 style="color: #111827; margin-top: 0;">Password Reset</h2>
          <p style="color: #374151;">Hello <strong>${employeeName}</strong>,</p>
          <p style="color: #374151;">Your password has been reset. Here is your new password:</p>
          <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
            <code style="font-size: 18px; color: #4F46E5; letter-spacing: 2px;">${newPassword}</code>
          </div>
          <p style="color: #374151;">Please login with this password and change it at your earliest convenience.</p>
          <p style="color: #DC2626; font-size: 14px;"><strong>Do not share this password with anyone.</strong></p>
        </div>
        <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 20px;">
          &copy; 2026 StaffTrack by Infodra Technologies. All rights reserved.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordEmail };

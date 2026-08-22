const nodemailer = require('nodemailer');

/**
 * Create a reusable Nodemailer transporter.
 * Fails gracefully if email config is missing.
 */
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email config incomplete. Email features will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a low-attendance warning email to a student.
 * @param {Object} params
 * @param {string} params.to - student email
 * @param {string} params.studentName
 * @param {string} params.courseName
 * @param {number} params.attendancePercent
 */
const sendLowAttendanceEmail = async ({ to, studentName, courseName, attendancePercent }) => {
  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, error: 'Email service not configured' };
  }

  const from = process.env.EMAIL_FROM || 'QuickPass <noreply@quickpass.dev>';

  const html = `
    <div style="font-family: 'Source Sans Pro', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f7fb; padding: 24px; border-radius: 12px;">
      <div style="background: #0d0f12; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚡ QuickPass</h1>
        <p style="color: #888; margin: 4px 0 0;">Attendance Alert</p>
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #c1cbdb;">
        <h2 style="color: #0d0f12; margin-top: 0;">Hi ${studentName},</h2>
        <p style="color: #444; line-height: 1.6;">
          This is an automated alert regarding your attendance in <strong>${courseName}</strong>.
        </p>
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-weight: 600;">
            ⚠️ Your current attendance is <span style="font-size: 20px;">${attendancePercent.toFixed(1)}%</span>
          </p>
          <p style="margin: 8px 0 0; color: #856404;">Minimum required: 75%</p>
        </div>
        <p style="color: #444; line-height: 1.6;">
          Please make sure to attend upcoming classes to avoid academic consequences. 
          Log in to <strong>QuickPass</strong> to view your detailed attendance report.
        </p>
        <a href="#" style="display: inline-block; background: #0056d2; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 8px;">
          View My Attendance
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
          This is an automated email from QuickPass. Please do not reply.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `⚠️ Low Attendance Alert: ${courseName}`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendLowAttendanceEmail };

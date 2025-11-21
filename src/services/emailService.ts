import nodemailer from 'nodemailer';
import { Config } from '../types';

/**
 * Sends an email notification
 */
export async function sendEmail(
  config: Config,
  subject: string,
  body: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: config.email.to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    console.log(`Email sent: ${subject}`);
  } catch (error: any) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

/**
 * Creates a formatted email body for usage notification
 */
export function formatUsageEmail(
  currentSession: number,
  weeklyAllModels: number,
  weeklyOpus: number,
  reason: string
): string {
  return `
Claude Code Usage Alert
========================

${reason}

Current Usage:
--------------
• Current Session: ${currentSession}%
• Weekly (All Models): ${weeklyAllModels}%
• Weekly (Opus): ${weeklyOpus}%

Timestamp: ${new Date().toLocaleString()}

---
This is an automated notification from Claude Usage Monitor
`.trim();
}

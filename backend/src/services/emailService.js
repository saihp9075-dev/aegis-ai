import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { escapeHtml } from '../utils/htmlEscape.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.email.user || !config.email.pass) return null;
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: { user: config.email.user, pass: config.email.pass },
    connectionTimeout: 14_000,
    greetingTimeout: 14_000,
    socketTimeout: 26_000,
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) return { ok: false, status: 'skipped', error: 'Email not configured' };
  const deadlineMs = 32_000;
  try {
    await Promise.race([
      t.sendMail({
        from: config.email.from,
        to,
        subject,
        text: text || subject,
        html: html || `<pre>${escapeHtml(text || subject)}</pre>`,
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Email send timed out after ${deadlineMs / 1000}s`)), deadlineMs);
      }),
    ]);
    return { ok: true, status: 'sent' };
  } catch (e) {
    return { ok: false, status: 'failed', error: e.message };
  }
}

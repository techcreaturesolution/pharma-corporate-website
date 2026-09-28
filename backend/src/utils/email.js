import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });
  return transporter;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fire-and-forget email with retry. Never throws: a failed notification must not
 * cause an already-saved enquiry or application to be reported as failed.
 */
export const sendEmail = async ({ to, subject, html, text, attempts = 3 }) => {
  const transport = getTransporter();
  if (!transport || !to) {
    if (!env.isProd) console.log(`[email skipped] to=${to || '-'} subject="${subject}"`);
    return false;
  }
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await transport.sendMail({ from: env.smtp.from, to, subject, html, text });
      return true;
    } catch (err) {
      console.error(`[email] attempt ${attempt}/${attempts} failed for "${subject}": ${err.message}`);
      if (attempt < attempts) await sleep(1000 * attempt);
    }
  }
  return false;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const renderTable = (rows) =>
  `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="border:1px solid #ddd;font-weight:bold">${escapeHtml(label)}</td><td style="border:1px solid #ddd">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>`;

// src/config/email.ts
import nodemailer from 'nodemailer';
import { env, serviceStatus } from './env';

let cachedTransporter: nodemailer.Transporter | null = null;

interface SmtpErrorLike {
  code?: string;
  responseCode?: number;
  command?: string;
  message?: string;
}

export function formatSmtpErrorMessage(err: unknown): string {
  const smtpErr = (err ?? {}) as SmtpErrorLike;
  const code = smtpErr.code || '';
  const responseCode = smtpErr.responseCode;

  if (code === 'EAUTH' || responseCode === 535) {
    return 'SMTP authentication failed (535). Verify SMTP_USER is your full Gmail address and SMTP_PASSWORD is a valid 16-character Google App Password (with 2-Step Verification enabled).';
  }
  if (code === 'ECONNECTION' || code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
    return `Unable to connect to SMTP server (${env.smtpHost}:${env.smtpPort}). Check SMTP_HOST, SMTP_PORT, and network connectivity.`;
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKET') {
    return `SMTP connection timed out (${env.smtpHost}:${env.smtpPort}). Check firewall or port 587 STARTTLS access.`;
  }

  return 'Email delivery failed due to an SMTP server error.';
}

export function getMailTransporter(): nodemailer.Transporter | null {
  if (!serviceStatus.hasSmtp) {
    return null;
  }

  if (!cachedTransporter) {
    const isImplicitTls = env.smtpPort === 465;
    cachedTransporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: isImplicitTls,
      requireTLS: !isImplicitTls,
      tls: {
        minVersion: 'TLSv1.2',
      },
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    });
  }

  return cachedTransporter;
}

export async function verifyMailTransporter(): Promise<boolean> {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn('[PrepAI Mail] SMTP is not configured; email delivery is disabled.');
    return false;
  }

  try {
    await transporter.verify();
    console.log(
      `[PrepAI Mail] SMTP transporter verified (${env.smtpHost}:${env.smtpPort}, secure=${env.smtpPort === 465}, STARTTLS=${env.smtpPort !== 465}).`
    );
    return true;
  } catch (err) {
    const smtpErr = (err ?? {}) as SmtpErrorLike;
    console.error(
      `[PrepAI Mail] SMTP verification failed (code=${smtpErr.code || 'UNKNOWN'}, responseCode=${smtpErr.responseCode ?? 'N/A'}): ${formatSmtpErrorMessage(err)}`
    );
    return false;
  }
}

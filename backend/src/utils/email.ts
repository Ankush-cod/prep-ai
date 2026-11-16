// src/utils/email.ts
import { env, serviceStatus } from '../config/env';
import { formatSmtpErrorMessage, getMailTransporter, getResendClient } from '../config/email';

export interface EmailSendResult {
  sent: boolean;
  reason?: string;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
}

export function resolveFromAddress(): string {
  // If using Resend, prefer valid EMAIL_FROM or default to Resend sandbox sender
  if (serviceStatus.hasResend) {
    if (env.emailFrom && !env.emailFrom.toLowerCase().includes('.local')) {
      return env.emailFrom;
    }
    return 'PrepAI <onboarding@resend.dev>';
  }

  // If explicitly configured with EMAIL_FROM, use it
  if (env.emailFrom && !env.emailFrom.toLowerCase().includes('.local')) {
    return env.emailFrom;
  }

  // Fallback for Gmail SMTP
  if (
    env.smtpHost.toLowerCase() === 'smtp.gmail.com' &&
    env.smtpUser &&
    (env.smtpFrom.toLowerCase().includes('.local') ||
      !env.smtpFrom.toLowerCase().includes(env.smtpUser.toLowerCase()))
  ) {
    return `PrepAI <${env.smtpUser}>`;
  }

  return env.smtpFrom || 'PrepAI <onboarding@resend.dev>';
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const fromAddress = resolveFromAddress();

  // 1. Primary: Resend API
  if (serviceStatus.hasResend) {
    const resend = getResendClient();
    if (!resend) {
      console.warn('[PrepAI Mail] Resend client could not be initialized.');
      return {
        sent: false,
        reason: 'RESEND_API_KEY is missing or invalid.',
      };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error(
          `[PrepAI Mail] Resend rejected "${options.subject}" for ${options.to}: ${error.message} (name=${error.name})`
        );
        return {
          sent: false,
          reason: error.message,
        };
      }

      const messageId = data?.id;
      console.log(
        `[PrepAI Mail] Resend accepted "${options.subject}" for ${options.to} (id=${messageId || 'N/A'}, from="${fromAddress}")`
      );

      return {
        sent: true,
        messageId,
        accepted: [options.to],
        rejected: [],
        response: `Resend accepted id=${messageId}`,
      };
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Resend delivery failed';
      console.error(
        `[PrepAI Mail] Resend exception sending "${options.subject}" to ${options.to}: ${reason}`
      );
      return {
        sent: false,
        reason,
      };
    }
  }

  // 2. Fallback: SMTP / Nodemailer (Brevo / Gmail)
  const transporter = getMailTransporter();
  if (transporter && serviceStatus.hasSmtp) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      const accepted = Array.isArray(info.accepted) ? info.accepted.map(String) : [];
      const rejected = Array.isArray(info.rejected) ? info.rejected.map(String) : [];
      const response = typeof info.response === 'string' ? info.response : '';
      const messageId = typeof info.messageId === 'string' ? info.messageId : undefined;

      if (accepted.length === 0 || rejected.length > 0) {
        console.error(
          `[PrepAI Mail] SMTP did not accept "${options.subject}" for ${options.to} (messageId=${messageId || 'N/A'}, accepted=${JSON.stringify(accepted)}, rejected=${JSON.stringify(rejected)}, response="${response}")`
        );
        return {
          sent: false,
          reason: 'SMTP server rejected the recipient address.',
          messageId,
          accepted,
          rejected,
          response,
        };
      }

      console.log(
        `[PrepAI Mail] SMTP accepted "${options.subject}" for ${options.to} (messageId=${messageId || 'N/A'}, accepted=${JSON.stringify(accepted)}, rejected=${JSON.stringify(rejected)}, response="${response}")`
      );

      return {
        sent: true,
        messageId,
        accepted,
        rejected,
        response,
      };
    } catch (err) {
      const reason = formatSmtpErrorMessage(err);
      const smtpErr = err as { code?: string; responseCode?: number } | undefined;
      console.error(
        `[PrepAI Mail] Failed to send "${options.subject}" to ${options.to} (code=${smtpErr?.code || 'UNKNOWN'}, responseCode=${smtpErr?.responseCode ?? 'N/A'}): ${reason}`
      );
      return {
        sent: false,
        reason,
      };
    }
  }

  // 3. No email provider configured
  console.warn(
    `[PrepAI Mail] Neither Resend nor SMTP is configured. Skipped sending "${options.subject}" to ${options.to}.`
  );
  return {
    sent: false,
    reason: 'Email delivery credentials (RESEND_API_KEY or SMTP) are not configured on the server.',
  };
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  rawToken: string
): Promise<EmailSendResult> {
  const verifyUrl = `${env.clientUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

  return sendMail({
    to: email,
    subject: 'Verify your PrepAI account email',
    text: `Hello ${fullName},\n\nPlease verify your PrepAI email address by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #121317; color: #e3e2e8; padding: 28px; border-radius: 12px; border: 1px solid #292a2e;">
        <h2 style="color: #ffffff; margin-top: 0;">Verify your PrepAI email</h2>
        <p style="color: #cbc3d7; font-size: 14px; line-height: 1.6;">Hello ${fullName},</p>
        <p style="color: #cbc3d7; font-size: 14px; line-height: 1.6;">Confirm your email address to activate your PrepAI engineering workspace.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; display: inline-block;">Verify Email Address</a>
        </p>
        <p style="color: #958ea0; font-size: 12px;">If the button does not work, copy this link: ${verifyUrl}</p>
        <p style="color: #958ea0; font-size: 12px;">This verification link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  rawToken: string
): Promise<EmailSendResult> {
  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  return sendMail({
    to: email,
    subject: 'Reset your PrepAI password',
    text: `Hello ${fullName},\n\nReset your PrepAI password using this link:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #121317; color: #e3e2e8; padding: 28px; border-radius: 12px; border: 1px solid #292a2e;">
        <h2 style="color: #ffffff; margin-top: 0;">Reset your PrepAI password</h2>
        <p style="color: #cbc3d7; font-size: 14px; line-height: 1.6;">Hello ${fullName},</p>
        <p style="color: #cbc3d7; font-size: 14px; line-height: 1.6;">We received a request to reset your PrepAI password. Click below to choose a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
        </p>
        <p style="color: #958ea0; font-size: 12px;">If the button does not work, copy this link: ${resetUrl}</p>
        <p style="color: #958ea0; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(
  email: string,
  fullName: string
): Promise<EmailSendResult> {
  const dashboardUrl = `${env.clientUrl}/dashboard`;

  return sendMail({
    to: email,
    subject: 'Welcome to PrepAI – Your Technical Interview Workspace',
    text: `Hello ${fullName},\n\nWelcome to PrepAI! Your account is activated and ready for technical interview preparation.\n\nOpen your workspace: ${dashboardUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #121317; color: #e3e2e8; padding: 28px; border-radius: 12px; border: 1px solid #292a2e;">
        <h2 style="color: #ffffff; margin-top: 0;">Welcome to PrepAI!</h2>
        <p style="color: #cbc3d7; font-size: 14px; line-height: 1.6;">Hello ${fullName},</p>
        <p style="color: #cbc3d7; font-size: 14px; line-height: 1.6;">Your email has been verified and your engineering workspace is now fully activated. Practice adaptive verbal cross-examinations, solve company DSA questions, and run low-latency code execution.</p>
        <p style="margin: 24px 0;">
          <a href="${dashboardUrl}" style="background: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; display: inline-block;">Go to Workspace</a>
        </p>
        <p style="color: #958ea0; font-size: 12px;">Link: ${dashboardUrl}</p>
      </div>
    `,
  });
}

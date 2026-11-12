// src/utils/email.ts
import { env, serviceStatus } from '../config/env';
import { formatSmtpErrorMessage, getMailTransporter } from '../config/email';

export interface EmailSendResult {
  sent: boolean;
  reason?: string;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
}

function resolveFromAddress(): string {
  if (
    env.smtpHost.toLowerCase() === 'smtp.gmail.com' &&
    env.smtpUser &&
    (env.smtpFrom.toLowerCase().includes('.local') ||
      !env.smtpFrom.toLowerCase().includes(env.smtpUser.toLowerCase()))
  ) {
    return `PrepAI <${env.smtpUser}>`;
  }
  return env.smtpFrom;
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const transporter = getMailTransporter();
  if (!transporter || !serviceStatus.hasSmtp) {
    console.warn(
      `[PrepAI Mail] SMTP is not configured. Skipped sending "${options.subject}" to ${options.to}.`
    );
    return {
      sent: false,
      reason: 'SMTP credentials are not configured on the server.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: resolveFromAddress(),
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

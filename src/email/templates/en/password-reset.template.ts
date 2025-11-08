import { baseEmailTemplate } from '../base.template';

export const passwordResetTemplateEn = (resetLink: string) => ({
  subject: 'Reset your OrionixTrack password',
  text: `Hello,\nYou requested to reset your password. Click the link below: ${resetLink}\n\nIf you didn't request this, please ignore this email. This link is valid for 1 hour.`,
  html: baseEmailTemplate({
    preheader: 'Reset your password to regain access to your account',
    content: `
      <h2>Password Reset Request</h2>

      <p>We received a request to reset the password for your OrionixTrack account. Click the button below to create a new password:</p>

      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>

      <hr>

      <h3>Didn't request this?</h3>
      <p class="text-muted">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.</p>
    `,
  }),
});

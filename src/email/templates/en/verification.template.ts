import { baseEmailTemplate } from '../base.template';

export const verificationTemplateEn = (verificationLink: string) => ({
  subject: 'Verify your OrionixTrack account',
  text: `Hello,\nPlease verify your email address by visiting the link: ${verificationLink}\n\nIf you didn't create an account, please ignore this email.`,
  html: baseEmailTemplate({
    preheader: 'Verify your email to get started with OrionixTrack',
    content: `
      <h2>Welcome aboard!</h2>
      <p>Thank you for joining OrionixTrack. To complete your registration and start managing your fleet operations, please verify your email address.</p>

      <p style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </p>

      <p class="text-muted">If you didn't create an OrionixTrack account, please ignore this email and no action will be taken.</p>
    `,
  }),
});

import { baseEmailTemplate } from '../base.template';

export const welcomeTemplateEn = (companyName: string) => ({
  subject: 'Welcome to OrionixTrack!',
  text: `Welcome to OrionixTrack! Your company "${companyName}" has been successfully registered and verified. You can now log in and start managing your fleet operations.`,
  html: baseEmailTemplate({
    preheader: `Your ${companyName} account is ready to use`,
    content: `
      <h2>Welcome to OrionixTrack!</h2>

      <div class="success-box">
        <p style="margin: 0;"><strong>Account Verified!</strong> Your company <strong>${companyName}</strong> has been successfully registered and verified.</p>
      </div>
      
      <hr>

      <h3>Ready to get started?</h3>
      <p>Log in to your dashboard and explore the platform</p>

      <p class="text-muted" style="margin-top: 32px;">Thank you for choosing OrionixTrack to manage your fleet operations.</p>
    `,
  }),
});

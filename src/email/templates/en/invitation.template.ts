import { baseEmailTemplate } from '../base.template';

export const invitationTemplateEn = (
  invitationLink: string,
  companyName: string,
  role: string,
) => ({
  subject: `You're invited to join ${companyName} on OrionixTrack`,
  text: `Hello,\n\nYou've been invited to join ${companyName} as a ${role} on OrionixTrack. Click the link below to accept the invitation and create your account:\n\n${invitationLink}\n\nThis invitation link is valid for 24 hours. If you didn't expect this invitation, you can safely ignore this email.`,
  html: baseEmailTemplate({
    preheader: `Join ${companyName} on OrionixTrack`,
    content: `
      <h2>You're Invited!</h2>

      <p>You've been invited to join <strong>${companyName}</strong> as a <strong>${role}</strong> on OrionixTrack.</p>

      <div class="info-box">
        <p style="margin: 0;"><strong>What is OrionixTrack?</strong></p>
        <p style="margin: 8px 0 0 0;">OrionixTrack is an integrated fleet operations platform that helps transportation companies manage their daily operations efficiently and reliably.</p>
      </div>

      <p>Click the button below to accept the invitation and set up your account:</p>

      <p style="text-align: center;">
        <a href="${invitationLink}" class="button">Accept Invitation</a>
      </p>

      <hr>

      <h3>What's next?</h3>
      <p>After accepting the invitation, you'll be asked to:</p>
      <ul>
        <li>Provide your name</li>
        <li>Set a secure password</li>
        <li>Choose your preferred language</li>
      </ul>
    `,
  }),
});

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailProvider } from './email.provider.interface';
import { EMAIL_PROVIDER_TOKEN } from './email.provider.interface';
import { EmailTemplateService } from './email-template.service';
import { UserLanguage } from '../common/types/UserLanguage';

@Injectable()
export class EmailService {
  private readonly frontendUrl: string;

  constructor(
    @Inject(EMAIL_PROVIDER_TOKEN)
    private readonly emailProvider: EmailProvider,
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    language: UserLanguage,
  ): Promise<void> {
    const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    const { subject, html, text } =
      this.templateService.getVerificationTemplate(verificationLink, language);

    await this.emailProvider.sendEmail({ to: email, subject, html, text });
  }

  async sendWelcomeEmail(
    email: string,
    companyName: string,
    language: UserLanguage,
  ): Promise<void> {
    const { subject, html, text } = this.templateService.getWelcomeTemplate(
      companyName,
      language,
    );

    await this.emailProvider.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    language: UserLanguage,
  ): Promise<void> {
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    const { subject, html, text } =
      this.templateService.getPasswordResetTemplate(resetLink, language);

    await this.emailProvider.sendEmail({ to: email, subject, html, text });
  }

  async sendInvitationEmail(
    email: string,
    token: string,
    companyName: string,
    role: string,
    language: UserLanguage,
  ): Promise<void> {
    const invitationLink = `${this.frontendUrl}/auth/accept-invitation?token=${token}`;

    const { subject, html, text } = this.templateService.getInvitationTemplate(
      invitationLink,
      companyName,
      role,
      language,
    );

    await this.emailProvider.sendEmail({ to: email, subject, html, text });
  }
}

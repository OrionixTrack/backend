import { Injectable } from '@nestjs/common';
import { verificationTemplateEn } from './templates/en/verification.template';
import { verificationTemplateUk } from './templates/uk/verification.template';
import { welcomeTemplateEn } from './templates/en/welcome.template';
import { welcomeTemplateUk } from './templates/uk/welcome.template';
import { passwordResetTemplateEn } from './templates/en/password-reset.template';
import { passwordResetTemplateUk } from './templates/uk/password-reset.template';
import { invitationTemplateEn } from './templates/en/invitation.template';
import { invitationTemplateUk } from './templates/uk/invitation.template';
import { UserLanguage } from '../common/types/UserLanguage';

type EmailContent = { subject: string; html: string; text: string };

@Injectable()
export class EmailTemplateService {
  getVerificationTemplate(link: string, language: UserLanguage): EmailContent {
    switch (language) {
      case UserLanguage.UKRAINIAN:
        return verificationTemplateUk(link);
      case UserLanguage.ENGLISH:
      default:
        return verificationTemplateEn(link);
    }
  }

  getWelcomeTemplate(
    companyName: string,
    language: UserLanguage,
  ): EmailContent {
    switch (language) {
      case UserLanguage.UKRAINIAN:
        return welcomeTemplateUk(companyName);
      case UserLanguage.ENGLISH:
      default:
        return welcomeTemplateEn(companyName);
    }
  }

  getPasswordResetTemplate(link: string, language: UserLanguage): EmailContent {
    switch (language) {
      case UserLanguage.UKRAINIAN:
        return passwordResetTemplateUk(link);
      case UserLanguage.ENGLISH:
      default:
        return passwordResetTemplateEn(link);
    }
  }

  getInvitationTemplate(
    link: string,
    companyName: string,
    role: string,
    language: UserLanguage,
  ): EmailContent {
    switch (language) {
      case UserLanguage.UKRAINIAN:
        return invitationTemplateUk(link, companyName, role);
      case UserLanguage.ENGLISH:
      default:
        return invitationTemplateEn(link, companyName, role);
    }
  }
}

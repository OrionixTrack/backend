import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailjetProvider } from './mailjet.provider';
import { EMAIL_PROVIDER_TOKEN } from './email.provider.interface';
import { EmailTemplateService } from './email-template.service';

@Module({
  providers: [
    EmailService,
    EmailTemplateService,
    {
      provide: EMAIL_PROVIDER_TOKEN,
      useClass: MailjetProvider,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}

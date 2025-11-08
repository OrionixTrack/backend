import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailPayload, EmailProvider } from './email.provider.interface';
import * as Mailjet from 'node-mailjet';

@Injectable()
export class MailjetProvider implements EmailProvider {
  private readonly logger = new Logger(MailjetProvider.name);
  private mailjet: Mailjet.Client;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('MAILJET_API_KEY');
    const apiSecret =
      this.configService.getOrThrow<string>('MAILJET_SECRET_KEY');
    this.fromEmail =
      this.configService.getOrThrow<string>('MAILJET_FROM_EMAIL');
    this.fromName = this.configService.getOrThrow<string>('MAILJET_FROM_NAME');

    this.mailjet = new Mailjet.Client({ apiKey, apiSecret });
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    const { to, subject, html, text } = payload;

    const data: Mailjet.SendEmailV3_1.Body = {
      Messages: [
        {
          From: {
            Email: this.fromEmail,
            Name: this.fromName,
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    };

    try {
      await this.mailjet.post('send', { version: 'v3.1' }).request(data);
      this.logger.log(
        `Email successfully sent to ${to} with subject "${subject}"`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorData =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : undefined;

      this.logger.error(
        `Failed to send email to ${to}`,
        errorData || errorMessage,
      );
      throw new Error(`Email sending failed: ${errorMessage}`);
    }
  }
}

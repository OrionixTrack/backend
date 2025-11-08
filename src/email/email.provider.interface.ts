export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<void>;
}

export const EMAIL_PROVIDER_TOKEN = Symbol('EMAIL_PROVIDER');

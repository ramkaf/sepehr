export interface SendEmailOptions {
  to: string;
  tos?: string[];
  subject: string;
  template?: string;
  context?: any;
  text?: string;
  html?: string;
  attachments?: any[];
}

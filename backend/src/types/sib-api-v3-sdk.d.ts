/**
 * Type definitions for sib-api-v3-sdk (Brevo API)
 * This provides TypeScript support for the Brevo/Sendinblue API SDK
 */

declare module 'sib-api-v3-sdk' {
  export class ApiClient {
    static instance: ApiClient;
    authentications: {
      'api-key': {
        apiKey: string;
      };
    };
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<CreateSmtpEmail>;
  }

  export class AccountApi {
    getAccount(): Promise<GetAccount>;
  }

  export class SendSmtpEmail {
    sender?: SendSmtpEmailSender;
    to?: Array<SendSmtpEmailTo>;
    bcc?: Array<SendSmtpEmailBcc>;
    cc?: Array<SendSmtpEmailCc>;
    htmlContent?: string;
    textContent?: string;
    subject?: string;
    replyTo?: SendSmtpEmailReplyTo;
    attachment?: Array<SendSmtpEmailAttachment>;
    headers?: { [key: string]: string };
    templateId?: number;
    params?: { [key: string]: string };
    tags?: Array<string>;
  }

  export interface SendSmtpEmailSender {
    name?: string;
    email: string;
  }

  export interface SendSmtpEmailTo {
    email: string;
    name?: string;
  }

  export interface SendSmtpEmailBcc {
    email: string;
    name?: string;
  }

  export interface SendSmtpEmailCc {
    email: string;
    name?: string;
  }

  export interface SendSmtpEmailReplyTo {
    email: string;
    name?: string;
  }

  export interface SendSmtpEmailAttachment {
    url?: string;
    content?: string;
    name?: string;
  }

  export interface CreateSmtpEmail {
    messageId: string;
  }

  export interface GetAccount {
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    address: GetExtendedClientAddress;
    plan: Array<GetAccountPlan>;
    relay: GetAccountRelay;
    marketingAutomation?: GetAccountMarketingAutomation;
  }

  export interface GetExtendedClientAddress {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  }

  export interface GetAccountPlan {
    type: string;
    creditsType: string;
    credits: number;
    startDate?: string;
    endDate?: string;
    userLimit?: number;
  }

  export interface GetAccountRelay {
    enabled: boolean;
    data: GetAccountRelayData;
  }

  export interface GetAccountRelayData {
    userName: string;
    relay: string;
    port: number;
  }

  export interface GetAccountMarketingAutomation {
    key?: string;
    enabled: boolean;
  }
}

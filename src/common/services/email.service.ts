import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }
    const host = process.env.EMAIL_SERVICE_HOST;
    const user = process.env.EMAIL_SERVICE_USER;
    const pass = process.env.EMAIL_SERVICE_PASSWORD;
    if (!host || !user || !pass) {
      throw new Error(
        'Configuração de e-mail ausente: defina EMAIL_SERVICE_HOST, EMAIL_SERVICE_USER e EMAIL_SERVICE_PASSWORD no .env',
      );
    }
    const port = Number(process.env.EMAIL_SERVICE_PORT ?? 465);
    const secure =
      process.env.EMAIL_SERVICE_SECURE !== undefined
        ? process.env.EMAIL_SERVICE_SECURE === 'true'
        : port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    return this.transporter;
  }

  /** Trata como HTML se o conteúdo (após trim) começar com '<'. Caso contrário, envia como texto. */
  private static isHtmlBody(body: string): boolean {
    return /^\s*</.test(body);
  }

  /**
   * Envia e-mail via SMTP.
   * @param body Conteúdo em texto plano ou HTML (detectado pelo primeiro caractere não vazio ser '<').
   */
  async sendEmail(
    body: string,
    subject: string,
    to: string[],
  ): Promise<nodemailer.SentMessageInfo> {
    if (!to.length) {
      throw new Error('Lista de destinatários (to) não pode ser vazia');
    }

    const from =
      process.env.EMAIL_SERVICE_FROM ?? process.env.EMAIL_SERVICE_USER;

    const mail: nodemailer.SendMailOptions = {
      from,
      to,
      subject,
      ...(EmailService.isHtmlBody(body) ? { html: body } : { text: body }),
    };

    const transport = this.getTransporter();
    // nodemailer — sendMail é tipado como any nesta versão
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- nodemailer
    const info = await transport.sendMail(mail);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- nodemailer
    const msgIdStr = String(info.messageId);
    this.logger.log(
      `E-mail enviado: messageId=${msgIdStr} to=${to.join(', ')}`,
    );
    return info;
  }
}

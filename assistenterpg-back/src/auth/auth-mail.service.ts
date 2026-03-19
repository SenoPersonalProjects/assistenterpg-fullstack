import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

type EmailAuthMode = 'console' | 'smtp' | 'ethereal';

type EnviarEmailInput = {
  para: string;
  assunto: string;
  texto: string;
  html: string;
};

type EnviarRecuperacaoInput = {
  email: string;
  apelido: string;
  linkRecuperacao: string;
  expiraEm: Date;
};

type EnviarVerificacaoInput = {
  email: string;
  apelido: string;
  linkVerificacao: string;
  expiraEm: Date;
};

@Injectable()
export class AuthMailService {
  private readonly logger = new Logger(AuthMailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

  async enviarRecuperacaoSenha(input: EnviarRecuperacaoInput) {
    const assunto = 'AssistenteRPG - Recuperacao de senha';
    const expiraEm = this.formatarDataHora(input.expiraEm);

    const texto = [
      `Ola, ${input.apelido}!`,
      '',
      'Recebemos um pedido para redefinir sua senha no AssistenteRPG.',
      `Use este link para redefinir: ${input.linkRecuperacao}`,
      `Este link expira em: ${expiraEm}.`,
      '',
      'Se voce nao solicitou, ignore este email.',
    ].join('\n');

    const html = this.renderTemplate({
      preHeader: 'Redefina sua senha com seguranca',
      titulo: 'Recuperacao de senha',
      saudacao: `Ola, ${input.apelido}.`,
      descricao:
        'Recebemos um pedido para redefinir sua senha. Se foi voce, clique no botao abaixo.',
      ctaLabel: 'Redefinir senha',
      ctaUrl: input.linkRecuperacao,
      destaque: `Este link expira em ${expiraEm}.`,
      observacao: 'Se voce nao solicitou esta alteracao, ignore este email.',
    });

    await this.enviarEmail({
      para: input.email,
      assunto,
      texto,
      html,
    });
  }

  async enviarVerificacaoEmail(input: EnviarVerificacaoInput) {
    const assunto = 'AssistenteRPG - Verificacao de email';
    const expiraEm = this.formatarDataHora(input.expiraEm);

    const texto = [
      `Ola, ${input.apelido}!`,
      '',
      'Bem-vindo ao AssistenteRPG.',
      `Confirme seu email pelo link: ${input.linkVerificacao}`,
      `Este link expira em: ${expiraEm}.`,
      '',
      'Se voce nao criou esta conta, ignore este email.',
    ].join('\n');

    const html = this.renderTemplate({
      preHeader: 'Confirme seu email para ativar o acesso',
      titulo: 'Verificacao de email',
      saudacao: `Ola, ${input.apelido}.`,
      descricao:
        'Para concluir seu cadastro no AssistenteRPG, confirme seu email pelo botao abaixo.',
      ctaLabel: 'Verificar email',
      ctaUrl: input.linkVerificacao,
      destaque: `Este link expira em ${expiraEm}.`,
      observacao: 'Se voce nao criou esta conta, ignore este email.',
    });

    await this.enviarEmail({
      para: input.email,
      assunto,
      texto,
      html,
    });
  }

  private async enviarEmail(input: EnviarEmailInput) {
    const modo = this.obterModo();
    if (modo === 'console') {
      this.logger.log(
        `[AUTH_EMAIL][console] para=${input.para} assunto="${input.assunto}"`,
      );
      this.logger.log(`[AUTH_EMAIL][console][body]\n${input.texto}`);
      return;
    }

    const transporter = await this.getTransporter();
    if (!transporter) {
      this.logger.warn(
        '[AUTH_EMAIL] Provedor de email nao configurado corretamente. Email nao enviado.',
      );
      return;
    }

    const info = await transporter.sendMail({
      from: this.getRemetenteFormatado(),
      to: input.para,
      subject: input.assunto,
      text: input.texto,
      html: input.html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`[AUTH_EMAIL][preview] ${previewUrl}`);
    }
  }

  private obterModo(): EmailAuthMode {
    const modo = (process.env.AUTH_EMAIL_MODE ?? 'ethereal').toLowerCase();
    if (modo === 'smtp') return 'smtp';
    if (modo === 'console') return 'console';
    return 'ethereal';
  }

  private async getTransporter(): Promise<Transporter<SMTPTransport.SentMessageInfo> | null> {
    if (this.transporter) {
      return this.transporter;
    }

    const modo = this.obterModo();
    if (modo === 'ethereal') {
      const conta = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: conta.smtp.host,
        port: conta.smtp.port,
        secure: conta.smtp.secure,
        auth: {
          user: conta.user,
          pass: conta.pass,
        },
      });

      this.logger.log(
        `[AUTH_EMAIL] Ethereal habilitado para testes gratuitos (${conta.user})`,
      );
      return this.transporter;
    }

    const host = process.env.AUTH_SMTP_HOST;
    const portText = process.env.AUTH_SMTP_PORT;
    const user = process.env.AUTH_SMTP_USER;
    const pass = process.env.AUTH_SMTP_PASS;

    if (!host || !portText || !user || !pass) {
      return null;
    }

    const port = Number(portText);
    if (!Number.isFinite(port) || port <= 0) {
      return null;
    }

    const secure = String(process.env.AUTH_SMTP_SECURE ?? 'false') === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  private getRemetenteFormatado() {
    const fromConfigurado = (process.env.AUTH_EMAIL_FROM ?? '').trim();
    const usuarioSmtp = (process.env.AUTH_SMTP_USER ?? '').trim();
    const email =
      fromConfigurado &&
      !fromConfigurado.toLowerCase().endsWith('@assistenterpg.local')
        ? fromConfigurado
        : usuarioSmtp || fromConfigurado || 'no-reply@localhost.local';
    const nome = process.env.AUTH_EMAIL_FROM_NAME ?? 'AssistenteRPG';
    return `"${nome}" <${email}>`;
  }

  private formatarDataHora(data: Date) {
    return data.toLocaleString('pt-BR', {
      timeZone: 'America/Fortaleza',
    });
  }

  private escapeHtml(valor: string) {
    return valor
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private renderTemplate(input: {
    preHeader: string;
    titulo: string;
    saudacao: string;
    descricao: string;
    ctaLabel: string;
    ctaUrl: string;
    destaque: string;
    observacao: string;
  }) {
    return `
      <!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${this.escapeHtml(input.titulo)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Segoe UI,Arial,sans-serif;color:#111827;">
        <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${this.escapeHtml(input.preHeader)}</span>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 12px 36px rgba(15,23,42,0.12);">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:20px 24px;color:#ffffff;">
                    <div style="font-size:22px;font-weight:700;">AssistenteRPG</div>
                    <div style="font-size:13px;opacity:.9;margin-top:4px;">Jujutsu Kaisen</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;color:#111827;">${this.escapeHtml(input.titulo)}</h1>
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#374151;">${this.escapeHtml(input.saudacao)}</p>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">${this.escapeHtml(input.descricao)}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                      <tr>
                        <td>
                          <a href="${this.escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">
                            ${this.escapeHtml(input.ctaLabel)}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 10px;padding:10px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;font-size:13px;color:#1e40af;">
                      ${this.escapeHtml(input.destaque)}
                    </p>
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">${this.escapeHtml(input.observacao)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                    Caso o botao nao funcione, copie e cole este link no navegador:<br />
                    <span style="word-break:break-all;color:#2563eb;">${this.escapeHtml(input.ctaUrl)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

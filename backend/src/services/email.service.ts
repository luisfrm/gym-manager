import nodemailer, { Transporter } from 'nodemailer';

export class EmailService {
  private transporter: Transporter;

  constructor() {
    // Configure the transporter with your email service credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to,
        subject,
        html,
      });

      console.log('Email enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw error;
    }
  }

  // Method to send welcome email
  async sendWelcomeEmail(to: string, name: string) {
    const subject = '¡Bienvenido a Gym Manager!';
    const html = `
      <h1>¡Bienvenido ${name}!</h1>
      <p>Gracias por registrarte en Gym Manager. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  // Method to send password recovery email
  async sendPasswordResetEmail(to: string, resetToken: string) {
    const subject = 'Recuperación de Contraseña - Gym Manager';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
    `;

    return this.sendEmail(to, subject, html);
  }
}

// const emailService = new EmailService();
// emailService.sendWelcomeEmail('luisfrm_@outlook.com', 'Luis');

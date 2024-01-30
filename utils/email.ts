import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

type User = { email: string; name: string };

class Email {
  protected to: string;
  protected firstName: string;
  protected url: string;
  protected from: string;

  constructor(user: User, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.MAIL_FROM_NAME}>`;
  }

  newTransport(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    const smtpConfig: SMTPTransport.Options = {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      tls: {
        ciphers: 'SSLv3',
      },
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    };

    return nodemailer.createTransport(smtpConfig);
  }

  // SEND MAIL
  async send(template: string, subject: string): Promise<void> {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    console.log(mailOptions);

    await this.newTransport().sendMail(mailOptions);
  }

  // WELCOME MESSAGE
  async sendWelcome(): Promise<void> {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  // SEND PASSWORD RESET
  async sendPasswordReset(): Promise<void> {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}

export default Email;

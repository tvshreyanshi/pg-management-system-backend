import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:
        this.configService.get<string>('SMTP_HOST') ||
        'sandbox.smtp.mailtrap.io',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '2525', 10),
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'bcd246cfafb625',
        pass: this.configService.get<string>('SMTP_PASS') || '98d399dcfc72e1',
      },
    });

    // Verify SMTP connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('❌ Mailtrap SMTP connection failed:', error);
      } else {
        this.logger.log('✅ Mailtrap SMTP server is ready to send emails');
      }
    });
  }

  async sendOTP(
    email: string,
    otp: string,
    username: string
  ): Promise<boolean> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${this.configService.get('APP_NAME') || 'MyApp'}" <${
          this.configService.get('SMTP_FROM') ||
          this.configService.get('SMTP_USER')
        }>`,
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 28px; font-weight: bold;">
              ${otp}
            </div>
            <p>This code will expire in 5 minutes.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 OTP sent to ${email} (Message ID: ${info.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP to ${email}`, error.stack);
      return false;
    }
  }
}

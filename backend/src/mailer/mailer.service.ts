import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEventNotification(
    to: string,
    name: string,
    eventName: string,
    eventDate: string,
    startTime: string,
    eventLocation: string,
    ticketNumber: number,
    ticketPrice: number,
    eventLink: string,
  ): Promise<void> {
    const templatePath = './src/mailer/templates/event-notification.hbs';
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const html = template({
      name,
      eventName,
      eventDate,
      startTime,
      eventLocation,
      ticketNumber,
      ticketPrice,
      eventLink,
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject: 'Nouvel Événement Publié',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`E-mail envoyé à ${to}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'e-mail à ${to} :`, error);
      throw new Error("Erreur lors de l'envoi de l'e-mail");
    }
  }

  async sendReviewRequest(
    to: string,
    name: string,
    eventName: string,
    reviewLink: string,
  ): Promise<void> {
    const templatePath = './src/mailer/templates/review-request.hbs';
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const html = template({
      name,
      eventName,
      reviewLink,
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject: `Votre avis sur l'événement ${eventName}`,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`E-mail de demande de revue envoyé à ${to}`);
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi de l'e-mail de revue à ${to} :`,
        error,
      );
      throw new Error("Erreur lors de l'envoi de l'e-mail de revue");
    }
  }
}

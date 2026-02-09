import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from './evenement.entity';
import { Inscription } from '../evenement-inscriptions/inscription.entity';
import { User } from '../users/entities/user.entity';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class EventExpirationService {
  private readonly logger = new Logger(EventExpirationService.name);
  private processedInscriptions: Set<string> = new Set(); // Suivi temporaire en mémoire

  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    @InjectRepository(Inscription)
    private readonly inscriptionRepository: Repository<Inscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {
    this.logger.log('EventExpirationService initialisé');
  }

  async checkExpiredEvents(): Promise<void> {
    this.logger.log('Vérification des événements terminés...');
    const now = new Date();
    const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h avant
    this.logger.log(
      `Date actuelle : ${now.toISOString()}, Seuil 24h : ${threshold.toISOString()}`,
    );

    const evenements = await this.evenementRepository.find();
    this.logger.log(
      `Événements récupérés : ${JSON.stringify(evenements, null, 2)}`,
    );

    const expiredEvents = evenements.filter((evenement) => {
      const [hours, minutes] = evenement.startTime.split(':').map(Number);
      const eventDateTime = new Date(evenement.eventDate);
      eventDateTime.setHours(hours, minutes, 0, 0);
      this.logger.log(
        `Événement ${evenement.eventName} - Date et heure : ${eventDateTime.toISOString()}`,
      );
      return eventDateTime <= now && eventDateTime >= threshold;
    });
    this.logger.log(
      `Événements terminés récents : ${expiredEvents.map((e) => e.eventName).join(', ') || 'Aucun'}`,
    );

    for (const evenement of expiredEvents) {
      const inscriptions = await this.inscriptionRepository.find({
        where: { eventname: evenement.eventName },
      });
      this.logger.log(
        `Inscriptions pour ${evenement.eventName} : ${JSON.stringify(inscriptions, null, 2)}`,
      );

      for (const inscription of inscriptions) {
        const key = `${evenement.id}_${inscription.id}`;
        if (this.processedInscriptions.has(key)) {
          this.logger.log(
            `Inscription ID ${inscription.id} pour ${evenement.eventName} déjà traitée, ignorée`,
          );
          continue;
        }

        this.logger.log(
          `Traitement inscription ID ${inscription.id}, matricule: ${inscription.matricule}`,
        );
        const user = await this.userRepository.findOne({
          where: { matricule: inscription.matricule },
        });

        if (!user || !user.email) {
          this.logger.warn(
            `Aucun utilisateur ou e-mail pour matricule ${inscription.matricule}`,
          );
          continue;
        }

        this.logger.log(
          `Utilisateur trouvé : ${JSON.stringify(user, null, 2)}`,
        );
        try {
          await this.mailerService.sendReviewRequest(
            user.email,
            user.nom || inscription.nom,
            evenement.eventName,
            `http://localhost:3800/reviews?eventId=${evenement.id}`,
          );
          this.logger.log(
            `E-mail envoyé à ${user.email} pour ${evenement.eventName}`,
          );
          this.processedInscriptions.add(key);
          this.logger.log(
            `Inscription ID ${inscription.id} marquée comme traitée pour ${evenement.eventName}`,
          );
        } catch (error) {
          this.logger.error(
            `Erreur lors de l'envoi de l'e-mail à ${user.email} pour ${evenement.eventName}:`,
            error,
          );
        }
      }
    }
    this.logger.log('Vérification des événements terminés terminée.');
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from './evenement.entity';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import type { Express } from 'express';
import { MailerService } from '../mailer/mailer.service';
import { User } from '../users/entities/user.entity';
import { Inscription } from '../evenement-inscriptions/inscription.entity';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class EvenementsService {
  private readonly logger = new Logger(EvenementsService.name);

  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Inscription)
    private readonly inscriptionRepository: Repository<Inscription>,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    createEvenementDto: CreateEvenementDto,
    eventImage: Express.Multer.File,
  ): Promise<Evenement> {
    this.logger.log(`Fichier reçu : ${eventImage?.originalname}`);

    if (!eventImage) {
      throw new BadRequestException('Aucun fichier image téléchargé.');
    }

    const imagePath = path.join('Uploads', eventImage.filename);
    this.logger.log(`Chemin de l'image : ${imagePath}`);

    const evenement = this.evenementRepository.create({
      ...createEvenementDto,
      eventImage: imagePath,
    });

    const savedEvenement = await this.evenementRepository.save(evenement);
    this.logger.log(`Événement sauvegardé : ${savedEvenement.id}`);

    const users = await this.userRepository.find();
    const eventLink = `http://localhost:3800/evenements/${savedEvenement.id}`;

    const emailPromises = users.map((user) =>
      this.mailerService.sendEventNotification(
        user.email,
        user.nom,
        savedEvenement.eventName,
        savedEvenement.eventDate,
        savedEvenement.startTime,
        savedEvenement.eventLocation,
        savedEvenement.ticketNumber,
        savedEvenement.ticketPrice,
        eventLink,
      ),
    );

    await Promise.all(emailPromises);

    return savedEvenement;
  }

  async findAll(): Promise<any[]> {
    const evenements = await this.evenementRepository.find();
    const result = await Promise.all(
      evenements.map(async (evenement) => {
        const inscriptionCount = await this.inscriptionRepository
          .createQueryBuilder('inscription')
          .where('inscription.eventname = :eventname', {
            eventname: evenement.eventName,
          })
          .andWhere('inscription.eventStatus = :status', { status: 'En cours' })
          .select('SUM(inscription.numberOfTickets)', 'total')
          .getRawOne();

        const totalTicketsUsed =
          inscriptionCount && inscriptionCount.total
            ? Number(inscriptionCount.total)
            : 0;
        return {
          ...evenement,
          inscriptionCount: totalTicketsUsed,
          ticketsAvailable: evenement.ticketNumber - totalTicketsUsed,
        };
      }),
    );
    this.logger.log(`Nombre d'événements récupérés : ${result.length}`);
    return result;
  }

  async update(
    id: number,
    updateEvenementDto: CreateEvenementDto,
    eventImage: Express.Multer.File,
  ): Promise<Evenement> {
    const evenement = await this.evenementRepository.findOne({ where: { id } });
    if (!evenement) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    if (eventImage) {
      const imagePath = path.join('Uploads', eventImage.filename);
      evenement.eventImage = imagePath;
    }

    Object.assign(evenement, updateEvenementDto);
    return this.evenementRepository.save(evenement);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Tentative de suppression de l'événement ID: ${id}`);
    const evenement = await this.evenementRepository.findOne({ where: { id } });
    if (!evenement) {
      this.logger.warn(`Événement avec l'ID ${id} non trouvé`);
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    try {
      if (evenement.eventName) {
        this.logger.log(
          `Mise à jour des inscriptions pour l'événement: ${evenement.eventName}`,
        );
        await this.inscriptionRepository.update(
          { eventname: evenement.eventName },
          { eventStatus: 'Expiré' },
        );
        this.logger.log(
          `Inscriptions mises à jour pour l'événement: ${evenement.eventName}`,
        );
      } else {
        this.logger.warn(
          `L'événement ${id} n'a pas de eventName, mise à jour des inscriptions ignorée`,
        );
      }

      // Supprimer l'image associée si elle existe
      if (evenement.eventImage) {
        try {
          await unlinkAsync(evenement.eventImage);
          this.logger.log(`Image supprimée: ${evenement.eventImage}`);
        } catch (fileError) {
          this.logger.warn(
            `Échec de la suppression de l'image ${evenement.eventImage}: ${fileError.message}`,
          );
        }
      }

      await this.evenementRepository.remove(evenement);
      this.logger.log(`Événement supprimé: ${id}`);
    } catch (error) {
      this.logger.error(
        `Échec de la suppression de l'événement ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Erreur lors de la suppression de l'événement: ${error.message}`,
      );
    }
  }
}

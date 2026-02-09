import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscription } from './inscription.entity';
import { Evenement } from '../evenements/evenement.entity';
import { User } from '../users/entities/user.entity';
import { CreateInscriptionDto } from './create-inscription.dto';
import { UpdateInscriptionDto } from './update-inscription.dto';

@Injectable()
export class InscriptionService {
  constructor(
    @InjectRepository(Inscription)
    private readonly inscriptionRepository: Repository<Inscription>,
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createInscriptionDto: CreateInscriptionDto,
    userId: number,
  ): Promise<Inscription> {
    // Vérification des champs obligatoires
    if (
      !createInscriptionDto.matricule ||
      !createInscriptionDto.nom ||
      !createInscriptionDto.prenom ||
      !createInscriptionDto.beneficiaire ||
      !createInscriptionDto.eventname ||
      !createInscriptionDto.eventId ||
      !createInscriptionDto.numberOfTickets ||
      !createInscriptionDto.totalAmount
    ) {
      throw new BadRequestException(
        'Tous les champs obligatoires doivent être remplis',
      );
    }

    // Validation conditionnelle pour l'âge
    if (
      createInscriptionDto.beneficiaire === 'enfant' &&
      (createInscriptionDto.age === undefined ||
        createInscriptionDto.age === null)
    ) {
      throw new BadRequestException(
        "L'âge est requis pour un bénéficiaire 'enfant'",
      );
    }
    if (createInscriptionDto.beneficiaire === 'Agent TT') {
      createInscriptionDto.age = null;
    }

    // Vérifier si l'événement existe et si eventname correspond
    const evenement = await this.evenementRepository.findOne({
      where: { id: createInscriptionDto.eventId },
    });
    if (!evenement) {
      throw new NotFoundException(
        `Événement avec l'ID ${createInscriptionDto.eventId} non trouvé`,
      );
    }
    if (createInscriptionDto.eventname !== evenement.eventName) {
      throw new BadRequestException(
        `Le nom de l'événement (${createInscriptionDto.eventname}) ne correspond pas à l'ID fourni (${createInscriptionDto.eventId}).`,
      );
    }

    // Vérifier si l'utilisateur existe (sauf pour l'admin avec id: 0)
    if (userId !== 0) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
      }
    }

    // Vérifier si une inscription existe déjà pour ce matricule, bénéficiaire et événement
    const existingInscription = await this.inscriptionRepository.findOne({
      where: {
        matricule: createInscriptionDto.matricule,
        beneficiaire: createInscriptionDto.beneficiaire,
        eventId: createInscriptionDto.eventId,
      },
    });

    if (existingInscription) {
      throw new BadRequestException(
        `Vous êtes déjà inscrit à cet événement (ID: ${createInscriptionDto.eventId}) en tant que "${createInscriptionDto.beneficiaire}".`,
      );
    }

    // Vérifier si le nombre de tickets demandés est disponible
    const inscriptionCount = await this.inscriptionRepository
      .createQueryBuilder('inscription')
      .where('inscription.eventId = :eventId', {
        eventId: createInscriptionDto.eventId,
      })
      .select('SUM(inscription.numberOfTickets)', 'total')
      .getRawOne();

    const totalTicketsUsed = inscriptionCount
      ? Number(inscriptionCount.total)
      : 0;
    const requestedTickets = createInscriptionDto.numberOfTickets;

    if (totalTicketsUsed + requestedTickets > evenement.ticketNumber) {
      throw new BadRequestException(
        `L'événement ${createInscriptionDto.eventname} n'a plus assez de tickets disponibles.`,
      );
    }

    // Vérifier que le montant total correspond au calcul
    const expectedTotalAmount = requestedTickets * evenement.ticketPrice;
    if (createInscriptionDto.totalAmount !== expectedTotalAmount) {
      throw new BadRequestException(
        `Le montant total (${createInscriptionDto.totalAmount} TND) ne correspond pas au calcul attendu (${expectedTotalAmount} TND).`,
      );
    }

    // Créer une nouvelle inscription
    const inscription = this.inscriptionRepository.create({
      ...createInscriptionDto,
      eventId: createInscriptionDto.eventId,
      userId: userId,
    });
    return this.inscriptionRepository.save(inscription);
  }

  async findAll(isAdmin: boolean): Promise<Inscription[]> {
    if (!isAdmin) {
      throw new ForbiddenException('Seul un administrateur peut consulter toutes les inscriptions.');
    }
    return this.inscriptionRepository.find({ relations: ['event'] });
  }

  async remove(id: number, isAdmin: boolean): Promise<void> {
    if (!isAdmin) {
      throw new ForbiddenException('Seul un administrateur peut supprimer une inscription.');
    }
    const inscription = await this.inscriptionRepository.findOne({
      where: { id },
    });
    if (!inscription) {
      throw new NotFoundException(`Inscription avec l'ID ${id} non trouvée`);
    }
    await this.inscriptionRepository.remove(inscription);
  }

  async update(
    id: number,
    updateInscriptionDto: UpdateInscriptionDto,
    userId: number,
    isAdmin: boolean,
  ): Promise<Inscription> {
    if (!isAdmin) {
      throw new ForbiddenException('Seul un administrateur peut modifier une inscription.');
    }

    const inscription = await this.inscriptionRepository.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!inscription) {
      throw new NotFoundException(`Inscription avec l'ID ${id} non trouvée`);
    }

    let evenement: Evenement | null = null;
    // Vérifier si l'événement existe et si eventname correspond
    if (updateInscriptionDto.eventId) {
      evenement = await this.evenementRepository.findOne({
        where: { id: updateInscriptionDto.eventId },
      });
      if (!evenement) {
        throw new NotFoundException(
          `Événement avec l'ID ${updateInscriptionDto.eventId} non trouvé`,
        );
      }
      if (
        updateInscriptionDto.eventname &&
        evenement.eventName !== updateInscriptionDto.eventname
      ) {
        throw new BadRequestException(
          `Le nom de l'événement (${updateInscriptionDto.eventname}) ne correspond pas à l'ID fourni (${updateInscriptionDto.eventId}).`,
        );
      }
    }

    // Validation conditionnelle pour l'âge
    if (
      updateInscriptionDto.beneficiaire === 'enfant' &&
      updateInscriptionDto.age === undefined
    ) {
      throw new BadRequestException(
        "L'âge est requis pour un bénéficiaire 'enfant'",
      );
    }
    if (updateInscriptionDto.beneficiaire === 'Agent TT') {
      updateInscriptionDto.age = null;
    }

    // Vérifier si une inscription existe déjà pour ce matricule, bénéficiaire et événement
    if (
      updateInscriptionDto.matricule &&
      updateInscriptionDto.beneficiaire &&
      updateInscriptionDto.eventId
    ) {
      const existingInscription = await this.inscriptionRepository.findOne({
        where: {
          matricule: updateInscriptionDto.matricule,
          beneficiaire: updateInscriptionDto.beneficiaire,
          eventId: updateInscriptionDto.eventId,
        },
      });

      if (existingInscription && existingInscription.id !== id) {
        throw new BadRequestException(
          `Une inscription existe déjà pour cet événement (ID: ${updateInscriptionDto.eventId}) en tant que "${updateInscriptionDto.beneficiaire}".`,
        );
      }
    }

    // Vérifier la disponibilité des tickets
    if (updateInscriptionDto.numberOfTickets && updateInscriptionDto.eventId) {
      const inscriptionCount = await this.inscriptionRepository
        .createQueryBuilder('inscription')
        .where('inscription.eventId = :eventId AND inscription.id != :id', {
          eventId: updateInscriptionDto.eventId,
          id,
        })
        .select('SUM(inscription.numberOfTickets)', 'total')
        .getRawOne();

      const totalTicketsUsed = inscriptionCount
        ? Number(inscriptionCount.total)
        : 0;
      const requestedTickets = updateInscriptionDto.numberOfTickets;

      if (totalTicketsUsed + requestedTickets > evenement!.ticketNumber) {
        throw new BadRequestException(
          `L'événement ${updateInscriptionDto.eventname || inscription.eventname} n'a plus assez de tickets disponibles.`,
        );
      }

      // Vérifier le montant total
      if (updateInscriptionDto.totalAmount) {
        const expectedTotalAmount = requestedTickets * evenement!.ticketPrice;
        if (updateInscriptionDto.totalAmount !== expectedTotalAmount) {
          throw new BadRequestException(
            `Le montant total (${updateInscriptionDto.totalAmount} TND) ne correspond pas au calcul attendu (${expectedTotalAmount} TND).`,
          );
        }
      }
    }

    // Mettre à jour uniquement les champs fournis, en préservant userId
    Object.assign(inscription, updateInscriptionDto);
    return this.inscriptionRepository.save(inscription);
  }

  async checkInscription(eventId: number, userId: number): Promise<boolean> {
    const inscription = await this.inscriptionRepository.findOne({
      where: {
        eventId: eventId,
        userId: userId,
      },
    });
    return !!inscription;
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../clubs/clubs.entity';
import { TypeClub } from '../type-club/type-club.entity';
import { ArchivedClubType } from '../archived-club-types/archived-club-type.entity';
import { ActivitesSportives } from '../activites-sportives/activites-sportives.entity';
import { TypeActiviteSportive } from '../type-activite-sportive/type-activite-sportive.entity';
import { ArchivedSportActivityType } from '../archived-sport-activity-types/archived-sport-activity-type.entity';
import { Review } from '../reviews/review.entity';
import { Evenement } from '../evenements/evenement.entity';
import { Inscription } from '../evenement-inscriptions/inscription.entity';
import { StatsDto } from './stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(TypeClub)
    private typeClubRepository: Repository<TypeClub>,
    @InjectRepository(ArchivedClubType)
    private archivedClubTypeRepository: Repository<ArchivedClubType>,
    @InjectRepository(ActivitesSportives)
    private activiteSportiveRepository: Repository<ActivitesSportives>,
    @InjectRepository(TypeActiviteSportive)
    private typeActiviteSportiveRepository: Repository<TypeActiviteSportive>,
    @InjectRepository(ArchivedSportActivityType)
    private archivedSportActivityTypeRepository: Repository<ArchivedSportActivityType>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    @InjectRepository(Inscription)
    private inscriptionRepository: Repository<Inscription>,
  ) {}

  async getStats(): Promise<StatsDto> {
    const archivedClubTypes = await this.archivedClubTypeRepository.find();
    const archivedtype_ids = archivedClubTypes.map(
      (archived) => archived.type_id,
    );

    const archivedSportActivityTypes =
      await this.archivedSportActivityTypeRepository.find();
    const archivedSporttype_ids = archivedSportActivityTypes.map(
      (archived) => archived.type_id,
    );

    const activeClubs = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoin('club.type_club', 'typeClub')
      .select('typeClub.name', 'name')
      .addSelect('COUNT(club.id)', 'members')
      .addSelect('club.type_club_id', 'type_id')
      .groupBy('club.type_club_id')
      .where('club.type_club_id IS NOT NULL')
      .andWhere('club.type_club_id NOT IN (:...archivedtype_ids)', {
        archivedtype_ids: archivedtype_ids.length ? archivedtype_ids : [0],
      })
      .getRawMany();

    const archivedClubs = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoin(
        'archived_club_types',
        'archivedClubType',
        'archivedClubType.type_id = club.type_club_id',
      )
      .select('archivedClubType.name', 'name')
      .addSelect('COUNT(club.id)', 'members')
      .addSelect('club.type_club_id', 'type_id')
      .groupBy('club.type_club_id')
      .where('club.type_club_id IN (:...archivedtype_ids)', {
        archivedtype_ids: archivedtype_ids.length ? archivedtype_ids : [0],
      })
      .getRawMany();

    const activeSports = await this.activiteSportiveRepository
      .createQueryBuilder('activite')
      .leftJoin('activite.typeActivite', 'typeActivite')
      .select('typeActivite.nom', 'nom')
      .addSelect('COUNT(activite.id)', 'participations')
      .groupBy('activite.type_activite_id')
      .where('activite.type_activite_id IS NOT NULL')
      .andWhere('activite.typeActivite IS NOT NULL')
      .getRawMany();

    const archivedSports = await this.activiteSportiveRepository
      .createQueryBuilder('activite')
      .leftJoin(
        'archived_sport_activity_types',
        'archivedActiviteType',
        'archivedActiviteType.type_id = activite.type_activite_id',
      )
      .select('archivedActiviteType.nom', 'nom')
      .addSelect('COUNT(activite.id)', 'participations')
      .groupBy('activite.type_activite_id')
      .where('activite.type_activite_id IS NOT NULL')
      .andWhere('activite.typeActivite IS NULL')
      .getRawMany();

    const inscriptionsByActiveClubType = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoin('club.type_club', 'typeClub')
      .select('typeClub.name', 'name')
      .addSelect('COUNT(club.id)', 'inscriptions')
      .addSelect('club.type_club_id', 'type_id')
      .groupBy('club.type_club_id')
      .where('club.type_club_id IS NOT NULL')
      .andWhere('club.type_club_id NOT IN (:...archivedtype_ids)', {
        archivedtype_ids: archivedtype_ids.length ? archivedtype_ids : [0],
      })
      .getRawMany();

    const inscriptionsByArchivedClubType = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoin(
        'archived_club_types',
        'archivedClubType',
        'archivedClubType.type_id = club.type_club_id',
      )
      .select('archivedClubType.name', 'name')
      .addSelect('COUNT(club.id)', 'inscriptions')
      .addSelect('club.type_club_id', 'type_id')
      .groupBy('club.type_club_id')
      .where('club.type_club_id IN (:...archivedtype_ids)', {
        archivedtype_ids: archivedtype_ids.length ? archivedtype_ids : [0],
      })
      .getRawMany();

    const inscriptionsByActiveSportType = await this.activiteSportiveRepository
      .createQueryBuilder('activite')
      .leftJoin('activite.typeActivite', 'typeActivite')
      .select('typeActivite.nom', 'name')
      .addSelect('COUNT(activite.id)', 'inscriptions')
      .addSelect('activite.type_activite_id', 'type_id')
      .groupBy('activite.type_activite_id')
      .where('activite.type_activite_id IS NOT NULL')
      .andWhere(
        'activite.type_activite_id NOT IN (:...archivedSporttype_ids)',
        {
          archivedSporttype_ids: archivedSporttype_ids.length
            ? archivedSporttype_ids
            : [0],
        },
      )
      .getRawMany();

    const inscriptionsByArchivedSportType =
      await this.activiteSportiveRepository
        .createQueryBuilder('activite')
        .leftJoin(
          'archived_sport_activity_types',
          'archivedActiviteType',
          'archivedActiviteType.type_id = activite.type_activite_id',
        )
        .select('archivedActiviteType.nom', 'name')
        .addSelect('COUNT(activite.id)', 'inscriptions')
        .addSelect('activite.type_activite_id', 'type_id')
        .groupBy('activite.type_activite_id')
        .where('activite.type_activite_id IN (:...archivedSporttype_ids)', {
          archivedSporttype_ids: archivedSporttype_ids.length
            ? archivedSporttype_ids
            : [0],
        })
        .getRawMany();

    const inscriptionsByBeneficiaryClub = await this.clubRepository
      .createQueryBuilder('club')
      .select('club.beneficiaire', 'beneficiary')
      .addSelect('COUNT(club.id)', 'inscriptions')
      .groupBy('club.beneficiaire')
      .getRawMany();

    const inscriptionsByBeneficiarySport = await this.activiteSportiveRepository
      .createQueryBuilder('activite')
      .select('activite.beneficiaire', 'beneficiary')
      .addSelect('COUNT(activite.id)', 'inscriptions')
      .groupBy('activite.beneficiaire')
      .getRawMany();

    // Débogage des données brutes de reviews
    const rawReviews = await this.reviewRepository.find({
      relations: ['event'],
    });
    console.log('Raw Reviews:', JSON.stringify(rawReviews, null, 2));

    const reviewsByEvent = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.event', 'event')
      .select('event.eventName', 'eventName')
      .addSelect('event.id', 'eventId')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .addSelect(
        `SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(review.sentiment, '$.stars')) AS SIGNED) >= 4 AND review.sentiment IS NOT NULL THEN 1 ELSE 0 END)`,
        'positive',
      )
      .addSelect(
        `SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(review.sentiment, '$.stars')) AS SIGNED) = 3 AND review.sentiment IS NOT NULL THEN 1 ELSE 0 END)`,
        'neutral',
      )
      .addSelect(
        `SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(review.sentiment, '$.stars')) AS SIGNED) <= 2 AND review.sentiment IS NOT NULL THEN 1 ELSE 0 END)`,
        'negative',
      )
      .where('event.id IS NOT NULL')
      .groupBy('event.id')
      .getRawMany();

    console.log(
      'Reviews by Event (Backend):',
      JSON.stringify(reviewsByEvent, null, 2),
    );

    const events = await this.evenementRepository
      .createQueryBuilder('event')
      .leftJoin('event.inscriptions', 'inscription')
      .select('event.eventName', 'name')
      .addSelect('COUNT(inscription.id)', 'inscriptions')
      .groupBy('event.id')
      .getRawMany();

    const transformedActiveClubs = activeClubs
      .filter((c) => c.name)
      .map((c) => ({
        name: `${c.name} (En cours)`,
        members: Number(c.members),
      }));

    const transformedArchivedClubs = archivedClubs
      .filter((c) => c.type_id && c.name)
      .map((c) => ({
        name: `${c.name} (Expiré)`,
        members: Number(c.members),
      }));

    const transformedInscriptionsByActiveClubType = inscriptionsByActiveClubType
      .filter((c) => c.name)
      .map((c) => ({
        name: `${c.name} (En cours)`,
        inscriptions: Number(c.inscriptions),
      }));

    const transformedInscriptionsByArchivedClubType =
      inscriptionsByArchivedClubType
        .filter((c) => c.type_id && c.name)
        .map((c) => ({
          name: `${c.name} (Expiré)`,
          inscriptions: Number(c.inscriptions),
        }));

    const transformedInscriptionsByActiveSportType =
      inscriptionsByActiveSportType
        .filter((s) => s.name)
        .map((s) => ({
          name: `${s.name} (En cours)`,
          inscriptions: Number(s.inscriptions),
        }));

    const transformedInscriptionsByArchivedSportType =
      inscriptionsByArchivedSportType
        .filter((s) => s.type_id && s.name)
        .map((s) => ({
          name: `${s.name} (Expiré)`,
          inscriptions: Number(s.inscriptions),
        }));

    const transformedInscriptionsByBeneficiaryClub =
      inscriptionsByBeneficiaryClub.map((b) => ({
        beneficiary: b.beneficiary || 'Non spécifié',
        inscriptions: Number(b.inscriptions),
      }));

    const transformedInscriptionsByBeneficiarySport =
      inscriptionsByBeneficiarySport.map((b) => ({
        beneficiary: b.beneficiary || 'Non spécifié',
        inscriptions: Number(b.inscriptions),
      }));

    const transformedEvents = events.map((e) => ({
      name: e.name,
      inscriptions: Number(e.inscriptions),
    }));

    return {
      activeClubs: transformedActiveClubs,
      archivedClubs: transformedArchivedClubs,
      activeSports,
      archivedSports,
      inscriptionsByActiveClubType: transformedInscriptionsByActiveClubType,
      inscriptionsByArchivedClubType: transformedInscriptionsByArchivedClubType,
      inscriptionsByActiveSportType: transformedInscriptionsByActiveSportType,
      inscriptionsByArchivedSportType:
        transformedInscriptionsByArchivedSportType,
      inscriptionsByBeneficiaryClub: transformedInscriptionsByBeneficiaryClub,
      inscriptionsByBeneficiarySport: transformedInscriptionsByBeneficiarySport,
      reviewsByEvent,
      events: transformedEvents,
    };
  }
}

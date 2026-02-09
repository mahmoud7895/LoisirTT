import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitesSportives } from './activites-sportives.entity';
import { CreateActiviteSportiveDto } from './dto/create-activite-sportive.dto';
import { UpdateActiviteSportiveDto } from './dto/update-activite-sportive.dto';
import { TypeActiviteSportive } from '../type-activite-sportive/type-activite-sportive.entity';
import { TypeActiviteSportiveService } from '../type-activite-sportive/type-activite-sportive.service';
import { ArchivedSportActivityType } from '../archived-sport-activity-types/archived-sport-activity-type.entity';
import { ArchivedSportActivityTypesService } from '../archived-sport-activity-types/archived-sport-activity-types.service';

@Injectable()
export class ActivitesSportivesService {
  private readonly logger = new Logger(ActivitesSportivesService.name);

  constructor(
    @InjectRepository(ActivitesSportives)
    private readonly activitesRepository: Repository<ActivitesSportives>,
    @InjectRepository(ArchivedSportActivityType)
    private readonly archivedTypeRepository: Repository<ArchivedSportActivityType>,
    private readonly typeActiviteSportiveService: TypeActiviteSportiveService,
    private readonly archivedSportActivityTypesService: ArchivedSportActivityTypesService,
  ) {}

  async create(
    createDto: CreateActiviteSportiveDto,
  ): Promise<ActivitesSportives> {
    try {
      if (
        !createDto.matricule ||
        !createDto.nom ||
        !createDto.prenom ||
        !createDto.beneficiaire
      ) {
        throw new InternalServerErrorException(
          'Tous les champs obligatoires doivent être remplis',
        );
      }

      if (
        createDto.beneficiaire === 'enfant' &&
        (createDto.age === undefined || createDto.age === null)
      ) {
        throw new InternalServerErrorException(
          "L'âge est requis pour un bénéficiaire 'enfant'",
        );
      }
      if (createDto.beneficiaire === 'Agent TT') {
        createDto.age = null;
      }

      let typeActivite: TypeActiviteSportive | null = null;
      if (createDto.type_activite_id) {
        typeActivite = await this.typeActiviteSportiveService.findOne(
          createDto.type_activite_id,
        );
      }

      const activite = this.activitesRepository.create({
        matricule: createDto.matricule,
        nom: createDto.nom,
        prenom: createDto.prenom,
        age: createDto.age,
        beneficiaire: createDto.beneficiaire,
        typeActivite: typeActivite,
        type_activite_id: typeActivite ? typeActivite.id : null,
        original_type_activite_id: typeActivite ? typeActivite.id : null,
        date_inscription: new Date(),
      });

      const savedActivite = await this.activitesRepository.save(activite);
      this.logger.log(
        `Activité sportive créée avec succès: ID ${savedActivite.id}`,
      );
      return savedActivite;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'activité: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Échec de la création de l’activité sportive',
      );
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const activites = await this.activitesRepository
        .createQueryBuilder('activite')
        .leftJoin('activite.typeActivite', 'typeActivite')
        .leftJoin(
          'archived_sport_activity_types',
          'archived_type',
          'archived_type.type_id = activite.original_type_activite_id',
        )
        .select([
          'activite.id',
          'activite.matricule',
          'activite.nom',
          'activite.prenom',
          'activite.age',
          'activite.beneficiaire',
          'activite.type_activite_id',
          'activite.original_type_activite_id',
          'activite.date_inscription',
          'typeActivite.nom AS type_nom',
          'archived_type.nom AS archived_type_nom',
        ])
        .orderBy('activite.date_inscription', 'DESC')
        .getRawMany();

      this.logger.log(`Nombre d'activités récupérées: ${activites.length}`);
      const formattedActivites = activites.map((activite) => {
        let type_activite_nom_etat: string;
        this.logger.log(
          `Traitement activité ID ${activite.activite_id}: type_activite_id=${activite.activite_type_activite_id}, original_type_activite_id=${activite.activite_original_type_activite_id}, type_nom=${activite.type_nom}, archived_type_nom=${activite.archived_type_nom}`,
        );

        if (activite.activite_type_activite_id && activite.type_nom) {
          type_activite_nom_etat = `${activite.type_nom} (En cours)`;
          this.logger.log(
            `Type actif pour ID ${activite.activite_id}: ${type_activite_nom_etat}`,
          );
        } else if (
          activite.activite_original_type_activite_id &&
          activite.archived_type_nom
        ) {
          type_activite_nom_etat = `${activite.archived_type_nom} (Expiré)`;
          this.logger.log(
            `Type archivé pour ID ${activite.activite_id}: ${type_activite_nom_etat}`,
          );
        } else {
          type_activite_nom_etat = 'Non assigné';
          this.logger.log(
            `Aucun type pour activité ID ${activite.activite_id}`,
          );
        }

        return {
          id: activite.activite_id,
          matricule: activite.activite_matricule,
          nom: activite.activite_nom,
          prenom: activite.activite_prenom,
          age: activite.activite_age,
          beneficiaire: activite.activite_beneficiaire,
          type_activite_id: activite.activite_type_activite_id,
          original_type_activite_id:
            activite.activite_original_type_activite_id,
          date_inscription: activite.activite_date_inscription,
          type_activite_nom_etat,
        };
      });

      this.logger.log(
        `Activités formatées: ${formattedActivites.length} éléments`,
      );
      return formattedActivites;
    } catch (error) {
      this.logger.error(`Échec de la récupération: ${error.message}`);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des activités',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const result = await this.activitesRepository
        .createQueryBuilder('activite')
        .leftJoin('activite.typeActivite', 'typeActivite')
        .leftJoin(
          'archived_sport_activity_types',
          'archived_type',
          'archived_type.type_id = activite.original_type_activite_id',
        )
        .select([
          'activite.id',
          'activite.matricule',
          'activite.nom',
          'activite.prenom',
          'activite.age',
          'activite.beneficiaire',
          'activite.type_activite_id',
          'activite.original_type_activite_id',
          'activite.date_inscription',
          'typeActivite.nom AS type_nom',
          'archived_type.nom AS archived_type_nom',
        ])
        .where('activite.id = :id', { id })
        .getRawOne();

      if (!result) {
        throw new NotFoundException(
          `Activité sportive avec ID ${id} non trouvée`,
        );
      }

      this.logger.log(
        `Activité ID ${result.activite_id}: type_activite_id=${result.activite_type_activite_id}, original_type_activite_id=${result.activite_original_type_activite_id}, type_nom=${result.type_nom}, archived_type_nom=${result.archived_type_nom}`,
      );

      let type_activite_nom_etat: string;
      if (result.activite_type_activite_id && result.type_nom) {
        type_activite_nom_etat = `${result.type_nom} (En cours)`;
        this.logger.log(
          `Type actif pour ID ${result.activite_id}: ${type_activite_nom_etat}`,
        );
      } else if (
        result.activite_original_type_activite_id &&
        result.archived_type_nom
      ) {
        type_activite_nom_etat = `${result.archived_type_nom} (Expiré)`;
        this.logger.log(
          `Type archivé pour ID ${result.activite_id}: ${type_activite_nom_etat}`,
        );
      } else {
        type_activite_nom_etat = 'Non assigné';
        this.logger.log(`Aucun type pour activité ID ${result.activite_id}`);
      }

      const activite = {
        id: result.activite_id,
        matricule: result.activite_matricule,
        nom: result.activite_nom,
        prenom: result.activite_prenom,
        age: result.activite_age,
        beneficiaire: result.activite_beneficiaire,
        type_activite_id: result.activite_type_activite_id,
        original_type_activite_id: result.activite_original_type_activite_id,
        date_inscription: result.activite_date_inscription,
        type_activite_nom_etat,
      };

      this.logger.log(
        `Activité ID ${id} récupérée: ${JSON.stringify(activite)}`,
      );
      return activite;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de l'activité ID ${id}: ${error.message}`,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Échec de la récupération de l’activité',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateActiviteSportiveDto,
  ): Promise<ActivitesSportives> {
    try {
      const activite = await this.activitesRepository.findOne({
        where: { id },
        relations: ['typeActivite'],
      });
      if (!activite) {
        throw new NotFoundException(
          `Activité sportive avec ID ${id} non trouvée`,
        );
      }

      if (
        updateDto.beneficiaire === 'enfant' &&
        (updateDto.age === undefined || updateDto.age === null)
      ) {
        throw new InternalServerErrorException(
          "L’âge est requis pour un bénéficiaire 'enfant'",
        );
      }
      if (updateDto.beneficiaire === 'Agent TT') {
        updateDto.age = null;
      }

      let typeActivite: TypeActiviteSportive | null = null;
      if (updateDto.type_activite_id !== undefined) {
        if (updateDto.type_activite_id) {
          typeActivite = await this.typeActiviteSportiveService.findOne(
            updateDto.type_activite_id,
          );
        }
        activite.typeActivite = typeActivite;
        activite.type_activite_id = typeActivite ? typeActivite.id : null;
        activite.original_type_activite_id = typeActivite
          ? typeActivite.id
          : activite.original_type_activite_id;
      }

      if (updateDto.matricule !== undefined)
        activite.matricule = updateDto.matricule;
      if (updateDto.nom !== undefined) activite.nom = updateDto.nom;
      if (updateDto.prenom !== undefined) activite.prenom = updateDto.prenom;
      if (updateDto.age !== undefined) activite.age = updateDto.age;
      if (updateDto.beneficiaire !== undefined)
        activite.beneficiaire = updateDto.beneficiaire;

      const updatedActivite = await this.activitesRepository.save(activite);
      this.logger.log(`Activité sportive ID ${id} mise à jour avec succès`);
      return updatedActivite;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'activité ID ${id}: ${error.message}`,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Échec de la mise à jour de l’activité',
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.activitesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Activité sportive avec ID ${id} non trouvée`,
        );
      }
      this.logger.log(`Activité sportive ID ${id} supprimée avec succès`);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'activité ID ${id}: ${error.message}`,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Échec de la suppression de l’activité',
      );
    }
  }

  async findByTypeActivite(type_id: number): Promise<ActivitesSportives[]> {
    try {
      const activites = await this.activitesRepository.find({
        where: { type_activite_id: type_id },
        relations: ['typeActivite'],
      });
      this.logger.log(
        `Activités récupérées pour type ID ${type_id}: ${activites.length} éléments`,
      );
      return activites;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche par type ID ${type_id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Échec de la recherche par type d’activité',
      );
    }
  }
}

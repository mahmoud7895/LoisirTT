import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeActiviteSportive } from './type-activite-sportive.entity';
import { ActivitesSportives } from '../activites-sportives/activites-sportives.entity';
import { ArchivedSportActivityTypesService } from '../archived-sport-activity-types/archived-sport-activity-types.service';

@Injectable()
export class TypeActiviteSportiveService {
  private readonly logger = new Logger(TypeActiviteSportiveService.name);

  constructor(
    @InjectRepository(TypeActiviteSportive)
    private typeActiviteRepository: Repository<TypeActiviteSportive>,
    @InjectRepository(ActivitesSportives)
    private activiteSportiveRepository: Repository<ActivitesSportives>,
    private readonly archivedSportActivityTypesService: ArchivedSportActivityTypesService,
  ) {}

  async create(
    nom: string,
    status: string = 'en cours',
  ): Promise<TypeActiviteSportive> {
    try {
      if (!nom || !nom.trim()) {
        throw new NotFoundException(
          "Le nom du type d'activité ne peut pas être vide.",
        );
      }
      const typeActivite = this.typeActiviteRepository.create({
        nom: nom.trim(),
        status: status.trim(),
      });
      const result = await this.typeActiviteRepository.save(typeActivite);
      this.logger.log(
        `Type d'activité créé avec succès: ID ${result.id}, nom: ${nom}, status: ${status}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        "Erreur lors de la création du type d'activité:",
        error,
      );
      throw new InternalServerErrorException(
        "Échec de la création du type d'activité",
      );
    }
  }

  async findAll(): Promise<TypeActiviteSportive[]> {
    try {
      const types = await this.typeActiviteRepository.find({
        where: { status: 'en cours' },
      });
      this.logger.log(`Types d'activité récupérés: ${types.length} éléments`);
      return types;
    } catch (error) {
      this.logger.error(
        "Erreur lors de la récupération des types d'activité:",
        error,
      );
      throw new InternalServerErrorException(
        "Échec de la récupération des types d'activité",
      );
    }
  }

  async findOne(id: number): Promise<TypeActiviteSportive> {
    try {
      const typeActivite = await this.typeActiviteRepository.findOne({
        where: { id },
      });
      if (!typeActivite) {
        throw new NotFoundException(
          `Type d'activité sportive avec ID ${id} non trouvé`,
        );
      }
      return typeActivite;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération du type ID ${id}:`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Échec de la récupération du type d'activité",
      );
    }
  }

  async update(
    id: number,
    nom: string,
    status?: string,
  ): Promise<TypeActiviteSportive> {
    try {
      if (!nom || !nom.trim()) {
        throw new NotFoundException(
          "Le nom du type d'activité ne peut pas être vide.",
        );
      }
      const typeActivite = await this.findOne(id);
      typeActivite.nom = nom.trim();
      if (status) {
        typeActivite.status = status.trim();
      }
      const result = await this.typeActiviteRepository.save(typeActivite);
      this.logger.log(
        `Type d'activité ID ${id} mis à jour avec succès: nom: ${nom}, status: ${result.status}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du type ID ${id}:`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Échec de la mise à jour du type d'activité",
      );
    }
  }

  async isTypeUsed(id: number): Promise<boolean> {
    try {
      const count = await this.activiteSportiveRepository.count({
        where: { type_activite_id: id },
      });
      this.logger.log(
        `Vérification d'utilisation du type ID ${id}: ${count} activités associées`,
      );
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la vérification d'utilisation du type ID ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        "Échec de la vérification d'utilisation du type",
      );
    }
  }

  async remove(id: number, deletedBy?: string): Promise<void> {
    try {
      const typeActivite = await this.findOne(id);

      // Vérifier si le type est déjà archivé pour éviter les doublons
      const existingArchive =
        await this.archivedSportActivityTypesService.findByTypeId(id);
      if (!existingArchive) {
        await this.archivedSportActivityTypesService.archiveSportActivityType(
          typeActivite.id,
          typeActivite.nom,
          deletedBy || 'system',
        );
        this.logger.log(`Type ID ${id} archivé avec succès`);
      } else {
        this.logger.log(`Type ID ${id} déjà archivé, archivage ignoré`);
      }

      // Compter les activités associées avant mise à jour
      const activitesCount = await this.activiteSportiveRepository.count({
        where: { type_activite_id: id },
      });
      this.logger.log(
        `Nombre d'activités associées au type ID ${id}: ${activitesCount}`,
      );

      // Mettre à jour les activités associées en une seule requête
      const updateResult = await this.activiteSportiveRepository
        .createQueryBuilder()
        .update(ActivitesSportives)
        .set({
          type_activite_id: null,
          original_type_activite_id: id,
        })
        .where('type_activite_id = :id', { id })
        .execute();
      this.logger.log(
        `Activités associées au type ID ${id} mises à jour: ${updateResult.affected} affectées`,
      );

      // Marquer le type comme expiré
      typeActivite.status = 'expiré';
      await this.typeActiviteRepository.save(typeActivite);
      this.logger.log(`Type ID ${id} marqué comme expiré`);

      // Supprimer le type d'activité
      const deleteResult = await this.typeActiviteRepository.delete(id);
      if (deleteResult.affected === 0) {
        throw new NotFoundException(
          `Type d'activité sportive avec ID ${id} non trouvé`,
        );
      }
      this.logger.log(`Type d'activité sportive ID ${id} supprimé avec succès`);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression du type ID ${id}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Échec de la suppression du type d'activité: ${error.message}`,
      );
    }
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivedSportActivityType } from './archived-sport-activity-type.entity';

@Injectable()
export class ArchivedSportActivityTypesService {
  private readonly logger = new Logger(ArchivedSportActivityTypesService.name);

  constructor(
    @InjectRepository(ArchivedSportActivityType)
    private readonly archivedTypeRepository: Repository<ArchivedSportActivityType>,
  ) {}

  async archiveSportActivityType(
    typeId: number,
    nom: string,
    deletedBy?: string,
  ): Promise<ArchivedSportActivityType> {
    try {
      const archivedType = this.archivedTypeRepository.create({
        type_id: typeId,
        nom,
        archived_at: new Date(),
        deleted_by: deletedBy || 'system',
      });
      const saved = await this.archivedTypeRepository.save(archivedType);
      this.logger.log(
        `Type archivé sauvegardé: ${JSON.stringify(saved, null, 2)}`,
      );
      return Array.isArray(saved) ? saved[0] : saved;
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'archivage du type ID ${typeId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Échec de l’archivage du type d’activité',
      );
    }
  }

  async findByTypeId(
    typeId: number,
  ): Promise<ArchivedSportActivityType | null> {
    try {
      const archivedType = await this.archivedTypeRepository.findOne({
        where: { type_id: typeId },
      });
      if (!archivedType) {
        this.logger.log(`Aucun type archivé trouvé pour type_id ${typeId}`);
      }
      return archivedType;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche d'archive pour type_id ${typeId}: ${error.message}`,
      );
      throw new InternalServerErrorException("Échec de la recherche d'archive");
    }
  }

  async findAll(): Promise<ArchivedSportActivityType[]> {
    try {
      const archivedTypes = await this.archivedTypeRepository.find({
        order: { archived_at: 'DESC' },
      });
      this.logger.log(
        `Types archivés récupérés: ${archivedTypes.length} éléments`,
      );
      return archivedTypes;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des types archivés: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Échec de la récupération des types archivés',
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivedClubType } from './archived-club-type.entity';

@Injectable()
export class ArchivedClubTypesService {
  constructor(
    @InjectRepository(ArchivedClubType)
    private readonly archivedTypeRepository: Repository<ArchivedClubType>,
  ) {}

  async archiveClubType(
    type_id: number,
    name: string,
    deletedBy?: string,
  ): Promise<ArchivedClubType> {
    const archivedType = this.archivedTypeRepository.create({
      type_id,
      name,
      deletedBy,
    });
    return await this.archivedTypeRepository.save(archivedType);
  }

  async findByOriginaltype_id(
    type_id: number,
  ): Promise<ArchivedClubType | null> {
    return this.archivedTypeRepository.findOne({
      where: { type_id },
      order: { archived_at: 'DESC' },
    });
  }

  async findAll(): Promise<ArchivedClubType[]> {
    return this.archivedTypeRepository.find({
      order: { archived_at: 'DESC' },
    });
  }
}

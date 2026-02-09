import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeClub } from './type-club.entity';
import { Club } from '../clubs/clubs.entity';
import { ArchivedClubTypesService } from '../archived-club-types/archived-club-types.service';

@Injectable()
export class TypeClubService {
  constructor(
    @InjectRepository(TypeClub)
    private typeClubRepository: Repository<TypeClub>,
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    private readonly archivedClubTypesService: ArchivedClubTypesService,
  ) {}

  async create(name: string): Promise<TypeClub> {
    if (!name || !name.trim()) {
      throw new NotFoundException(
        'Le nom du type de club ne peut pas être vide.',
      );
    }
    const typeClub = this.typeClubRepository.create({
      name: name.trim(),
      status: 'en cours',
    });
    return this.typeClubRepository.save(typeClub);
  }

  async findAll(): Promise<TypeClub[]> {
    return this.typeClubRepository.find();
  }

  async findOne(id: number): Promise<TypeClub> {
    const typeClub = await this.typeClubRepository.findOne({ where: { id } });
    if (!typeClub) {
      throw new NotFoundException(`TypeClub with ID ${id} not found`);
    }
    return typeClub;
  }

  async update(id: number, name: string): Promise<TypeClub> {
    if (!name || !name.trim()) {
      throw new NotFoundException(
        'Le nom du type de club ne peut pas être vide.',
      );
    }
    const typeClub = await this.findOne(id);
    typeClub.name = name.trim();
    return this.typeClubRepository.save(typeClub);
  }

  async remove(id: number, deletedBy?: string): Promise<void> {
    const typeClub = await this.findOne(id);

    // Archiver le type de club
    await this.archivedClubTypesService.archiveClubType(
      typeClub.id,
      typeClub.name,
      deletedBy,
    );

    // Mettre à jour les clubs associés
    await this.clubRepository.update(
      { type_club_id: id },
      {
        type_club_id: null,
        original_type_club_id: id,
      },
    );

    // Supprimer le type de club
    await this.typeClubRepository.delete(id);
  }
}

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './clubs.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { TypeClub } from '../type-club/type-club.entity';
import { TypeClubService } from '../type-club/type-club.service';
import { ArchivedClubType } from '../archived-club-types/archived-club-type.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubsRepository: Repository<Club>,
    @InjectRepository(ArchivedClubType)
    private archivedClubTypeRepository: Repository<ArchivedClubType>,
    private typeClubService: TypeClubService,
  ) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    // Vérification des champs obligatoires
    if (
      !createClubDto.matricule ||
      !createClubDto.nom ||
      !createClubDto.prenom ||
      !createClubDto.beneficiaire
    ) {
      throw new InternalServerErrorException(
        'Tous les champs obligatoires doivent être remplis',
      );
    }

    // Validation conditionnelle pour l'âge
    if (
      createClubDto.beneficiaire === 'enfant' &&
      (createClubDto.age === undefined || createClubDto.age === null)
    ) {
      throw new InternalServerErrorException(
        "L'âge est requis pour un bénéficiaire 'enfant'",
      );
    }
    if (createClubDto.beneficiaire === 'Agent TT') {
      createClubDto.age = null; // Forcer à null si Agent TT
    }

    let typeClub: TypeClub | null = null;
    if (createClubDto.type_club_id) {
      typeClub = await this.typeClubService.findOne(createClubDto.type_club_id);
      if (!typeClub) {
        throw new NotFoundException(
          `TypeClub with ID ${createClubDto.type_club_id} not found`,
        );
      }
    }

    const club = this.clubsRepository.create({
      matricule: createClubDto.matricule,
      nom: createClubDto.nom,
      prenom: createClubDto.prenom,
      age: createClubDto.age,
      beneficiaire: createClubDto.beneficiaire,
      type_club: typeClub,
      type_club_id: typeClub ? typeClub.id : null,
      original_type_club_id: typeClub ? typeClub.id : null,
      date_inscription: new Date(),
    });

    return this.clubsRepository.save(club);
  }

  async findAll(): Promise<any[]> {
    const clubs = await this.clubsRepository
      .createQueryBuilder('club')
      .leftJoinAndSelect('club.type_club', 'type_club')
      .leftJoinAndSelect('club.original_type_club', 'original_type_club')
      .select([
        'club.id',
        'club.matricule',
        'club.nom',
        'club.prenom',
        'club.age',
        'club.beneficiaire',
        'club.type_club_id',
        'club.original_type_club_id',
        'club.date_inscription',
        'type_club.id',
        'type_club.name',
        'original_type_club.id',
        'original_type_club.name',
      ])
      .orderBy('club.date_inscription', 'DESC')
      .getMany();

    return Promise.all(
      clubs.map(async (club) => {
        let type_club_nom_etat: string;

        if (club.type_club) {
          type_club_nom_etat = `${club.type_club.name} (en cours)`;
        } else if (club.original_type_club_id) {
          const archivedType = await this.archivedClubTypeRepository.findOne({
            where: { type_id: club.original_type_club_id },
            order: { archived_at: 'DESC' },
          });
          type_club_nom_etat = archivedType
            ? `${archivedType.name} (expiré)`
            : 'Non assigné';
        } else {
          type_club_nom_etat = 'Non assigné';
        }

        return {
          ...club,
          type_club_nom_etat,
        };
      }),
    );
  }

  async findOne(id: number): Promise<any> {
    const club = await this.clubsRepository.findOne({
      where: { id },
      relations: ['type_club', 'original_type_club'],
    });
    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    let type_club_nom_etat: string;
    if (club.type_club) {
      type_club_nom_etat = `${club.type_club.name} (en cours)`;
    } else if (club.original_type_club_id) {
      const archivedType = await this.archivedClubTypeRepository.findOne({
        where: { type_id: club.original_type_club_id },
        order: { archived_at: 'DESC' },
      });
      type_club_nom_etat = archivedType
        ? `${archivedType.name} (expiré)`
        : 'Non assigné';
    } else {
      type_club_nom_etat = 'Non assigné';
    }

    return {
      ...club,
      type_club_nom_etat,
    };
  }

  async update(id: number, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.clubsRepository.findOne({
      where: { id },
      relations: ['type_club', 'original_type_club'],
    });
    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    // Validation conditionnelle pour l'âge si beneficiaire est mis à jour
    if (
      updateClubDto.beneficiaire === 'enfant' &&
      updateClubDto.age === undefined
    ) {
      throw new InternalServerErrorException(
        "L'âge est requis pour un bénéficiaire 'enfant'",
      );
    }
    if (updateClubDto.beneficiaire === 'Agent TT') {
      updateClubDto.age = null; // Forcer à null si Agent TT
    }

    let typeClub: TypeClub | null = null;
    if (updateClubDto.type_club_id !== undefined) {
      if (updateClubDto.type_club_id) {
        typeClub = await this.typeClubService.findOne(
          updateClubDto.type_club_id,
        );
        if (!typeClub) {
          throw new NotFoundException(
            `TypeClub with ID ${updateClubDto.type_club_id} not found`,
          );
        }
      }
      club.type_club = typeClub;
      club.type_club_id = typeClub ? typeClub.id : null;
      club.original_type_club_id = typeClub
        ? typeClub.id
        : club.original_type_club_id;
    }

    if (updateClubDto.matricule !== undefined) {
      club.matricule = updateClubDto.matricule;
    }
    if (updateClubDto.nom !== undefined) {
      club.nom = updateClubDto.nom;
    }
    if (updateClubDto.prenom !== undefined) {
      club.prenom = updateClubDto.prenom;
    }
    if (updateClubDto.age !== undefined) {
      club.age = updateClubDto.age;
    }
    if (updateClubDto.beneficiaire !== undefined) {
      club.beneficiaire = updateClubDto.beneficiaire;
    }

    return this.clubsRepository.save(club);
  }

  async remove(id: number): Promise<void> {
    const result = await this.clubsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }
  }

  async findByTypeClub(typeClubId: number): Promise<Club[]> {
    return this.clubsRepository.find({
      where: { type_club_id: typeClubId },
      relations: ['type_club', 'original_type_club'],
    });
  }

  async countByTypeClub(typeClubId: number): Promise<number> {
    return this.clubsRepository.count({
      where: { type_club_id: typeClubId },
    });
  }
}

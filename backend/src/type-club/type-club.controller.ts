import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TypeClubService } from './type-club.service';
import { TypeClub } from './type-club.entity';

@ApiTags('Types de Clubs')
@Controller('type-clubs')
export class TypeClubController {
  constructor(private readonly typeClubService: TypeClubService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les types de clubs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des types de clubs',
    type: [TypeClub],
  })
  async findAll(): Promise<TypeClub[]> {
    return this.typeClubService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un type de club par ID' })
  @ApiResponse({
    status: 200,
    description: 'Type de club trouvé',
    type: TypeClub,
  })
  @ApiResponse({ status: 404, description: 'Type de club non trouvé' })
  async findOne(@Param('id') id: string): Promise<TypeClub> {
    return this.typeClubService.findOne(parseInt(id, 10));
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau type de club' })
  @ApiResponse({
    status: 201,
    description: 'Type de club créé',
    type: TypeClub,
  })
  @ApiResponse({ status: 400, description: 'Nom du type de club invalide' })
  async create(@Body('name') name: string): Promise<TypeClub> {
    if (!name || !name.trim()) {
      throw new NotFoundException(
        'Le nom du type de club ne peut pas être vide.',
      );
    }
    return this.typeClubService.create(name.trim());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un type de club' })
  @ApiResponse({
    status: 200,
    description: 'Type de club mis à jour',
    type: TypeClub,
  })
  @ApiResponse({ status: 404, description: 'Type de club non trouvé' })
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
  ): Promise<TypeClub> {
    if (!name || !name.trim()) {
      throw new NotFoundException(
        'Le nom du type de club ne peut pas être vide.',
      );
    }
    return this.typeClubService.update(parseInt(id, 10), name.trim());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un type de club' })
  @ApiResponse({
    status: 200,
    description:
      'Type de club supprimé, archivé et inscriptions associées marquées comme expirées',
  })
  @ApiResponse({ status: 404, description: 'Type de club non trouvé' })
  @ApiResponse({ status: 400, description: 'Erreur lors de la suppression' })
  async remove(@Param('id') id: string) {
    const deletedBy = undefined; // À adapter selon votre gestion d'authentification
    const typeClub = await this.typeClubService.findOne(parseInt(id, 10));
    await this.typeClubService.remove(parseInt(id, 10), deletedBy);
    return {
      message: `Type de club "${typeClub.name}" supprimé avec succès, archivé et les inscriptions associées marquées comme "${typeClub.name} (expiré)".`,
    };
  }
}

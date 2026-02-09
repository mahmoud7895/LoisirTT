import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TypeActiviteSportiveService } from './type-activite-sportive.service';
import { TypeActiviteSportive } from './type-activite-sportive.entity';

@ApiTags("Types d'Activités Sportives")
@Controller('type-activite-sportive')
export class TypeActiviteSportiveController {
  constructor(
    private readonly typeActiviteService: TypeActiviteSportiveService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Lister tous les types d'activités sportives actifs",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des types d'activités actifs",
    type: [TypeActiviteSportive],
  })
  async findAll(): Promise<TypeActiviteSportive[]> {
    return this.typeActiviteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Obtenir un type d'activité sportive par ID" })
  @ApiResponse({
    status: 200,
    description: "Type d'activité trouvé",
    type: TypeActiviteSportive,
  })
  @ApiResponse({ status: 404, description: 'Type non trouvé' })
  async findOne(@Param('id') id: string): Promise<TypeActiviteSportive> {
    return this.typeActiviteService.findOne(parseInt(id, 10));
  }

  @Post()
  @ApiOperation({ summary: "Créer un nouveau type d'activité sportive" })
  @ApiResponse({
    status: 201,
    description: 'Type créé avec succès',
    type: TypeActiviteSportive,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Body('nom') nom: string,
    @Body('status') status?: string,
  ): Promise<TypeActiviteSportive> {
    try {
      if (!nom || !nom.trim()) {
        throw new NotFoundException(
          "Le nom du type d'activité ne peut pas être vide.",
        );
      }
      return await this.typeActiviteService.create(nom.trim(), status);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: "Mettre à jour un type d'activité sportive" })
  @ApiResponse({
    status: 200,
    description: 'Type mis à jour avec succès',
    type: TypeActiviteSportive,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Type non trouvé' })
  async update(
    @Param('id') id: string,
    @Body('nom') nom: string,
    @Body('status') status?: string,
  ): Promise<{ message: string; data: TypeActiviteSportive }> {
    try {
      if (!nom || !nom.trim()) {
        throw new NotFoundException(
          "Le nom du type d'activité ne peut pas être vide.",
        );
      }
      const updatedType = await this.typeActiviteService.update(
        parseInt(id, 10),
        nom.trim(),
        status,
      );
      return {
        message: "Type d'activité sportive mis à jour avec succès",
        data: updatedType,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un type d'activité sportive" })
  @ApiResponse({
    status: 200,
    description:
      'Type supprimé, archivé et inscriptions associées marquées comme expirées',
  })
  @ApiResponse({ status: 404, description: 'Type non trouvé' })
  @ApiResponse({ status: 400, description: 'Erreur lors de la suppression' })
  async remove(@Param('id') id: string) {
    try {
      const typeActivite = await this.typeActiviteService.findOne(
        parseInt(id, 10),
      );
      const deletedBy = undefined; // À adapter selon votre gestion d'authentification
      await this.typeActiviteService.remove(parseInt(id, 10), deletedBy);
      return {
        message: `Type d'activité "${typeActivite.nom}" supprimé avec succès, archivé et les inscriptions associées marquées comme "${typeActivite.nom} (expiré)."`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/can-delete')
  @ApiOperation({ summary: 'Vérifier si un type peut être supprimé' })
  @ApiResponse({ status: 200, description: 'Résultat de la vérification' })
  async canDelete(@Param('id') id: string) {
    try {
      const canDelete = !(await this.typeActiviteService.isTypeUsed(
        parseInt(id, 10),
      ));
      return { canDelete };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

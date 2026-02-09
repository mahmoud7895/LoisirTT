import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ActivitesSportivesService } from './activites-sportives.service';
import { CreateActiviteSportiveDto } from './dto/create-activite-sportive.dto';
import { UpdateActiviteSportiveDto } from './dto/update-activite-sportive.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivitesSportives } from './activites-sportives.entity';

@ApiTags('Activités Sportives')
@Controller('activites-sportives')
export class ActivitesSportivesController {
  constructor(private readonly activitesService: ActivitesSportivesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle activité sportive' })
  @ApiResponse({
    status: 201,
    description: 'Activité créée',
    type: ActivitesSportives,
  })
  async create(@Body() createDto: CreateActiviteSportiveDto) {
    return this.activitesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les activités sportives' })
  @ApiResponse({
    status: 200,
    description: 'Liste des activités',
    type: [ActivitesSportives],
  })
  findAll() {
    return this.activitesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une activité sportive par ID' })
  @ApiResponse({
    status: 200,
    description: 'Activité trouvée',
    type: ActivitesSportives,
  })
  @ApiResponse({ status: 404, description: 'Activité non trouvée' })
  findOne(@Param('id') id: string) {
    return this.activitesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une activité sportive' })
  @ApiResponse({
    status: 200,
    description: 'Activité mise à jour',
    type: ActivitesSportives,
  })
  @ApiResponse({ status: 404, description: 'Activité non trouvée' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateActiviteSportiveDto,
  ) {
    return this.activitesService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une activité sportive' })
  @ApiResponse({ status: 200, description: 'Activité supprimée' })
  @ApiResponse({ status: 404, description: 'Activité non trouvée' })
  async remove(@Param('id') id: string) {
    await this.activitesService.delete(+id);
    return { message: 'Activité supprimée avec succès' };
  }

  @Get('type/:type_id')
  @ApiOperation({ summary: 'Lister les activités par type' })
  @ApiResponse({
    status: 200,
    description: 'Liste des activités par type',
    type: [ActivitesSportives],
  })
  findByType(@Param('type_id') type_id: string) {
    return this.activitesService.findByTypeActivite(+type_id);
  }
}

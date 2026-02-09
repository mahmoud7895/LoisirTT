import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ArchivedClubTypesService } from './archived-club-types.service';
import { CreateArchivedClubTypeDto } from './create-archived-club-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Archives - Types de Clubs')
@Controller('archives/club-types')
export class ArchivedClubTypesController {
  constructor(
    private readonly archivedClubTypesService: ArchivedClubTypesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Archiver un type de club' })
  @ApiResponse({ status: 201, description: 'Type archivé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async create(@Body() dto: CreateArchivedClubTypeDto) {
    return this.archivedClubTypesService.archiveClubType(
      dto.type_id,
      dto.name,
      dto.deletedBy,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lister les types archivés' })
  @ApiQuery({ name: 'type_id', required: false })
  async findAll(@Query('type_id') type_id?: number) {
    if (type_id) {
      return this.archivedClubTypesService.findByOriginaltype_id(type_id);
    }
    return this.archivedClubTypesService.findAll();
  }
}

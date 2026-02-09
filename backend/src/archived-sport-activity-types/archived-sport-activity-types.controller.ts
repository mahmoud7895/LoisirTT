import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ArchivedSportActivityTypesService } from './archived-sport-activity-types.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArchivedSportActivityType } from './archived-sport-activity-type.entity';

@ApiTags('Archived Sport Activity Types')
@Controller('archived-sport-activity-types')
export class ArchivedSportActivityTypesController {
  constructor(
    private readonly archivedSportActivityTypesService: ArchivedSportActivityTypesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Archive a sport activity type' })
  @ApiResponse({
    status: 201,
    description: 'Type archived successfully',
    type: ArchivedSportActivityType,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async archiveType(
    @Body('type_id') type_id: number,
    @Body('nom') nom: string,
    @Body('deletedBy') deletedBy?: string,
  ): Promise<ArchivedSportActivityType> {
    try {
      return await this.archivedSportActivityTypesService.archiveSportActivityType(
        type_id,
        nom,
        deletedBy,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

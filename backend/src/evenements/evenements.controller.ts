import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EvenementsService } from './evenements.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventExpirationService } from './event-expiration.service';

@Controller('evenements')
export class EvenementsController {
  constructor(
    private readonly evenementsService: EvenementsService,
    private readonly eventExpirationService: EventExpirationService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('eventImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createEvenementDto: CreateEvenementDto,
    @UploadedFile() eventImage: Express.Multer.File,
  ) {
    return this.evenementsService.create(createEvenementDto, eventImage);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const events = await this.evenementsService.findAll();
    await this.eventExpirationService.checkExpiredEvents(); // Vérification à chaque récupération
    return events;
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('eventImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEvenementDto: CreateEvenementDto,
    @UploadedFile() eventImage: Express.Multer.File,
  ) {
    return this.evenementsService.update(+id, updateEvenementDto, eventImage);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.evenementsService.remove(+id);
  }

  @Get('check-expired')
  @UseGuards(JwtAuthGuard)
  async checkExpired() {
    await this.eventExpirationService.checkExpiredEvents();
    return { message: 'Vérification des événements terminés effectuée.' };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { CreateInscriptionDto } from './create-inscription.dto';
import { UpdateInscriptionDto } from './update-inscription.dto';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inscription')
export class InscriptionController {
  constructor(
    private readonly inscriptionService: InscriptionService,
    private readonly jwtService: JwtService,
  ) {}

  // Créer une inscription
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createInscriptionDto: CreateInscriptionDto,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide.');
    }

    return this.inscriptionService.create(createInscriptionDto, payload.sub);
  }

  // Récupérer toutes les inscriptions
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide.');
    }

    return this.inscriptionService.findAll(payload.isAdmin);
  }

  // Supprimer une inscription
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number, @Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide.');
    }

    return this.inscriptionService.remove(id, payload.isAdmin);
  }

  // Mettre à jour une inscription
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateInscriptionDto: UpdateInscriptionDto,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide.');
    }

    return this.inscriptionService.update(id, updateInscriptionDto, payload.sub, payload.isAdmin);
  }

  // Vérifier si un utilisateur est inscrit à un événement
  @Get('check/:eventId/:userId')
  @UseGuards(JwtAuthGuard)
  async checkInscription(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(`Token invalide: ${error.message}`);
    }

    const isInscribed = await this.inscriptionService.checkInscription(
      Number(eventId),
      Number(userId),
    );
    return { isInscribed };
  }
}
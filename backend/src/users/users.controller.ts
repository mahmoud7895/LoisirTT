import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ConflictException,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Créer un utilisateur
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return { message: 'Inscription réussie', user };
    } catch (error) {
      if (error.code === '23505' || error instanceof ConflictException) {
        throw new ConflictException('La matricule existe déjà.');
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message || "Erreur lors de l'inscription",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Récupérer tous les utilisateurs
  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return users;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur lors de la récupération des utilisateurs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Récupérer un utilisateur par son ID
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Erreur lors de la récupération de l'utilisateur",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Mettre à jour un utilisateur
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return { message: 'Utilisateur mis à jour avec succès', user };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException('La matricule existe déjà.');
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error.message || "Erreur lors de la mise à jour de l'utilisateur",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Supprimer un utilisateur
  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.usersService.remove(id);
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Erreur lors de la suppression de l'utilisateur",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

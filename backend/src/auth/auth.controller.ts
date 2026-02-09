// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    console.log('AuthController initialisé');
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    console.log('Requête POST /auth/login reçue avec body:', req.body);
    console.log('Utilisateur après LocalAuthGuard:', req.user);

    try {
      const response = await this.authService.login(req.user);
      console.log('Réponse envoyée au client:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error.message, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Identifiants incorrects',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

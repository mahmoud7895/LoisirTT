// backend/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    console.log('AuthService initialisé');
  }

  async validateUser(login: string, password: string): Promise<any> {
    console.log(`Tentative de connexion avec login: ${login}`);

    // Vérifier si l'utilisateur est l'administrateur
    if (login === 'Admin' && password === 'Admin') {
      console.log("Connexion en tant qu'administrateur");
      const adminUser = {
        id: 0,
        login: 'Admin',
        matricule: 'ADMIN-001',
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@tunisietelecom.tn',
        telephone: '+216 71 123 456',
        residenceAdministrative: 'Direction',
        date_inscription: new Date().toISOString(),
        isAdmin: true,
      };
      console.log('Données admin renvoyées:', adminUser);
      return adminUser;
    }

    // Sinon, vérifier l'utilisateur dans la base de données
    const user = await this.usersService.findOneByLogin(login);
    if (!user) {
      console.log('Utilisateur non trouvé');
      return null;
    }

    console.log(`Utilisateur trouvé: ${user.login}`);
    const isPasswordValid = await bcrypt.compare(password, user.motDePasse);
    if (isPasswordValid) {
      console.log('Mot de passe valide');
      const { motDePasse, ...result } = user;
      const userData = {
        ...result,
        isAdmin: false,
      };
      console.log('Données utilisateur renvoyées:', userData);
      return userData;
    }

    console.log('Mot de passe incorrect');
    return null;
  }

  async login(user: any) {
    console.log(`Génération du token pour l'utilisateur: ${user.login}`);
    const payload = {
      username: user.login,
      sub: user.id,
      matricule: user.matricule,
      isAdmin: user.isAdmin,
      nom: user.nom,
      prenom: user.prenom,
    };

    const access_token = this.jwtService.sign(payload);
    console.log(`Token généré pour ${user.login}`);

    const response = {
      access_token,
      user: {
        id: user.id,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        residenceAdministrative: user.residenceAdministrative,
        date_inscription: user.date_inscription,
        isAdmin: user.isAdmin,
      },
      redirectTo: user.isAdmin ? '/admin' : '/personnel',
    };
    console.log('Réponse complète de login:', response);
    return response;
  }
}

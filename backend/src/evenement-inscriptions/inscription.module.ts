import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscriptionController } from './inscription.controller';
import { InscriptionService } from './inscription.service';
import { Inscription } from './inscription.entity';
import { Evenement } from '../evenements/evenement.entity';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscription, Evenement, User]),
    JwtModule.register({
      secret: 'ma_clé_secrète_sécurisée_1234567890', // Assurez-vous que ceci correspond à votre configuration
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [InscriptionController],
  providers: [InscriptionService],
})
export class InscriptionModule {}

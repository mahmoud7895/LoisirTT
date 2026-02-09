import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EvenementsController } from './evenements.controller';
import { EvenementsService } from './evenements.service';
import { EventExpirationService } from './event-expiration.service';
import { Evenement } from './evenement.entity';
import { MailerModule } from '../mailer/mailer.module';
import { User } from '../users/entities/user.entity';
import { Inscription } from '../evenement-inscriptions/inscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evenement, User, Inscription]),
    MailerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [EvenementsController],
  providers: [EvenementsService, EventExpirationService],
  exports: [EvenementsService],
})
export class EvenementsModule {}

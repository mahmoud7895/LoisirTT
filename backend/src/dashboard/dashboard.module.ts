import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardGateway } from './dashboard.gateway'; // Importer DashboardGateway
import { Club } from '../clubs/clubs.entity';
import { TypeClub } from '../type-club/type-club.entity';
import { ArchivedClubType } from '../archived-club-types/archived-club-type.entity';
import { ActivitesSportives } from '../activites-sportives/activites-sportives.entity';
import { TypeActiviteSportive } from '../type-activite-sportive/type-activite-sportive.entity';
import { ArchivedSportActivityType } from '../archived-sport-activity-types/archived-sport-activity-type.entity';
import { User } from '../users/entities/user.entity';
import { Review } from '../reviews/review.entity';
import { Evenement } from '../evenements/evenement.entity';
import { Inscription } from '../evenement-inscriptions/inscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      TypeClub,
      ArchivedClubType,
      ActivitesSportives,
      TypeActiviteSportive,
      ArchivedSportActivityType,
      User,
      Review,
      Evenement,
      Inscription,
    ]),
  ],
  providers: [DashboardService, DashboardGateway], // Ajouter DashboardGateway
})
export class DashboardModule {}

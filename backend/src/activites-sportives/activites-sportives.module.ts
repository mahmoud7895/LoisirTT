import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitesSportivesService } from './activites-sportives.service';
import { ActivitesSportivesController } from './activites-sportives.controller';
import { ActivitesSportives } from './activites-sportives.entity';
import { ArchivedSportActivityType } from '../archived-sport-activity-types/archived-sport-activity-type.entity';
import { ArchivedSportActivityTypesModule } from '../archived-sport-activity-types/archived-sport-activity-types.module';
import { TypeActiviteSportiveModule } from '../type-activite-sportive/type-activite-sportive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivitesSportives, ArchivedSportActivityType]),
    ArchivedSportActivityTypesModule,
    TypeActiviteSportiveModule, // Importer le module qui fournit TypeActiviteSportiveService
  ],
  providers: [ActivitesSportivesService],
  controllers: [ActivitesSportivesController],
  exports: [ActivitesSportivesService],
})
export class ActivitesSportivesModule {}

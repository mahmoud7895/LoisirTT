import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeActiviteSportive } from './type-activite-sportive.entity';
import { ActivitesSportives } from '../activites-sportives/activites-sportives.entity';
import { TypeActiviteSportiveService } from './type-activite-sportive.service';
import { TypeActiviteSportiveController } from './type-activite-sportive.controller';
import { ArchivedSportActivityTypesModule } from '../archived-sport-activity-types/archived-sport-activity-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeActiviteSportive, ActivitesSportives]),
    ArchivedSportActivityTypesModule,
  ],
  controllers: [TypeActiviteSportiveController],
  providers: [TypeActiviteSportiveService],
  exports: [TypeActiviteSportiveService],
})
export class TypeActiviteSportiveModule {}

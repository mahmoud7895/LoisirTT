import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivedSportActivityType } from './archived-sport-activity-type.entity';
import { ArchivedSportActivityTypesService } from './archived-sport-activity-types.service';
import { ArchivedSportActivityTypesController } from './archived-sport-activity-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArchivedSportActivityType])],
  controllers: [ArchivedSportActivityTypesController],
  providers: [ArchivedSportActivityTypesService],
  exports: [ArchivedSportActivityTypesService],
})
export class ArchivedSportActivityTypesModule {}

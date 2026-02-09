import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivedClubType } from './archived-club-type.entity';
import { ArchivedClubTypesService } from './archived-club-types.service';
import { ArchivedClubTypesController } from './archived-club-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArchivedClubType])],
  controllers: [ArchivedClubTypesController],
  providers: [ArchivedClubTypesService],
  exports: [ArchivedClubTypesService], // Exportation du service
})
export class ArchivedClubTypesModule {}

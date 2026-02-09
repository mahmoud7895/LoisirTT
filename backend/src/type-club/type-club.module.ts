import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeClub } from './type-club.entity';
import { TypeClubService } from './type-club.service';
import { Club } from '../clubs/clubs.entity';
import { TypeClubController } from './type-club.controller';
import { ArchivedClubTypesModule } from '../archived-club-types/archived-club-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeClub, Club]),
    ArchivedClubTypesModule, // Importation du module des types archivés
  ],
  controllers: [TypeClubController],
  providers: [TypeClubService],
  exports: [TypeClubService],
})
export class TypeClubModule {}

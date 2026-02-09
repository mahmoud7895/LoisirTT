import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { Club } from './clubs.entity';
import { TypeClubModule } from '../type-club/type-club.module';
import { ArchivedClubType } from '../archived-club-types/archived-club-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Club, ArchivedClubType]), // Ajoutez ArchivedClubType ici
    TypeClubModule,
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}

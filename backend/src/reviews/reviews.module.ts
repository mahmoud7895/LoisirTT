import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './review.entity';
import { Evenement } from '../evenements/evenement.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Evenement, User]),
    JwtModule.register({
      secret: 'ma_clé_secrète_sécurisée_1234567890', // Synchroniser avec auth.module.ts et inscription.module.ts
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}

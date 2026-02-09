import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitesSportivesModule } from './activites-sportives/activites-sportives.module';
import { ClubsModule } from './clubs/clubs.module';
import { EvenementsModule } from './evenements/evenements.module';
import { MailerModule } from './mailer/mailer.module';
import { InscriptionModule } from './evenement-inscriptions/inscription.module';
import { TypeClubModule } from './type-club/type-club.module';
import { TypeActiviteSportiveModule } from './type-activite-sportive/type-activite-sportive.module';
import { ArchivedClubTypesModule } from './archived-club-types/archived-club-types.module';
import { ArchivedSportActivityTypesModule } from './archived-sport-activity-types/archived-sport-activity-types.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { ReviewsModule } from './reviews/reviews.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entités
import { User } from './users/entities/user.entity';
import { ActivitesSportives } from './activites-sportives/activites-sportives.entity';
import { Club } from './clubs/clubs.entity';
import { Evenement } from './evenements/evenement.entity';
import { Inscription } from './evenement-inscriptions/inscription.entity';
import { TypeClub } from './type-club/type-club.entity';
import { TypeActiviteSportive } from './type-activite-sportive/type-activite-sportive.entity';
import { ArchivedClubType } from './archived-club-types/archived-club-type.entity';
import { ArchivedSportActivityType } from './archived-sport-activity-types/archived-sport-activity-type.entity';
import { Review } from './reviews/review.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'my_app_tt'),
        entities: [
          User,
          ActivitesSportives,
          Club,
          Evenement,
          Inscription,
          TypeClub,
          TypeActiviteSportive,
          ArchivedClubType,
          ArchivedSportActivityType,
          Review,
        ],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'fallback_secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
          issuer: configService.get<string>('JWT_ISSUER', 'my-app-tt'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60000),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ArchivedClubTypesModule,
    ArchivedSportActivityTypesModule,
    TypeClubModule,
    TypeActiviteSportiveModule,
    UsersModule,
    AuthModule,
    ActivitesSportivesModule,
    ClubsModule,
    EvenementsModule,
    MailerModule,
    InscriptionModule,
    DashboardModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

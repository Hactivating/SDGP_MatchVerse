import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { VenuesModule } from './venues/venues.module';
import { AuthModule } from './auth/auth.module';
import { CourtsModule } from './courts/courts.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

import { MatchModule } from './match/match.module';
import { S3Module } from './s3/s3.module';
import { RankingModule } from './ranking/ranking.module';
import { MatchResultModule } from './match-result/match-result.module';
import { AchivementsModule } from './achivements/achivements.module';
import { AchievementsController } from './achievements/achievements.controller';
import { AchievementsModule } from './achievements/achievements.module';


@Module({
  imports: [PrismaModule, VenuesModule, AuthModule, CourtsModule, BookingsModule, UsersModule, MatchModule,S3Module,LeaderboardModule,MatchResultModule,RankingModule, AchivementsModule, AchievementsModule],
  controllers: [AppController, AchievementsController],
  providers: [AppService],
})
export class AppModule { }

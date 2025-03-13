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


@Module({
  imports: [PrismaModule, VenuesModule, AuthModule, CourtsModule, BookingsModule, UsersModule, MatchModule,S3Module,LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

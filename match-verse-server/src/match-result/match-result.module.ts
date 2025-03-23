import { Module } from '@nestjs/common';
import { MatchResultService } from './match-result.service';
import { MatchResultController } from './match-result.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchService } from 'src/match/match.service';
import { RankingService } from 'src/ranking/ranking.service';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  controllers: [MatchResultController],
  providers: [MatchResultService, PrismaService, MatchService, RankingService, AchievementsService],
  exports: [MatchResultService],
  imports: [AchievementsModule]
})
export class MatchResultModule { }

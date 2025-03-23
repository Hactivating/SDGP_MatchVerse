import { Module } from '@nestjs/common';
import { MatchResultService } from './match-result.service';
import { MatchResultController } from './match-result.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchService } from 'src/match/match.service';
import { RankingService } from 'src/ranking/ranking.service';

@Module({
  controllers: [MatchResultController],
  providers: [MatchResultService, PrismaService, MatchService, RankingService],
  exports: [MatchResultService]
})
export class MatchResultModule { }

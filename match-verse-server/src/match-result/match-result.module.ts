import { Module } from '@nestjs/common';
import { MatchResultService } from './match-result.service';
import { MatchResultController } from './match-result.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchService } from 'src/match/match.service';

@Module({
  controllers: [MatchResultController],
  providers: [MatchResultService, PrismaService, MatchService],
  exports: [MatchResultService]
})
export class MatchResultModule {}

import { Module } from '@nestjs/common';
import { MatchResultController } from './match-result.controller';
import { MatchResultService } from './match-result.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchModule } from 'src/match/match.module';
import { MatchService } from 'src/match/match.service';

@Module({
    imports:[MatchModule],
    controllers:[MatchResultController],
    providers:[MatchResultService,PrismaService,MatchService],
})
export class MatchResultModule {}

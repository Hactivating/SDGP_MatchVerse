import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';

@Injectable()
export class MatchResultService {
  constructor(
    private prisma: PrismaService,
    private rankingService: RankingService
  ) {}

  async submitMatchWinners(matchId: number, winner1Id: number, winner2Id: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    });

    if (!matchRequest) {
      throw new NotFoundException('Match not found!');
    }

    const allPlayers = [matchRequest.createdById, matchRequest.partnerId];

    const winners = [winner1Id, winner2Id];
    const losers = allPlayers.filter((player) => !winners.includes(player));

    if (losers.length !== 2) {
      throw new BadRequestException('There should be exactly two losers.');
    }

    await this.prisma.matchResult.create({
      data: {
        matchId: matchId,
        winner1Id: winners[0],
        winner2Id: winners[1],
        loser1Id: losers[0],
        loser2Id: losers[1],
        confirmed: true,
      },
    });

    await this.rankingService.updateUserRanking(winners[0], true);
    await this.rankingService.updateUserRanking(winners[1], true);
    await this.rankingService.updateUserRanking(losers[0], false);
    await this.rankingService.updateUserRanking(losers[1], false);

    return `Winners: ${winner1Id}, ${winner2Id}. Losers: ${losers[0]}, ${losers[1]}. Rankings updated!`;
  }
}
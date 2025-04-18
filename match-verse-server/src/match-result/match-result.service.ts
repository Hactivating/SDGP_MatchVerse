import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AchievementsService } from 'src/achievements/achievements.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';

@Injectable()
export class MatchResultService {
  constructor(
    private prisma: PrismaService,
    private rankingService: RankingService,
    private achievementService: AchievementsService
  ) { }

  async submitMatchWinners(matchId: number, winner1Id: number, winner2Id: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    });

    if (!matchRequest) throw new NotFoundException('Match not found');



    const createdById = matchRequest.createdById;
    const partnerId = matchRequest.partnerId;

    if (createdById === null || partnerId === null) {
      throw new BadRequestException('Match players are incomplete!');
    }

    const allPlayers = [createdById, partnerId];
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

    await this.rankingService.updateUserRanking(winners[0], winners[1], losers[0], losers[1]);

    for (const winner of winners) {
      await this.achievementService.updateUserAchievements(winner, true);

    }

    for (const loser of losers) {
      await this.achievementService.updateUserAchievements(loser, false);
    }

    return `Winners: ${winner1Id}, ${winner2Id}. Losers: ${losers[0]}, ${losers[1]}. Rankings updated!`;
  }
}
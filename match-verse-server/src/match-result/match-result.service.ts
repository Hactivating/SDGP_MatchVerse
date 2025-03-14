import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MatchResultService {
  constructor(private prisma: PrismaService) {}

  async submitMatchWinners(matchId: number, winner1Id: number, winner2Id: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    });

    if (!matchRequest) {
      throw new NotFoundException('Match not found!');
    }

    const allPlayers = [matchRequest.createdById, matchRequest.partnerId];

    if (!allPlayers.includes(winner1Id) || !allPlayers.includes(winner2Id)) {
      throw new BadRequestException('Winners must be part of the matched players.');
    }

    if (winner1Id === winner2Id) {
      throw new BadRequestException('Winners must be two distinct players.');
    }

    const losers = allPlayers.filter(player => player !== winner1Id && player !== winner2Id);

    if (losers.length !== 2) {
      throw new BadRequestException('There should be exactly two losers.');
    }

    await this.prisma.matchResult.create({
      data: {
        matchId,
        winner1Id,
        winner2Id,
        loser1Id: losers[0],
        loser2Id: losers[1],
        confirmed: true,
      },
    });

    return {
      message: 'Match result saved successfully!',
      winners: [winner1Id, winner2Id],
      losers: [losers[0], losers[1]],
    };
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchService } from 'src/match/match.service';

@Injectable()
export class MatchResultService {
  constructor(private prisma: PrismaService, private matchService: MatchService) {}

  async submitMatchWinners(matchId: number, winner1Id: number, winner2Id: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    });

    if (!matchRequest) {
      throw new NotFoundException('Match not found!');
    }

    const players = [
      matchRequest.createdById,
      matchRequest.partnerId,
    ];

    const winners = [winner1Id, winner2Id];
    const allPlayers = [
      matchRequest.createdById,
      matchRequest.partnerId,
    ];

    if (!winners.every((winner) => allPlayers.includes(winner))) {
      throw new BadRequestException('Winners must be part of the matched players.');
    }

    if (winners[0] === winners[1]) {
      throw new BadRequestException('Winners must be distinct.');
    }

    const losers = allPlayers.filter((player) => !winners.includes(player));

    if (losers.length !== 2) {
      throw new BadRequestException('There should be exactly two losers.');
    }

    const matchResult = await this.prisma.matchResult.create({
      data: {
        matchId: matchId,
        winner1Id: winners[0],
        winner2Id: winners[1],
        loser1Id: losers[0],
        loser2Id: losers[1],
        confirmed: false,
      },
    });

    return `Winners: ${winner1Id}, ${winner2Id}. Losers: ${losers[0]}, ${losers[1]}. Match result saved successfully!`;
  }
}
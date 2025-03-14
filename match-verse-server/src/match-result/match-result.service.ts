import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchService } from 'src/match/match.service';

@Injectable()
export class MatchResultService {
    constructor(private prisma: PrismaService, private matchService: MatchService) {}

    async submitMatchWinners(matchId: number, voterId: number, winner1Id: number, winner2Id: number) {
        const matchRequests = await this.matchService.getMatchedUsers(matchId);

        if (!matchRequests || matchRequests.length !== 2) {
            throw new NotFoundException('Match not found or invalid match setup');
        }

        const players = [
            matchRequests[0].createdById,
            matchRequests[0].partnerId,
            matchRequests[1].createdById,
            matchRequests[1].partnerId,
        ].filter(id => id !== null);

        if (!players.includes(voterId)) {
            throw new BadRequestException('Only players from this match can vote');
        }

        if (!players.includes(winner1Id) || !players.includes(winner2Id)) {
            throw new BadRequestException('Winners must be from the matched players');
        }

        if (winner1Id === winner2Id) {
            throw new BadRequestException('Winner IDs must be different');
        }

        let matchResult = await this.prisma.matchResult.findUnique({
            where: { matchId },
        });

        if (!matchResult) {
            matchResult = await this.prisma.matchResult.create({
                data: {
                    matchId,
                    winner1Id,
                    winner2Id,
                    votes: JSON.stringify([voterId]),
                },
            });
        } else {
            const votes = JSON.parse(matchResult.votes);
            if (votes.includes(voterId)) {
                throw new BadRequestException('User has already voted for this match');
            }

            votes.push(voterId);

            if (votes.length >= 3) {
                await this.prisma.matchResult.update({
                    where: { matchId },
                    data: { confirmed: true, votes: JSON.stringify(votes) },
                });

                return { message: 'Winners confirmed!', winner1Id, winner2Id };
            }

            await this.prisma.matchResult.update({
                where: { matchId },
                data: { votes: JSON.stringify(votes) },
            });
        }

        return { message: 'Vote submitted, waiting for majority confirmation' };
    }
}
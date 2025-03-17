import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';

@Injectable()
export class MatchService {
    constructor(private prisma: PrismaService) { }

    async createMatchRequest(data: CreateMatchRequestDto) {
        const booking = await this.prisma.booking.findUnique({
            where: { bookingId: data.bookingId },
        });

        if (!booking) {
            throw new BadRequestException('booking not found')
        }

        if (data.matchType === 'double' && !data.partnerId) {
            throw new BadRequestException('doubles match, requires only 1 player')
        }

        if (data.matchType === 'double' && data.createdById === data.partnerId) {
            throw new BadRequestException('you cannot add yourself as a partner')
        }

        const matchRequest = await this.prisma.matchRequest.create({
            data: {
                bookingId: data.bookingId,
                matchType: data.matchType,
                createdById: data.createdById,
                partnerId: data.partnerId,
                status: 'pending'
            },

        });

        await this.tryMatchRequest(matchRequest);

        return matchRequest;
    }

    async tryMatchRequest(newRequest) {
        const matchingRequest = await this.prisma.matchRequest.findFirst({
            where: {
                matchType: newRequest.matchType,
                status: 'pending',
                requestId: {
                    not: newRequest.requestId
                },
            },
        });

        if (matchingRequest) {
            await this.prisma.matchRequest.updateMany({
                where: { requestId: { in: [newRequest.requestId, matchingRequest.requestId] } },
                data: { status: 'matched' },
            });

            console.log('Match confirmed')
        }
    }

    async getMatchedUsers(matchId: number) {
        const matchRequest = await this.prisma.matchRequest.findUnique({
            where: { requestedId: matchId},
            include: { createdBy: true, partner: true},
        })

        if (!matchRequest) throw new NotFoundException("Match not found!");

        const opponentMatch = await this.prisma.matchRequest.findFirst({
            where: { bookingId: matchRequest.bookingId, requetedId: {not: matchId},},
            include: { createdBy: true, partner: true},
        })

        if (!opponentMatch) throw new NotFoundException("Opponents not found!");

        return [matchRequest, opponentMatch];
    }


    async getPendingRequests() {
        return this.prisma.matchRequest.findMany({
            where: { status: 'pending' },
        });
    }

    async getMatchedRequest() {
        return this.prisma.matchRequest.findMany({
            where: { status: 'matched' },
        });
    }
}
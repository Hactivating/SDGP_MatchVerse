import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createMatchDto } from './DTO/create-match.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';


@Injectable()
export class MatchService {
    constructor(private prisma: PrismaService) { }

    async createMatchRequest(data: createMatchDto) {
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








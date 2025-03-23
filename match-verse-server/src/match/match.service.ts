import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';
import { AcceptMatchDto } from './DTO/accept-match.dto';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) { }

  async createMatchRequest(data: CreateMatchRequestDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (!data.bookingId) {
      throw new BadRequestException('bookingId is required');
    }

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
        bookingId: data.bookingId ?? null,
        matchType: data.matchType,
        createdById: data.createdById,
        partnerId: data.partnerId,
        // status: 'pending'
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
        data: { status: 'pending_confirmation' },
      });

      console.log('Match found, waiting for confirmation.')
    }
  }

  async accceptMatch(data: AcceptMatchDto) {
    const MatchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: data.requestId },
    });

    if (!MatchRequest) {
      throw new BadRequestException('Match request not found!');
    }

    if (MatchRequest.status !== 'pending_confirmation') {
      throw new BadRequestException('Match request is not pending confirmation!');
    }

    if (MatchRequest.createdById !== data.userId && MatchRequest.partnerId !== data.userId) {
      throw new BadRequestException('You are not part of this match request!');
    }

    const pairedRequest = await this.prisma.matchRequest.findFirst({

      where: {
        status: 'pending_confirmation',
        requestId: { not: data.requestId },
        bookingId: MatchRequest.bookingId,
      }
    });

    if (!pairedRequest) {
      throw new BadRequestException('Paired match request not found!');
    }

    if (data.accepted) {
      await this.prisma.matchRequest.updateMany({
        where: { requestId: { in: [data.requestId, pairedRequest.requestId] } },
        data: { status: 'scheduled' },
      });

      return { message: 'Match accepted and scheduled successfully!' };
    } else {
      await this.prisma.matchRequest.update({
        where: { requestId: data.requestId },
        data: {
          status: 'cancelled'
        },
      })

      await this.tryMatchRequest(pairedRequest);

      return { message: 'Match declined, finding new opponents' };
    }

  }

  async getMatchedUsers(matchId: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    })

    if (!matchRequest) throw new NotFoundException("Match not found!");

    const opponentMatch = await this.prisma.matchRequest.findFirst({
      where: {
        bookingId: matchRequest.bookingId,
        requestId: { not: matchId },
        status: { in: ['pending_confirmation', 'scheduled'] }
      },
      include: { createdBy: true, partner: true },
    })


    if (!opponentMatch) throw new NotFoundException("Opponents not found!");

    return [matchRequest, opponentMatch];
  }


  async getPendingRequests() {
    return this.prisma.matchRequest.findMany({
      where: { status: 'pending' },
    });
  }

  async getPendingConfirmations(userId: number) {
    return this.prisma.matchRequest.findMany({
      where: {
        status: 'pending_confirmation',
        OR: [
          { createdById: userId },
          { partnerId: userId }
        ]
      },
      include: {
        booking: true
      }
    });

  }

  async getScheduledMatches(userId: number) {
    return this.prisma.matchRequest.findMany({
      where: {
        status: 'scheduled',
        OR: [
          { createdById: userId },
          { partnerId: userId }
        ]
      },
      include: {
        booking: true
      }
    });
  }

  async getMatchedRequest() {
    return this.prisma.matchRequest.findMany({
      where: { status: { in: ['pending_confirmation', 'scheduled'] } },
    });
  }
}







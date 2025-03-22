import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';
import { throws } from 'assert';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) { }

  async createMatchRequest(data: CreateMatchRequestDto) {
    //fetch user details

    if (data.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingId: data.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: data.createdById },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const matchRequest = await this.prisma.matchRequest.create({
      data: {
        bookingId: data.bookingId,
        matchType: data.matchType,
        createdById: data.createdById,
        partnerId: data.partnerId,
        status: 'pending',
      },

    });


    await this.tryMatchRequest(matchRequest, user.rankPoints);


    return matchRequest;
  }

  async tryMatchRequest(newRequest, userRankPoints) {
    const matchingRequest = await this.prisma.matchRequest.findFirst({
      where: {
        matchType: newRequest.matchType,
        status: 'pending',
        requestId: { not: newRequest.requestId },
        bookingId: { not: null },
      },
      include: {
        createdBy: true,
      },

    });


    if (!matchingRequest) {
      console.log('No suitable match found');
      return;
    }

    const opponent = await this.prisma.user.findUnique({
      where: {
        userId: matchingRequest.createdById
      }
    });

    if (!opponent) {
      console.log('Opponent user not found')
      return;
    }

    if (Math.abs(userRankPoints - opponent.rankPoints) > 200) {
      console.log('Match found, but rank not within range');
      return;
    }

    await this.prisma.matchRequest.updateMany({
      where: {
        requestId: { in: [newRequest.requestId, matchingRequest.requestId] },

      },
      data: { status: 'matched' },

    });

    console.log('match confirmed')

  }

  async getMatchedUsers(matchId: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    });

    if (!matchRequest) throw new NotFoundException('Match not found!');

    const opponentMatch = await this.prisma.matchRequest.findFirst({
      where: {
        bookingId: matchRequest.bookingId,
        requestId: { not: matchId },
      },
      include: { createdBy: true, partner: true },
    });

    if (!opponentMatch) throw new NotFoundException('Opponents not found!');

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

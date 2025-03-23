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

  async createMatchRequest(requestDto: CreateMatchRequestDto) {
    //fetch user details

    if (requestDto.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingId: requestDto.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: requestDto.createdById },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let bookingId: number | null = null;
    if (requestDto.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingId: requestDto.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      bookingId = requestDto.bookingId;
    }


    const matchRequest = await this.prisma.matchRequest.create({
      data: {
        bookingId,
        matchType: requestDto.matchType,
        createdById: requestDto.createdById,
        partnerId: requestDto.partnerId,
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
        // bookingId: { not: null },
      },
      include: {
        createdBy: true,
      },

    });


    if (!matchingRequest) {
      console.log('No suitable match found');
      return;
    }

    const newRequestHasBooking = newRequest.bookingId !== null;
    const matchingRequestHasBooking = matchingRequest.bookingId !== null;

    if ((newRequestHasBooking && matchingRequestHasBooking) ||
      (!newRequestHasBooking && !matchingRequestHasBooking)) {
      console.log('Match valdation failed, exactly one party must have booking')
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


    const bookingId = newRequest.bookingId || matchingRequest.bookingId;

    const requestWithBooking = newRequest.bookingId ? newRequest : matchingRequest;
    const requestWithoutBooking = matchingRequest.bookingId ? matchingRequest : newRequest;

    await this.prisma.matchRequest.update({
      where: { requestId: requestWithBooking.requestId },

      data: {
        status: 'matched'
      }
    });

    await this.prisma.matchRequest.update({
      where: { requestId: requestWithoutBooking.requestId },

      data: {
        status: 'pending_approval',
        bookingId: bookingId,
        proposedMatchId: requestWithBooking.requestId
      }

    });

    console.log('Matched proposed with boooking ID: ', bookingId);

    async respondToMatchProposal(requestId : number, accept: boolean) {
      const matchRequest = await this.prisma.matchRequest.findUnique({
        where: { requestId },
        include: {
          booking: true
        }
      });

      if (!matchRequest) throw new NotFoundException('Match request not found!');

      if (matchRequest.status !== 'pending_approval') throw new BadRequestException('Match request is not pending approval');

      if (!matchRequest.proposedMatchId) throw new BadRequestException('Match request has no proposed match');

      const proposedMatch = await this.prisma.matchRequest.findUnique({
        where: { requestId: matchRequest.proposedMatchId }
      });

      if (!proposedMatch) throw new NotFoundException('Proposed match not found!');



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

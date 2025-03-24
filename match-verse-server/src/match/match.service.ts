import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';


@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) { }

  async createMatchRequest(data: CreateMatchRequestDto) {
    if (data.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingId: data.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('booking not found');
      }
    }

    if (data.matchType === 'double') {
      // Check if this booking already has pending doubles matches
      const existingMatches = await this.prisma.matchRequest.findMany({
        where: {
          bookingId: data.bookingId,
          matchType: 'double',
          status: 'pending'
        },
        include: {
          createdBy: true,
          partner: true
        }
      });

      if (existingMatches.length > 0) {
        const playerIds = new Set();

        existingMatches.forEach(match => {
          if (match.createdById) playerIds.add(match.createdById);
          if (match.partnerId) playerIds.add(match.partnerId);
        });

        console.log(`Found ${playerIds.size} existing players for this booking`);

        if (playerIds.size >= 1 && !playerIds.has(data.createdById)) {
          console.log(`Allowing player ${data.createdById} to join without a partner as the ${playerIds.size + 1} player`);
        } else if (!data.partnerId) {
          throw new BadRequestException('doubles matches require a partner for the first team');
        }
      } else if (!data.partnerId) {
        throw new BadRequestException('doubles matches require a partner for the first team');
      }
    }

    const createData: any = {
      matchType: data.matchType,
      createdById: data.createdById,
      status: 'pending',
    };

    if (data.bookingId !== undefined) {
      createData.bookingId = data.bookingId;
    }

    if (data.partnerId !== undefined) {
      createData.partnerId = data.partnerId;
    }

    const matchRequest = await this.prisma.matchRequest.create({
      data: createData,
      include: {
        createdBy: true,
        partner: true,
        booking: {
          include: {
            court: true
          }
        }
      }
    });

    await this.tryMatchRequest(matchRequest);
    return matchRequest;
  }

  async tryMatchRequest(newRequest) {
    console.log('Trying to match request:', newRequest.requestId);

    if (newRequest.matchType === 'double' && newRequest.bookingId) {
      const allRequests = await this.prisma.matchRequest.findMany({
        where: {
          bookingId: newRequest.bookingId,
          matchType: 'double',
          status: 'pending'
        },
        include: {
          createdBy: true,
          partner: true
        }
      });

      console.log(`Found ${allRequests.length} requests for booking ${newRequest.bookingId}`);

      const playerIds = new Set();
      allRequests.forEach(req => {
        playerIds.add(req.createdById);
        if (req.partnerId) playerIds.add(req.partnerId);
      });

      const playerCount = playerIds.size;
      console.log(`Total unique players: ${playerCount}`);

      if (playerCount >= 4) {
        console.log('Found 4+ players for doubles match, updating status to matched');

        const requestIds = allRequests.map(req => req.requestId);
        await this.prisma.matchRequest.updateMany({
          where: {
            requestId: { in: requestIds }
          },
          data: { status: 'matched' }
        });

        console.log(`Updated ${requestIds.length} requests to 'matched' status`);
      }
    } else if (newRequest.matchType === 'single') {
      const matchingRequest = await this.prisma.matchRequest.findFirst({
        where: {
          matchType: 'single',
          status: 'pending',
          requestId: { not: newRequest.requestId },
          bookingId: newRequest.bookingId
        }
      });

      if (matchingRequest) {
        await this.prisma.matchRequest.updateMany({
          where: {
            requestId: { in: [newRequest.requestId, matchingRequest.requestId] }
          },
          data: { status: 'matched' }
        });

        console.log(`Matched single requests: ${newRequest.requestId} and ${matchingRequest.requestId}`);
      }
    }
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
      include: {
        createdBy: true,
        partner: true,
        booking: {
          include: {
            court: true
          }
        }
      }
    });
  }

  async getMatchedRequest() {
    return this.prisma.matchRequest.findMany({
      where: { status: 'matched' },
      include: {
        createdBy: true,
        partner: true,
        booking: {
          include: {
            court: true
          }
        }
      }
    });
  }
}
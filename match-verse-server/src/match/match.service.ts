import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(private prisma: PrismaService) {}

  async createMatchRequest(data: CreateMatchRequestDto) {
    this.logger.log(`Creating match request: ${JSON.stringify(data)}`);

    // Validate booking if provided
    if (data.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingId: data.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
    }

    // Handle doubles match specific logic
    if (data.matchType === 'double') {
      // Validate doubles match requirements
      if (!data.partnerId) {
        throw new BadRequestException('Doubles matches require a partner');
      }

      // Check if booking is provided
      if (!data.bookingId) {
        throw new BadRequestException('Doubles matches require a booking');
      }

      // Check existing matches for this booking
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

      // Track existing players
      const playerIds = new Set();
      existingMatches.forEach(match => {
        if (match.createdById) playerIds.add(match.createdById);
        if (match.partnerId) playerIds.add(match.partnerId);
      });

      // Prevent duplicate player entry
      if (playerIds.has(data.createdById) || playerIds.has(data.partnerId)) {
        throw new BadRequestException('One of the players is already in this match');
      }

      // Limit to 2 teams (4 players max)
      if (playerIds.size >= 4) {
        throw new BadRequestException('This booking already has a full match');
      }
    }

    // Prepare match request data
    const createData: any = {
      matchType: data.matchType,
      createdById: data.createdById,
      status: 'pending',
      bookingId: data.bookingId,
      partnerId: data.partnerId
    };

    // Create match request
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

    // Try to match this request
    await this.tryMatchRequest(matchRequest);

    this.logger.log(`Match request created successfully: ${matchRequest.requestId}`);
    return matchRequest;
  }

  async tryMatchRequest(newRequest) {
    this.logger.log(`Attempting to match request: ${newRequest.requestId}`);

    // Doubles match matching logic
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

      const playerIds = new Set();
      allRequests.forEach(req => {
        playerIds.add(req.createdById);
        if (req.partnerId) playerIds.add(req.partnerId);
      });

      // Match if 4 players found
      if (playerIds.size >= 4) {
        this.logger.log('Found 4 players for doubles match, updating status');

        const requestIds = allRequests.map(req => req.requestId);
        await this.prisma.matchRequest.updateMany({
          where: { requestId: { in: requestIds } },
          data: { status: 'matched' }
        });
      }
    }
    // Singles match matching logic
    else if (newRequest.matchType === 'single') {
      // More flexible matching strategy
      const matchingRequest = await this.prisma.matchRequest.findFirst({
        where: {
          matchType: 'single',
          status: 'pending',
          requestId: { not: newRequest.requestId },
          // Matching logic
          ...(newRequest.bookingId
              ? {
                // Prefer matching on the same booking
                OR: [
                  { bookingId: newRequest.bookingId },
                  { bookingId: null }
                ]
              }
              : {})
        }
      });

      if (matchingRequest) {
        // Match these two requests
        await this.prisma.matchRequest.updateMany({
          where: {
            requestId: { in: [newRequest.requestId, matchingRequest.requestId] }
          },
          data: {
            status: 'matched',
            // Assign the booking if one exists
            bookingId: newRequest.bookingId || matchingRequest.bookingId
          }
        });

        this.logger.log(`Matched single requests: ${newRequest.requestId} and ${matchingRequest.requestId}`);
      }
    }
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
      },
      orderBy: {
        requestId: 'desc'
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
      },
      orderBy: {
        requestId: 'desc'
      }
    });
  }

  async getMatchedUsers(matchId: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: {
        createdBy: true,
        partner: true,
        booking: true
      },
    });

    if (!matchRequest) {
      throw new NotFoundException('Match not found');
    }

    // Find opponent match for the same booking
    const opponentMatch = await this.prisma.matchRequest.findFirst({
      where: {
        bookingId: matchRequest.bookingId,
        requestId: { not: matchId },
        status: 'matched'
      },
      include: {
        createdBy: true,
        partner: true
      },
    });

    if (!opponentMatch) {
      throw new NotFoundException('Opponents not found');
    }

    return [matchRequest, opponentMatch];
  }
}
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';
import { JoinMatchDto } from './DTO/join-match.dto';
import { JoinSinglesDto } from './DTO/join-singles.dto';

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

    // Try to match this request (for doubles only, singles are manually matched)
    await this.tryMatchRequest(matchRequest);

    this.logger.log(`Match request created successfully: ${matchRequest.requestId}`);
    return matchRequest;
  }

  async joinMatch(data: JoinMatchDto) {
    this.logger.log(`Joining match request: ${JSON.stringify(data)}`);

    // Find the match to join
    const matchToJoin = await this.prisma.matchRequest.findUnique({
      where: { requestId: data.matchId },
      include: {
        createdBy: true,
        partner: true,
        booking: true
      }
    });

    if (!matchToJoin) {
      throw new NotFoundException('Match request not found');
    }

    if (matchToJoin.status !== 'pending') {
      throw new BadRequestException('Cannot join a match that is already matched');
    }

    if (matchToJoin.matchType !== 'double') {
      throw new BadRequestException('Can only join doubles matches');
    }

    // Find all existing match requests for this booking
    const existingRequests = await this.prisma.matchRequest.findMany({
      where: {
        bookingId: matchToJoin.bookingId,
        matchType: 'double',
        status: 'pending'
      },
      include: {
        createdBy: true,
        partner: true
      }
    });

    // Count existing players
    const existingPlayerIds = new Set();
    existingRequests.forEach(req => {
      if (req.createdById) existingPlayerIds.add(req.createdById);
      if (req.partnerId) existingPlayerIds.add(req.partnerId);
    });

    // Check if user is already in this match
    if (existingPlayerIds.has(data.userId)) {
      throw new BadRequestException('You are already in this match');
    }

    // Check if partner (if provided) is already in this match
    if (data.partnerId && existingPlayerIds.has(data.partnerId)) {
      throw new BadRequestException('Your partner is already in this match');
    }

    // Check if the match is already full
    if (existingPlayerIds.size >= 4) {
      throw new BadRequestException('This match is already full');
    }

    // Create a new match request for the joining player(s)
    const joinData: any = {
      matchType: 'double',
      createdById: data.userId,
      status: 'pending',
      bookingId: matchToJoin.bookingId,
      partnerId: data.partnerId || null
    };

    // Create the join request
    const joinRequest = await this.prisma.matchRequest.create({
      data: joinData,
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

    // Try to match after joining
    await this.tryMatchRequest(joinRequest);

    this.logger.log(`Successfully joined match: ${data.matchId}`);
    return joinRequest;
  }

  // New method for joining singles matches
  async joinSinglesMatch(data: JoinSinglesDto) {
    this.logger.log(`Joining singles match: ${JSON.stringify(data)}`);

    // Find the match to join
    const matchToJoin = await this.prisma.matchRequest.findUnique({
      where: { requestId: data.matchId },
      include: {
        createdBy: true,
        booking: true
      }
    });

    if (!matchToJoin) {
      throw new NotFoundException('Match request not found');
    }

    if (matchToJoin.status !== 'pending') {
      throw new BadRequestException('Cannot join a match that is already matched');
    }

    if (matchToJoin.matchType !== 'single') {
      throw new BadRequestException('This endpoint is for singles matches only');
    }

    // Make sure user isn't joining their own match
    if (matchToJoin.createdById === data.userId) {
      throw new BadRequestException('You cannot join your own match request');
    }

    // Create a joining request and immediately match it
    const joiningRequest = await this.prisma.matchRequest.create({
      data: {
        matchType: 'single',
        createdById: data.userId,
        bookingId: matchToJoin.bookingId,
        status: 'matched' // Start as matched
      },
      include: {
        createdBy: true,
        booking: {
          include: {
            court: true
          }
        }
      }
    });

    // Update original request to matched status
    await this.prisma.matchRequest.update({
      where: { requestId: matchToJoin.requestId },
      data: { status: 'matched' }
    });

    this.logger.log(`Successfully joined singles match: ${data.matchId}`);
    return joiningRequest;
  }

  async tryMatchRequest(newRequest) {
    this.logger.log(`Attempting to match request: ${newRequest.requestId}`);

    // Only match doubles matches automatically
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

  // New method to get available singles matches
  async getAvailableSinglesMatches() {
    this.logger.log('Fetching available singles matches');

    return this.prisma.matchRequest.findMany({
      where: {
        matchType: 'single',
        status: 'pending',
      },
      include: {
        createdBy: true,
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
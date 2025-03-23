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
    // Validate booking if a bookingId is provided
    if (data.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingId: data.bookingId },
        include: {
          matchRequest: {
            where: { status: 'matched' }
          }
        }
      });

      if (!booking) {
        throw new BadRequestException('booking not found');
      }

      if (booking.matchRequest.length > 0) {
        throw new BadRequestException('this booking is already matched with another player');
      }
    }

    if (data.matchType === 'double' && !data.partnerId) {
      throw new BadRequestException('doubles match requires a partner');
    }

    if (data.matchType === 'double' && data.createdById === data.partnerId) {
      throw new BadRequestException('you cannot add yourself as a partner');
    }

    // Create the match request with proper relations
    const createData: any = {
      matchType: data.matchType,
      status: 'pending',
      createdBy: {
        connect: { userId: data.createdById }
      }
    };

    // Conditionally add booking relation if bookingId is provided
    if (data.bookingId) {
      createData.booking = {
        connect: { bookingId: data.bookingId }
      };
    }

    // Conditionally add partner relation if partnerId is provided
    if (data.partnerId) {
      createData.partner = {
        connect: { userId: data.partnerId }
      };
    }

    // Create the match request
    const matchRequest = await this.prisma.matchRequest.create({
      data: createData,
      include: {
        booking: true,
        createdBy: true,
        partner: true
      }
    });

    // Try to match with an existing request
    const matchResult = await this.tryMatchRequest(matchRequest);

    // Return the updated match request (which may now be matched)
    if (matchResult) {
      // If we found a match, return the updated request with matched status
      return await this.prisma.matchRequest.findUnique({
        where: { requestId: matchRequest.requestId },
        include: {
          booking: true,
          createdBy: true,
          partner: true
        }
      });
    }

    return matchRequest;
  }

  async tryMatchRequest(newRequest) {
    console.log(`Attempting to match request #${newRequest.requestId}`);
    console.log(`Request has bookingId: ${newRequest.bookingId ? 'Yes' : 'No'}`);

    // Find a matching request
    const matchingRequest = await this.prisma.matchRequest.findFirst({
      where: {
        // Basic conditions for any match
        matchType: newRequest.matchType,
        status: 'pending',
        requestId: { not: newRequest.requestId },
        createdById: { not: newRequest.createdById }, // Prevent self-matching

        // Booking logic - this is the critical part
        ...(newRequest.bookingId
                ? {
                  // If this request has a booking, find one WITHOUT a booking
                  bookingId: null,
                }
                : {
                  // If this request has NO booking, find one WITH a booking
                  bookingId: {
                    not: null,
                  },
                  // Make sure the booking hasn't already been matched
                  booking: {
                    matchRequest: {
                      none: {
                        status: 'matched',
                        requestId: { not: newRequest.requestId }
                      }
                    }
                  }
                }
        )
      },
      include: {
        booking: true,
        createdBy: true,
        partner: true
      }
    });

    if (matchingRequest) {
      console.log(`Found matching request #${matchingRequest.requestId}`);

      // If the new request doesn't have a booking but the matching one does,
      // update the new request to use that booking
      if (!newRequest.bookingId && matchingRequest.bookingId) {
        await this.prisma.matchRequest.update({
          where: { requestId: newRequest.requestId },
          data: {
            bookingId: matchingRequest.bookingId,
            status: 'matched'
          }
        });
      }

      // Update the matching request to 'matched' status
      await this.prisma.matchRequest.update({
        where: { requestId: matchingRequest.requestId },
        data: { status: 'matched' }
      });

      // Also update the new request if it hasn't been updated yet
      if (newRequest.bookingId) {
        await this.prisma.matchRequest.update({
          where: { requestId: newRequest.requestId },
          data: { status: 'matched' }
        });
      }

      console.log('Match confirmed between requests');
      return true;
    }

    console.log('No matching request found');
    return false;
  }

  async getMatchedUsers(matchId: number) {
    const matchRequest = await this.prisma.matchRequest.findUnique({
      where: { requestId: matchId },
      include: { createdBy: true, partner: true },
    });

    if (!matchRequest) throw new NotFoundException('Match not found!');

    const opponentMatch = await this.prisma.matchRequest.findFirst({
      where: {
        OR: [
          // If there's a booking, find match with same booking
          ...(matchRequest.bookingId ? [{
            bookingId: matchRequest.bookingId,
            requestId: { not: matchId },
          }] : []),
          // Look for matches that this one was directly matched with
          {
            status: 'matched',
            // Add more matching criteria if needed
          }
        ]
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
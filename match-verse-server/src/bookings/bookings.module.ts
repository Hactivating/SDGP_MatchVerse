import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingGateway } from './gateway/booking.gateway';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService,PrismaService,BookingGateway]
})
export class BookingsModule {}

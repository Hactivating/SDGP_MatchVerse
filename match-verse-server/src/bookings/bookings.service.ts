import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Slot } from './interface/slot';
import { UserBookingDto } from './dto/user-booking.dto';
import { VenueBookingDto } from './dto/venue-booking.dto';
import { BookingGateway } from './gateway/booking.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prismaService: PrismaService,
    private gateway: BookingGateway,
  ) {}

  async getBookings(courtId: number, date: string) {
    //get starting time of all existing bookings
    const bookings = await this.prismaService.booking.findMany({
      where: { courtId: courtId, date: date },
      select: { startingTime: true, bookingId: true, userId: true },
    });

    console.log(bookings);

    //select venue where court exists
    let operatingTime = await this.prismaService.court.findUnique({
      where: { courtId: courtId },
      include: { venue: true },
    });

    console.log(operatingTime);

    //map the booking slots to a set
    const bookingsMap = new Map(
      bookings.map((booking) => [
        booking.startingTime,
        { bookingId: booking.bookingId, userId: booking.userId },
      ]),
    );

    console.log(bookingsMap);

    if (operatingTime) {
      const { openingTime, closingTime } = operatingTime.venue;
      const slots = (closingTime - openingTime) / 100;
      const bookedSlots: Slot[] = [];
      //generate slots for the operating time

      let openingHour = Math.floor(openingTime / 100);
      let openingMinute = openingTime % 100;

      for (let i = 0; i < slots; i++) {
        let startingTime = `${String(openingHour).padStart(2, '0')}:${String(openingMinute).padStart(2, '0')}`;
        const bookingId = bookingsMap.get(startingTime);

        //push slots into the array with updated starting time and a boolean of isBooked
        const bookingData = bookingsMap.get(startingTime); // Fetch both bookingId and userId
        bookedSlots.push({
          date: date,
          starts: startingTime,
          isBooked: bookingsMap.has(startingTime),
          bookingId: bookingData ? bookingData.bookingId : null, 
          userId: bookingData ? bookingData.userId : null, 
        });

        //increase hour by 1 for every iteration
        openingHour += 1;
      }
      return bookedSlots;
    }
  }

  async getBookingsByUser(userId: number) {
    return this.prismaService.booking.findMany({
      where: { userId: userId },
    });
  }

  async createVenueBooking(payload: VenueBookingDto) {
    return this.createBooking(payload);
  }

  async createUserBooking(payload: UserBookingDto) {
    return this.createBooking(payload);
  }

  async createBooking(payload: VenueBookingDto | UserBookingDto) {
    //get seperate court id and starting time variables derived from the values in payload
    const { courtId, startingTime } = payload;

    let operatingTime = await this.prismaService.court.findUnique({
      where: { courtId: courtId },
      include: { venue: true },
    });

    if (operatingTime) {
      const { openingTime, closingTime } = operatingTime.venue;
      //remove the diving . between HH and MM
      const bookingTime = parseInt(startingTime.replace(':', ''), 10);
      //check if booking time is within operating hours
      if (closingTime < bookingTime + 100) {
        return 'invalid time exceeds closing Time';
      } else if (openingTime > bookingTime) {
        return 'invalid time ';
      }
    }

    console.log(payload);
    const booking = await this.prismaService.booking.create({
      data: payload,
    });

    this.gateway.emitEventUpdate();

    return booking;
  }

  async deleteUserBooking(bookingId) {
    return this.prismaService.booking.delete({
      where: { bookingId: bookingId },
    });
  }
}

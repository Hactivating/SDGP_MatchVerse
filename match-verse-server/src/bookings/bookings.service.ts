import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Slot } from './interface/slot';
import { UserBookingDto } from './dto/user-booking.dto';
import { VenueBookingDto } from './dto/venue-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prismaService: PrismaService) {}

  async getBookings(courtId: number, date: string) {
    //get starting time of all existing bookings
    const bookings = await this.prismaService.booking.findMany({
      where: { courtId: courtId, date: date },
      select: { startingTime: true },
    });

    //select venue where court exists
    let operatingTime = await this.prismaService.court.findUnique({
      where: { courtId: courtId },
      include: { venue: true },
    });

    //map the booking slots to a set
    const bookingsSet = new Set(
      bookings.map((bookings) => bookings.startingTime),
    );

    console.log(bookingsSet);

    if (operatingTime) {
      const { openingTime, closingTime } = operatingTime.venue;
      const slots = (closingTime - openingTime) / 100;
      const bookedSlots: Slot[] = [];
      //generate slots for the operating time

      let openingHour = Math.floor(openingTime / 100);
      let openingMinute = openingTime % 100;

      for (let i = 0; i < slots; i++) {
        let startingTime = `${openingHour}.${openingMinute}`;

        //push slots into the array with updated starting time and a boolean of isBooked
        bookedSlots.push({
          date: date,
          starts: startingTime,
          isBooked: bookingsSet.has(startingTime)
        });
        //increase hour by 1 for every iteration
        openingHour += 1;
      }
      return bookedSlots;
    }
  }

  async getBookingsByUser(userId:number){
    return this.prismaService.booking.findMany({
      where:{userId:userId}
    })
  }

  async createVenueBooking(payload:VenueBookingDto) {
     return this.createBooking(payload);
  }

  async createUserBooking(payload:UserBookingDto) {

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
      const bookingTime = parseInt(startingTime.replace('.', ''),10);
      //check if booking time is within operating hours
      if (closingTime < bookingTime + 100) {
        return 'invalid time exceeds closing Time';
      } else if (openingTime > bookingTime) {
        return 'invalid time ';
      }
    }
    return this.prismaService.booking.create({
      data: payload,
    });
  }
}

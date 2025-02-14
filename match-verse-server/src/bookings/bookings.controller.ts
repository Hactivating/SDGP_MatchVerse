import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { UserBookingDto } from './dto/user-booking.dto';
import { VenueBookingDto } from './dto/venue-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingService: BookingsService) {}

  //Date has to be sent in the format of YYYY-MM-DD
  @Get(':courtId/:date')
  getBookings(@Param('courtId') courtId: string, @Param('date') date: string) {
    return this.bookingService.getBookings(parseInt(courtId, 10), date);
  }

  @Get(':userId')
  getBookingsByUser(@Param('userId') userId: string) {
    return this.bookingService.getBookingsByUser(+userId);
  }

  //Date has to be sent in the format of YYYY-MM-DD
  //Starting Time has to be sent in the format of HH:MM with no leading zeroes

  //manual bookings by the venue
  @Post()
  createVenueBooking(@Body() payload: VenueBookingDto) {
    console.log('34343');

    return this.bookingService.createVenueBooking(payload);
  }


  //bookings by users through the app
  @Post('/user')
  createUserBooking(@Body() payload: UserBookingDto) {
    console.log('sdds34343');

    return this.bookingService.createUserBooking(payload);
  }
}

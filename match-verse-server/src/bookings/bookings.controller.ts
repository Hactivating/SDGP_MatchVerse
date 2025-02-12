import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingService:BookingsService){}

    //Date has to be sent in the format of YYYY-MM-DD
    @Get(':courtId/:date')
    getBookings(@Param('courtId') courtId:string,@Param('date') date:string){
        return this.bookingService.getBookings(parseInt(courtId,10),date);
    }

    //Date has to be sent in the format of YYYY-MM-DD
    //Starting Time has to be sent in the format of HH:MM with no leading zeroes
    @Post()
    createBooking(@Body()payload:CreateBookingDto){
        return this.bookingService.createBooking(payload);

    }
}

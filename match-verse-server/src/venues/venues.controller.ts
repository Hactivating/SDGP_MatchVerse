import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { VenuesService } from './venues.service';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Controller('venues')
export class VenuesController {
  constructor(private venuesService: VenuesService) {}

  @Get()
  getAllVenues() {
    return this.venuesService.getAllVenues();
  }

  //Create A New Venue
  @Post()
  createNewVenue(@Body() payload: CreateVenueDto) {
    return this.venuesService.createNewVenue(payload);
  }
  //Update existing venue by passing in Id and update details
  @Put(':id')
  updateVenue(@Param('id') id: string, @Body() payload: UpdateVenueDto) {
    return this.venuesService.updateVenue(parseInt(id, 10), payload);
  }
  //Delete existing venue by passing in id
  @Delete(':id')
  deleteVenue(@Param('id') id: string) {
    return this.venuesService.deleteVenue(parseInt(id, 10));
  }
}

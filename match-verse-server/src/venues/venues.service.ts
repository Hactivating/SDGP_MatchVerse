import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateVenueDto } from './dto/update-venue.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  //return all avaialble venues
  async getAllVenues() {
    return this.prisma.venue.findMany();
  }
  //get specifc venue by passing in email
  async getVenueByEmail(email: string) {
    const venue = await this.prisma.venue.findFirst({
      where: { email: email },
    });
    if (!venue) {
      //throw error if email not found
      throw new NotFoundException('Venue with this email does not exist');
    } else return venue;
  }

  async createNewVenue(payload: CreateVenueDto) {
    const SALT = await bcrypt.genSalt(); // generate random salt
    const password = await bcrypt.hash(payload.password, SALT); //hashpassword 0
    payload.password = password;
    //save venue details with hash password
    return this.prisma.venue.create({
      data: payload,
    });
  }

  async updateVenue(id: number, payload: UpdateVenueDto) {
    if (payload.password) {
      const SALT = await bcrypt.genSalt(); // generate random salt
      const password = await bcrypt.hash(payload.password, SALT);
      payload.password = password;
    }

    return this.prisma.venue.update({
      where: { venueId: id },
      data: payload,
    });
  }

  async deleteVenue(id: number) {
    return this.prisma.venue.delete({
      where: { venueId: id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateVenueDto } from './dto/update-venue.dto';
import * as bcrypt from 'bcrypt';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class VenuesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

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

  async addImageToVenue(file: Express.Multer.File, id: number) {
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);

    return await this.prisma.venue.update({
      where: { venueId: id },
      data: { venueImageUrl: imageUrl },
    });
  }

  async rateVenue(id: number, payload) {
    const existingRating = await this.prisma.venue.findFirst({
      where: { venueId: id },
    });

    const existingUserRating = await this.prisma.userVenueRating.findFirst({
      where: { venueId: id, userId: payload.userId },
    });

    if (existingRating && !existingUserRating) {
      const totalRating = 1 + existingRating.totalRating;
      const venueRating =
        payload.rating + existingRating.rating * existingRating.totalRating;
      const updatedRating = venueRating / totalRating;

      const data = {
        userId: payload.userId,
        venueId: id,
        rating: payload.rating,
      };

      const userRating = await this.prisma.userVenueRating.create({
        data: data,
      });

      const updated = await this.prisma.venue.update({
        where: { venueId: id },
        data: { rating: updatedRating, totalRating: totalRating },
      });

      return updated;
    }

    if (existingRating && existingUserRating) {
      const totalRating = existingRating.totalRating;
      const venueRating =
        payload.rating +
        existingRating.rating * existingRating.totalRating -
        existingUserRating.rating;
      const updatedRating = venueRating / totalRating;

      const data = {
        userId: payload.userId,
        venueId: id,
        rating: payload.rating,
      };

      const userRating = await this.prisma.userVenueRating.update({
        where: { userRatingId: existingUserRating.userRatingId },
        data: data,
      });

      const updated = await this.prisma.venue.update({
        where: { venueId: id },
        data: { rating: updatedRating, totalRating: totalRating },
      });

      return updated;
    }
  }
}

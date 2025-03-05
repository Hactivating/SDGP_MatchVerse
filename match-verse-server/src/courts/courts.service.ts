import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class CourtsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async getAllCourts() {
    return this.prisma.court.findMany();
  }

  async getCourtById(id: number) {
    const court = await this.prisma.court.findUnique({
      where: { courtId: id },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }
    return court;
  }

  async createCourt(payload: CreateCourtDto) {
    return this.prisma.court.create({
      data: payload, //inserts payload(request body in DB as a query)
    });
  }

  async deleteCourt(id: number) {
    return this.prisma.court.delete({
      where: { courtId: id },
    });
  }

  async addImagesToCourt(file: Express.Multer.File, id: number) {
    console.log('here in service');
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl= await this.s3Service.uploadFile(file, key);
    return imageUrl;
    
  }
}

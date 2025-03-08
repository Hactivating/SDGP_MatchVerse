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

  async addImagesToCourt(files: Express.Multer.File[], id: number) {
    console.log('here in service');

    const uploadedUrls: {
      courtId: number;
      courtImageId: number;
      imageUrl: string;
    }[] = [];

    //loop through the files and upload them to database one by one
    for (const file of files) {
      const key = `${file.fieldname ?? `${id}image`}${Date.now()}`;
      const imageUrl = await this.s3Service.uploadFile(file, key);

      if (imageUrl) {
        const uploadedUrl = await this.prisma.courtImage.create({
          data: {
            courtId: id,
            imageUrl: imageUrl,
          },
        });

        uploadedUrls.push(uploadedUrl);
      }
    }
    return uploadedUrls;
  }
}

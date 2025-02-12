import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';




@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) { }

  async getAllCourts() {
    return this.prisma.court.findMany();
  }

  async getCourtById(id: number) {
    const court = await this.prisma.court.findUnique({
      where: { courtId: id },
    });

    if (!court) {
      throw new NotFoundException('Court not found')
    }
    return court;
  }


  async createCourt(payload: CreateCourtDto) {
    return this.prisma.court.create({
      data: payload,   //inserts payload(request body in DB as a query)
    });

  }

  async deleteCourt(id: number) {
    return this.prisma.court.delete({
      where: { courtId: id },
    });
  }



}


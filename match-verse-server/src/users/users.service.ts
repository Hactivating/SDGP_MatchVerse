import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,
    private s3Service: S3Service
  ) {}

  //return all avaialble venues
  async getAllUsers() {
    return this.prisma.user.findMany();
  }
  //get specifc venue by passing in email
  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });
    if (!user) {
      //throw error if email not found
      throw new NotFoundException('User with this email does not exist');
    } else return user;
  }
  async getUserByEmailGoogle(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });
    return user;
  }

  async createNewUser(payload) {
    const SALT = await bcrypt.genSalt(); // generate random salt
    const password = await bcrypt.hash(payload.password, SALT); //hashpassword 0
    payload.password = password;
    payload.rank = "Beginner 01";
    payload.rankPoints = 0;
    //save venue details with hash password
    return this.prisma.user.create({
      data: payload,
    });
  }

  async updateUser(id, payload) {
    if (payload.password) {
      const SALT = await bcrypt.genSalt(); // generate random salt
      const password = await bcrypt.hash(payload.password, SALT);
      payload.password = password;
    }

    return this.prisma.user.update({
      where: { userId: id },
      data: payload,
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { userId: id },
    });
  }

  async addImageToVenue(file: Express.Multer.File, id: number) {
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);

    return await this.prisma.user.update({
      where: { userId: id },
      data: { userImageUrl: imageUrl },
    });
  }
}

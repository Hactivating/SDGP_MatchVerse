import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async createNewUser(payload) {
    const SALT = await bcrypt.genSalt(); // generate random salt
    const password = await bcrypt.hash(payload.password, SALT); //hashpassword 0
    payload.password = password;
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
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { VenuesService } from 'src/venues/venues.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private venuesService: VenuesService,
    private usersService: UsersService,
    private prismaService: PrismaService,
  ) {}

  async validate(email: string, password: string, type: string) {
    let details;

    if (type === 'user') {
      details = await this.usersService.getUserByEmail(email);
    } else if (type === 'venue') {
      // get relevant details of the entered email
      details = await this.venuesService.getVenueByEmail(email);
    } else {
      throw new UnauthorizedException('Wrong Type');
    }
    //check if passwords match
    const authorized = await bcrypt.compare(password, details.password);

    if (authorized) {
      if (type === 'user') {
        return details.userId;
      } else {
        return details.venueId;
      } //return details if passwords match
    } else {
      //throw exception if password dont match
      throw new UnauthorizedException('Wrong password');
    }
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    console.log(req.user);

    let user = await this.usersService.getUserByEmailGoogle(req.user.email);
    console.log('here');

    if (!user) {
      console.log('user does not exist');
      await this.prismaService.user.create({
        data: { username: req.user.email, email: req.user.email, password: '' },
      });
    }
    return user;
  }
}

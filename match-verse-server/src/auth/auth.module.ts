import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VenuesService } from '../venues/venues.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [PassportModule],
  providers: [AuthService,VenuesService,PrismaService,LocalStrategy,UsersService],
  controllers: [AuthController],
})
export class AuthModule {}

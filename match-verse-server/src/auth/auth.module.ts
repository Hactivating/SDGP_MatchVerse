import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VenuesService } from 'src/venues/venues.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [PassportModule],
  providers: [AuthService,VenuesService,PrismaService,LocalStrategy],
})
export class AuthModule {}

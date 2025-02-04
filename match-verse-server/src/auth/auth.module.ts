import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { VenuesService } from 'src/venues/venues.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AuthService,VenuesService,PrismaService],
  controllers: [AuthController]
})
export class AuthModule {}

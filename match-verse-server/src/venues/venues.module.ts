import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [VenuesService, PrismaService],
  controllers: [VenuesController],
  exports: [VenuesService],
})
export class VenuesModule {}

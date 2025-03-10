import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  providers: [VenuesService, PrismaService, S3Service],
  controllers: [VenuesController],
  exports: [VenuesService],
})
export class VenuesModule {}

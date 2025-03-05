import { Module } from '@nestjs/common';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  controllers: [CourtsController],
  providers: [CourtsService, PrismaService,S3Service],
  exports: [CourtsService],
})
export class CourtsModule { }

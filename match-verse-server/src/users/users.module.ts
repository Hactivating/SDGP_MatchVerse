import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  providers: [UsersService,PrismaService,S3Service],
  controllers: [UsersController]
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AchievementsService, PrismaService],
  imports: [PrismaModule],
  exports: [AchievementsService],

})
export class AchievementsModule { }

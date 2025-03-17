import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeaderboardDto } from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getSortedUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        rankPoints: 'desc',
      },
      select: {
        userId: true,
        username: true,
        rankPoints: true,
      },
    });

    return users.map(user => new LeaderboardDto({
      id: user.userId,
      username: user.username,
      score: user.rankPoints,
    }));
  }
}
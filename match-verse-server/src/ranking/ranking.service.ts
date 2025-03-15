import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  private calculatePoints(rankPoints: number, isWinner: boolean): number {
    if (rankPoints < 500) return isWinner ? 125 : -50;
    if (rankPoints < 1000) return isWinner ? 100 : -75;
    if (rankPoints < 1500) return isWinner ? 100 : -100;
    if (rankPoints < 2000) return isWinner ? 50 : -100;
    if (rankPoints < 2500) return isWinner ? 50 : -125;
    if (rankPoints < 3000) return isWinner ? 25 : -125; 
    if (rankPoints < 3500) return isWinner ? 25 : -135; 
    if (rankPoints < 4000) return isWinner ? 20 : -135; 
    return isWinner ? 20 : -250;
  }

  async updateUserRanking(
    winner1Id: number,
    winner2Id: number,
    loser1Id: number,
    loser2Id: number
  ) {
    await this.updateUserPoints(winner1Id, true);
    await this.updateUserPoints(winner2Id, true);
    await this.updateUserPoints(loser1Id, false);
    await this.updateUserPoints(loser2Id, false);
  }

  private async updateUserPoints(userId: number, isWinner: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) throw new Error('User not found!');

    const pointsChange = this.calculatePoints(user.rankPoints, isWinner);
    const newRankPoints = user.rankPoints + pointsChange;

    if (newRankPoints < 0) {
      throw new Error('User has insufficient points!');
    }

    let newRank = user.rank;
    if (newRankPoints >= 0 && newRankPoints < 500) newRank = 'Beginner 01';
    else if (newRankPoints >= 500 && newRankPoints < 1000) newRank = 'Beginner 02';
    else if (newRankPoints >= 1000 && newRankPoints < 1500) newRank = 'Beginner 03';
    else if (newRankPoints >= 1500 && newRankPoints < 2000) newRank = 'Intermediate 01';
    else if (newRankPoints >= 2000 && newRankPoints < 2500) newRank = 'Intermediate 02';
    else if (newRankPoints >= 2500 && newRankPoints < 3000) newRank = 'Intermediate 03';
    else if (newRankPoints >= 3000 && newRankPoints < 3500) newRank = 'Expert 01';
    else if (newRankPoints >= 3500 && newRankPoints < 4000) newRank = 'Expert 02';
    else if (newRankPoints >= 4000 && newRankPoints < 4500) newRank = 'Expert 03';

    await this.prisma.user.update({
      where: { userId },
      data: {
        rankPoints: newRankPoints,
        rank: newRank,
      },
    });
  }
}

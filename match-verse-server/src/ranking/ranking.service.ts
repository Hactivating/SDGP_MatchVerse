import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RankingService {
    constructor (private prisma: PrismaService){}

    private getRankPoints(points: number): string {
        if (points < 500) return "Beginner 1";
        if (points < 1000) return "Beginner 2";
        if (points < 1500) return "Beginner 3";
        if (points < 2000) return "Intermediate 1";
        if (points < 2500) return "Intermediate 2";
        if (points < 3000) return "Intermediate 3";
        if (points < 3500) return "Expert 1";
        if (points < 4000) return "Expert 2";
        return "Expert 3";
    }

    private getPointsChanged(points: number,isWinner: boolean): number{
        if (points < 500) return isWinner ? 125 : -50;
        if (points < 1000) return isWinner ? 100 : -75;
        if (points < 1500) return isWinner ? 100 : -100;
        if (points < 2000) return isWinner ? 50 : -100;
        if (points < 2500) return isWinner ? 50 : -125;
        if (points < 3000) return isWinner ? 25 : -125;
        if (points < 3500) return isWinner ? 25 : -135;
        if (points < 4000) return isWinner ? 20 : -135;
        return isWinner ? 20 : -250;
    }

    async updateUserRanking(userId: number, isWinner: boolean){
        const user = await this.prisma.user.findunique({
            where: { userId },
            select: { rankPoints: true},
        });

        if (!user){
            throw new Error(`User with ID ${userId} not found`);
        }

        const pointsChange = this.getPointsChanged(user.rankPoints, isWinner);
        const newRankPoints = Math.max(0, user.rankPoints + pointsChange);
        const newRank = this.getRankPoints(newRankPoints);

        await this.prisma.user.update({
            where: { userId },
            data: { rankPoints: newRankPoints, rank: newRank}
        });

        return `User ${userId} updated to ${newRank} with ${newRankPoints} points`;
    }
}

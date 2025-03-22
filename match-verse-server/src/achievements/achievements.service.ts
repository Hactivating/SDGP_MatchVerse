import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementsService {
    constructor(private prisma: PrismaService) { }

    async updateUserAchievements(userId: number, isWinner: boolean) {
        const user = await this.prisma.user.findUnique({ where: { userId } });

        if (!user) throw new NotFoundException('User not found');

        let updatedData: any = { gamesPlayed: user.gamesPlayed + 1 };
        if (isWinner) updatedData.gamesWon = user.gamesWon + 1;

        let newAchivements = [...user.achievements];

        if (updatedData.gamesPlayed === 10 && !newAchivements.includes('Played 10 games')) {
            newAchivements.push('Played 10 games');
        }

        if (updatedData.gamesWon === 5 && !newAchivements.includes('Won 5 games')) {
            newAchivements.push('Won 5 games')
        }

        updatedData.achievements = newAchivements;

        await this.prisma.user.update({
            where: { userId },
            data: updatedData,
        });

        return newAchivements;

    }

    async getUserAchievements(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
            select: { achievements: true },
        });

        if (!user) throw new NotFoundException('User not found');

        return user.achievements
    }



}

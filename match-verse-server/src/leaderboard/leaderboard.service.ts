import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeaderboardDto } from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
    constructor (private prisma: PrismaService) {}

    async getSortedUsers() {
        const users = await this.prisma.user.findMany({
            orderBy:{
                id:"asc"
            },
            select: {
                id: true,
                username: true
            },
                
        });

        return users.map(user => new LeaderboardDto(user));
    }
}

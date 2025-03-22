import { Controller, Get, Param } from '@nestjs/common';
import { AchievementsService } from './achievements.service';


@Controller('achievements')
export class AchievementsController {
    constructor(private achievmentsService: AchievementsService) { }

    @Get(':userId')
    async getUserAchievements(@Param('userId') userId: number) {
        return this.achievmentsService.getUserAchievements(userId);
    }
}

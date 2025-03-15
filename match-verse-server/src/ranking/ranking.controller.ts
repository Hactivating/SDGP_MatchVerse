import { Controller, Post, Body } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post('update')
  async updateRanking(@Body() body: { winner1Id: number; winner2Id: number; loser1Id: number; loser2Id: number }) {
    return this.rankingService.updateUserRanking(body.winner1Id, body.winner2Id, body.loser1Id, body.loser2Id);
  }
}

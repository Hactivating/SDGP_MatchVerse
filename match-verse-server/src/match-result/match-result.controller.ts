import { Controller, Post, Param, Body } from '@nestjs/common';
import { MatchResultService } from './match-result.service';

@Controller('match-result')
export class MatchResultController {
  constructor(private matchResultService: MatchResultService) {}

  @Post('submit-winners/:matchId')
  async submitMatchWinners(
    @Param('matchId') matchId: number,
    @Body() { winner1Id, winner2Id }: { winner1Id: number; winner2Id: number }
  ) {
    return this.matchResultService.submitMatchWinners(matchId, winner1Id, winner2Id);
  }
}
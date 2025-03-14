import { Controller, Post, Body, Param } from '@nestjs/common';
import { MatchResultService } from './match-result.service';
import { CreateMatchResultDto } from './dto/create-match-result.dto';

@Controller('match-result')
export class MatchResultController {
    constructor(private matchResultService: MatchResultService) {}

    @Post('submit-winners/:matchId/:voterId')
    submitMatchWinners(
        @Param('matchId') matchId: number,
        @Param('voterId') voterId: number,
        @Body() body: CreateMatchResultDto
    ) {
        return this.matchResultService.submitMatchWinners(
            matchId, 
            voterId, 
            body.winner1Id, 
            body.winner2Id
        );
    }
}